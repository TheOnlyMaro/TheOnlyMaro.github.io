import * as THREE from 'three';
import { PortalHalo } from './portalHalo.js';

export class PortalSystem extends THREE.Object3D {
  constructor() {
    super();

    this.blueHalo = new PortalHalo(0x0000ff);
    this.orangeHalo = new PortalHalo(0xff6600);

    this.add(this.blueHalo.mesh);
    this.add(this.orangeHalo.mesh);

    this.currentPortal = 'blue';

    this.bluePortalActive = false;
    this.orangePortalActive = false;
    this.bluePortalData = null;
    this.orangePortalData = null;

    // FIXED: Store bound function for cleanup
    this.keyHandler = (e) => {
      if (e.key === 'q' || e.key === 'Q') this.currentPortal = 'blue';
      if (e.key === 'e' || e.key === 'E') this.currentPortal = 'orange';
    };
    window.addEventListener('keydown', this.keyHandler);
    // Initialize halo glow visibility based on initial portal states
    this.updateHaloGlowState = this.updateHaloGlowState?.bind(this) || this.updateHaloGlowState;
    if (this.updateHaloGlowState) this.updateHaloGlowState();
  }

  update(hitInfo) {
    // Ensure inner glow state is kept in sync every frame
    if (this.updateHaloGlowState) this.updateHaloGlowState();
    if (!hitInfo) {
      if (this.currentPortal === 'blue' && !this.bluePortalActive) {
        this.blueHalo.setVisible(false);
      }
      if (this.currentPortal === 'orange' && !this.orangePortalActive) {
        this.orangeHalo.setVisible(false);
      }
      return;
    }

    const halo = this.currentPortal === 'blue' ? this.blueHalo : this.orangeHalo;
    const isActive = this.currentPortal === 'blue' ? this.bluePortalActive : this.orangePortalActive;
    if (!isActive) {
      halo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
      halo.setVisible(true);
    }
  }


  placePortal(hitInfo) {
    if (!hitInfo) return;

    // --- 1. OVERLAP PREVENTION FIX ---
    // If the OTHER portal is active, check the distance.
    let otherPortalPoint = null;
    if (this.currentPortal === 'blue' && this.orangePortalActive && this.orangePortalData) {
        otherPortalPoint = this.orangePortalData.point;
    } else if (this.currentPortal === 'orange' && this.bluePortalActive && this.bluePortalData) {
        otherPortalPoint = this.bluePortalData.point;
    }

    // If portals would overlap (distance < 2.0 meters), CANCEL placement.
    if (otherPortalPoint) {
        const dist = hitInfo.point.distanceTo(otherPortalPoint);
        if (dist < 2.5) {
            console.warn("⚠️ Portals too close! Placement cancelled.");
            return null; // Stop here
        }
    }
    // ---------------------------------

    if (this.currentPortal === 'blue') {
      this.blueHalo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
      this.blueHalo.setVisible(true);
      this.updateHaloGlowState();
      this.bluePortalActive = true;
      this.bluePortalData = {
        point: hitInfo.point.clone(),
        normal: hitInfo.normal.clone(),
        object: hitInfo.object
      };
      return 'blue'; // Return which portal was placed
    } else {
      this.orangeHalo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
      this.orangeHalo.setVisible(true);
      this.updateHaloGlowState();
      this.orangePortalActive = true;
      this.orangePortalData = {
        point: hitInfo.point.clone(),
        normal: hitInfo.normal.clone(),
        object: hitInfo.object
      };
      return 'orange';
    }
  }

  updateHaloGlowState() {
    // When both portals are active, hide the translucent inner glow to avoid
    // showing a filled colored circle inside the portal. Otherwise keep it visible.
    const hideInner = this.bluePortalActive && this.orangePortalActive;
    if (this.blueHalo && this.blueHalo.glowMesh) this.blueHalo.glowMesh.visible = !hideInner;
    if (this.orangeHalo && this.orangeHalo.glowMesh) this.orangeHalo.glowMesh.visible = !hideInner;
  }

  // ADDED: Cleanup method
  dispose() {
    window.removeEventListener('keydown', this.keyHandler);
  }
}