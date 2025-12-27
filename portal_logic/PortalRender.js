import * as THREE from 'three';
import { PortalStencilMask } from './PortalStencilMask.js';
import { PortalMesh } from './PortalMesh.js';
import { PortalCamera } from './PortalCamera.js';

export class PortalRenderer {
  constructor(renderer, scene, mainCamera) {
    this.renderer = renderer;
    this.scene = scene;
    this.mainCamera = mainCamera;

    // CRITICAL: Enable stencil buffer in main renderer
    const gl = renderer.getContext();
    if (gl.getContextAttributes().stencil === false) {
      console.warn('Stencil buffer not available - portal clipping will not work');
    }

    // Render targets with stencil buffer enabled
    const renderTargetSize = 512;
    const rtOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: true,
      depthBuffer: true
    };

    this.blueRenderTarget = new THREE.WebGLRenderTarget(renderTargetSize, renderTargetSize, rtOptions);
    this.orangeRenderTarget = new THREE.WebGLRenderTarget(renderTargetSize, renderTargetSize, rtOptions);

    // Portal cameras
    this.blueCamera = new PortalCamera(mainCamera);
    this.orangeCamera = new PortalCamera(mainCamera);

    // Portal display components
    this.bluePortalMesh = null;
    this.orangePortalMesh = null;
    this.blueStencilMask = null;
    this.orangeStencilMask = null;
  }

  /**
   * Update resolution for shaders
   */
  setSize(width, height) {
    if (this.bluePortalMesh) this.bluePortalMesh.setSize(width, height);
    if (this.orangePortalMesh) this.orangePortalMesh.setSize(width, height);
  }

  /**
   * Create portal display components (mesh + stencil mask)
   */
  createPortalComponents(portalData, renderTarget, isBlue) {
    // Remove old components
    if (isBlue) {
      if (this.bluePortalMesh) {
        this.scene.remove(this.bluePortalMesh.mesh);
        this.bluePortalMesh.dispose();
      }
      if (this.blueStencilMask) {
        this.scene.remove(this.blueStencilMask.mesh);
        this.blueStencilMask.dispose();
      }
    } else {
      if (this.orangePortalMesh) {
        this.scene.remove(this.orangePortalMesh.mesh);
        this.orangePortalMesh.dispose();
      }
      if (this.orangeStencilMask) {
        this.scene.remove(this.orangeStencilMask.mesh);
        this.orangeStencilMask.dispose();
      }
    }

    // Create new stencil mask
    const mask = new PortalStencilMask(1.0, 0.15);
    mask.setPositionAndOrientation(portalData.point, portalData.normal);
    this.scene.add(mask.mesh);

    // Create new portal mesh with screen-space shader
    const mesh = new PortalMesh(renderTarget);
    mesh.setPositionAndOrientation(portalData.point, portalData.normal);
    this.scene.add(mesh.mesh);

    if (isBlue) {
      this.blueStencilMask = mask;
      this.bluePortalMesh = mesh;
    } else {
      this.orangeStencilMask = mask;
      this.orangePortalMesh = mesh;
    }
  }

  /**
   * Render portal views
   */
  render(playerCamera, bluePortalData, orangePortalData, blueActive, orangeActive) {
    // Only render if both portals active
    if (!blueActive || !orangeActive || !bluePortalData || !orangePortalData) {
      return;
    }

    // Create portal components if needed
    if (!this.bluePortalMesh) {
      this.createPortalComponents(bluePortalData, this.orangeRenderTarget, true);
    }
    if (!this.orangePortalMesh) {
      this.createPortalComponents(orangePortalData, this.blueRenderTarget, false);
    }

    // Temporarily hide environment to avoid clutter in portal view
    // const originalEnvironment = this.scene.environment;
    // const originalBackground = this.scene.background;
    // this.scene.environment = null;
    // this.scene.background = new THREE.Color(0x000000);

    // === Render Blue Portal View ===
    this.renderPortalView(
      playerCamera,
      bluePortalData,
      orangePortalData,
      this.orangeCamera,
      this.orangeRenderTarget,
      this.orangePortalMesh,
      this.orangeStencilMask
    );

    // === Render Orange Portal View ===
    this.renderPortalView(
      playerCamera,
      orangePortalData,
      bluePortalData,
      this.blueCamera,
      this.blueRenderTarget,
      this.bluePortalMesh,
      this.blueStencilMask
    );

    // Restore scene settings
    // this.scene.environment = originalEnvironment;
    // this.scene.background = originalBackground;

    // Reset to default render target
    this.renderer.setRenderTarget(null);
  }

  /**
   * Helper to render a single portal view
   */
  renderPortalView(playerCamera, sourcePortal, destPortal, portalCamera, renderTarget, portalMesh, stencilMask) {
    // Hide BOTH portal meshes to avoid recursion and self-occlusion
    const blueVisible = this.bluePortalMesh ? this.bluePortalMesh.mesh.visible : false;
    const orangeVisible = this.orangePortalMesh ? this.orangePortalMesh.mesh.visible : false;

    if (this.bluePortalMesh) this.bluePortalMesh.setVisible(false);
    if (this.orangePortalMesh) this.orangePortalMesh.setVisible(false);
    // Masks can stay visible as they don't block virtual camera usually

    // Update portal camera with advanced oblique projection
    portalCamera.updateFromPortals(
      playerCamera,
      sourcePortal,
      destPortal
    );

    // Render to target
    const originalClearColor = new THREE.Color();
    this.renderer.getClearColor(originalClearColor);
    const originalClearAlpha = this.renderer.getClearAlpha();

    this.renderer.setRenderTarget(renderTarget);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.clear(true, true, true);
    this.renderer.render(this.scene, portalCamera.camera);

    // Restore renderer state
    this.renderer.setClearColor(originalClearColor, originalClearAlpha);

    // Restore visibility
    if (this.bluePortalMesh) this.bluePortalMesh.setVisible(blueVisible);
    if (this.orangePortalMesh) this.orangePortalMesh.setVisible(orangeVisible);
  }

  /**
   * Update portal positions when moved
   */
  updatePortalMeshes(bluePortalData, orangePortalData, blueActive, orangeActive) {
    // BLUE portal
    if (blueActive && bluePortalData) {
      this.createPortalComponents(bluePortalData, this.orangeRenderTarget, true);
    } else if (!blueActive) {
      // Remove existing blue portal components if present
      if (this.bluePortalMesh) {
        this.scene.remove(this.bluePortalMesh.mesh);
        this.bluePortalMesh.dispose();
        this.bluePortalMesh = null;
      }
      if (this.blueStencilMask) {
        this.scene.remove(this.blueStencilMask.mesh);
        this.blueStencilMask.dispose();
        this.blueStencilMask = null;
      }
    }

    // ORANGE portal
    if (orangeActive && orangePortalData) {
      this.createPortalComponents(orangePortalData, this.blueRenderTarget, false);
    } else if (!orangeActive) {
      if (this.orangePortalMesh) {
        this.scene.remove(this.orangePortalMesh.mesh);
        this.orangePortalMesh.dispose();
        this.orangePortalMesh = null;
      }
      if (this.orangeStencilMask) {
        this.scene.remove(this.orangeStencilMask.mesh);
        this.orangeStencilMask.dispose();
        this.orangeStencilMask = null;
      }
    }
  }

  /**
   * Cleanup
   */
  dispose() {
    this.blueRenderTarget.dispose();
    this.orangeRenderTarget.dispose();

    if (this.bluePortalMesh) {
      this.scene.remove(this.bluePortalMesh.mesh);
      this.bluePortalMesh.dispose();
    }
    if (this.orangePortalMesh) {
      this.scene.remove(this.orangePortalMesh.mesh);
      this.orangePortalMesh.dispose();
    }
    if (this.blueStencilMask) {
      this.scene.remove(this.blueStencilMask.mesh);
      this.blueStencilMask.dispose();
    }
    if (this.orangeStencilMask) {
      this.scene.remove(this.orangeStencilMask.mesh);
      this.orangeStencilMask.dispose();
    }
  }
}
