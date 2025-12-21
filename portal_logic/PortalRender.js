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
    this.blueCamera = new PortalCamera();
    this.orangeCamera = new PortalCamera();
    
    // Portal display components
    this.bluePortalMesh = null;
    this.orangePortalMesh = null;
    this.blueStencilMask = null;
    this.orangeStencilMask = null;
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
    
    // Create new portal mesh
    const mesh = new PortalMesh(renderTarget, 3, 4);
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
    
    // Disable environment map for portal renders
    const originalEnvironment = this.scene.environment;
    const originalBackground = this.scene.background;
    this.scene.environment = null;
    this.scene.background = new THREE.Color(0x000000);
    
    // === Render Blue Portal View (what you see through blue portal) ===
    this.renderPortalView(
      playerCamera,
      bluePortalData,
      orangePortalData,
      this.orangeCamera,
      this.orangeRenderTarget,
      this.orangePortalMesh,
      this.orangeStencilMask
    );
    
    // === Render Orange Portal View (what you see through orange portal) ===
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
    this.scene.environment = originalEnvironment;
    this.scene.background = originalBackground;
    
    // Reset to default render target
    this.renderer.setRenderTarget(null);
  }
  
  /**
   * Helper to render a single portal view
   */
  renderPortalView(playerCamera, sourcePortal, destPortal, portalCamera, renderTarget, portalMesh, stencilMask) {
    // Hide the destination portal to prevent recursion
    const meshVisible = portalMesh ? portalMesh.mesh.visible : false;
    const maskVisible = stencilMask ? stencilMask.mesh.visible : false;
    
    if (portalMesh) portalMesh.setVisible(false);
    if (stencilMask) stencilMask.setVisible(false);
    
    // Update portal camera
    portalCamera.updateFromPortals(
      playerCamera.position,
      playerCamera.quaternion,
      sourcePortal,
      destPortal
    );
    
    // Render to target
    this.renderer.setRenderTarget(renderTarget);
    this.renderer.clear(true, true, true); // Clear color, depth, and stencil
    this.renderer.render(this.scene, portalCamera.camera);
    
    // Restore visibility
    if (portalMesh) portalMesh.setVisible(meshVisible);
    if (stencilMask) stencilMask.setVisible(maskVisible);
  }
  
  /**
   * Update portal positions when moved
   */
  updatePortalMeshes(bluePortalData, orangePortalData, blueActive, orangeActive) {
    if (blueActive && bluePortalData) {
      this.createPortalComponents(bluePortalData, this.orangeRenderTarget, true);
    }
    if (orangeActive && orangePortalData) {
      this.createPortalComponents(orangePortalData, this.blueRenderTarget, false);
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
