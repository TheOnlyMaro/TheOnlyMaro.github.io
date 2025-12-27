import * as THREE from 'three';
import { PortalHalo } from './portalHalo.js';

export class PortalSystem extends THREE.Object3D {
  constructor() {
    super();

    this.blueHalo = new PortalHalo(0x0000ff);
    this.orangeHalo = new PortalHalo(0xff6600);

    // Add both the placed halo meshes and their overlay preview meshes
    this.add(this.blueHalo.mesh);
    if (this.blueHalo.overlayMesh) this.add(this.blueHalo.overlayMesh);
    this.add(this.orangeHalo.mesh);
    if (this.orangeHalo.overlayMesh) this.add(this.orangeHalo.overlayMesh);

    this.currentPortal = 'blue';

    this.bluePortalActive = false;
    this.orangePortalActive = false;
    this.bluePortalData = null;
    this.orangePortalData = null;

    // Overlay flags control whether the placement overlay is shown for each color.
    // Start enabled so the player sees an overlay immediately.
    this.blueOverlayEnabled = true;
    this.orangeOverlayEnabled = true;

    // FIXED: Store bound function for cleanup
    this.keyHandler = (e) => {
      if (e.key === 'q' || e.key === 'Q') {
        this.currentPortal = 'blue';
        // Re-enable blue overlay when player explicitly selects blue
        this.blueOverlayEnabled = true;
        this.orangeOverlayEnabled = false;
        // Hide the other color's placement preview immediately
        if (this.orangeHalo && this.orangeHalo.setOverlayVisible) this.orangeHalo.setOverlayVisible(false);
      }
      if (e.key === 'e' || e.key === 'E') {
        this.currentPortal = 'orange';
        // Re-enable orange overlay when player explicitly selects orange
        this.orangeOverlayEnabled = true;
        this.blueOverlayEnabled = false;
        // Hide the other color's placement preview immediately
        if (this.blueHalo && this.blueHalo.setOverlayVisible) this.blueHalo.setOverlayVisible(false);
      }
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

    const isBlue = this.currentPortal === 'blue';
    const halo = isBlue ? this.blueHalo : this.orangeHalo;
    const otherHalo = isBlue ? this.orangeHalo : this.blueHalo;
    const isActive = isBlue ? this.bluePortalActive : this.orangePortalActive;
    const otherActive = isBlue ? this.orangePortalActive : this.bluePortalActive;
    const overlayEnabled = isBlue ? this.blueOverlayEnabled : this.orangeOverlayEnabled;

    // Keep placed (active) portal halo visible at its placed location
    if (isBlue) {
      if (this.bluePortalActive) this.blueHalo.setVisible(true);
      if (!this.orangePortalActive) this.orangeHalo.setVisible(false);
    } else {
      if (this.orangePortalActive) this.orangeHalo.setVisible(true);
      if (!this.bluePortalActive) this.blueHalo.setVisible(false);
    }

    // Show overlay preview independently using overlayMesh so placed portal visuals remain unchanged
    if (overlayEnabled) {
      halo.setOverlayPositionAndOrientation(hitInfo.point, hitInfo.normal);
      halo.setOverlayVisible(true);
    } else if (halo.setOverlayVisible) {
      halo.setOverlayVisible(false);
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
      // After placing, disable the placement overlay for blue until the player
      // presses Q to re-enable it (this does not affect the placed portal halo).
      this.blueOverlayEnabled = false;
      if (this.blueHalo.setOverlayVisible) this.blueHalo.setOverlayVisible(false);
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
      this.orangeOverlayEnabled = false;
      if (this.orangeHalo.setOverlayVisible) this.orangeHalo.setOverlayVisible(false);
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

  // Reset portals and re-enable overlays (used when the scene resets / player dies)
  reset() {
    this.bluePortalActive = false;
    this.orangePortalActive = false;
    this.bluePortalData = null;
    this.orangePortalData = null;
    this.blueOverlayEnabled = true;
    this.orangeOverlayEnabled = true;
    if (this.blueHalo) {
      this.blueHalo.setVisible(false);
      if (this.blueHalo.setOverlayVisible) this.blueHalo.setOverlayVisible(false);
    }
    if (this.orangeHalo) {
      this.orangeHalo.setVisible(false);
      if (this.orangeHalo.setOverlayVisible) this.orangeHalo.setOverlayVisible(false);
    }
    if (this.updateHaloGlowState) this.updateHaloGlowState();
  }
}