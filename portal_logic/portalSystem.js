// // portalSystem.js
// import * as THREE from 'three';
// import { PortalHalo } from './portalHalo.js';

// export class PortalSystem extends THREE.Object3D {
//   constructor() {
//     super(); // keep Object3D

//     // Create halos
//     this.blueHalo = new PortalHalo(0x0000ff);
//     this.orangeHalo = new PortalHalo(0xff6600);

//     // Add halos as children
//     this.add(this.blueHalo.mesh);
//     this.add(this.orangeHalo.mesh);

//     // Current selected portal
//     this.currentPortal = 'blue';

//     // NEW: track active portals and store their data for teleportation
//     this.bluePortalActive = false;
//     this.orangePortalActive = false;
//     this.bluePortalData = null;
//     this.orangePortalData = null;

//     // Keyboard switching
//     window.addEventListener('keydown', (e) => {
//       if (e.key === 'q' || e.key === 'Q') this.currentPortal = 'blue';
//       if (e.key === 'e' || e.key === 'E') this.currentPortal = 'orange';
//     });
//   }

//   update(hitInfo) {
//     if (!hitInfo) {
//       // OLD: hide halos
//       // NEW: only hide preview if portal not placed
//       if (this.currentPortal === 'blue' && !this.bluePortalActive) {
//         this.blueHalo.setVisible(false);
//       }
//       if (this.currentPortal === 'orange' && !this.orangePortalActive) {
//         this.orangeHalo.setVisible(false);
//       }
//       return;
//     }

//     // Show preview halo at hit location if portal not placed
//     const halo = this.currentPortal === 'blue' ? this.blueHalo : this.orangeHalo;
//     const isActive = this.currentPortal === 'blue' ? this.bluePortalActive : this.orangePortalActive;
//     if (!isActive) {
//       halo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
//       halo.setVisible(true);
//     }
//   }

//   // NEW: Place portal in world (called on click)
//   placePortal(hitInfo) {
//     if (!hitInfo) return;

//     if (this.currentPortal === 'blue') {
//       this.blueHalo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
//       this.blueHalo.setVisible(true);
//       this.bluePortalActive = true;
//       this.bluePortalData = {
//         point: hitInfo.point.clone(),
//         normal: hitInfo.normal.clone(),
//         object: hitInfo.object
//       };
//     } else {
//       this.orangeHalo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
//       this.orangeHalo.setVisible(true);
//       this.orangePortalActive = true;
//       this.orangePortalData = {
//         point: hitInfo.point.clone(),
//         normal: hitInfo.normal.clone(),
//         object: hitInfo.object
//       };
//     }
//   }

// }


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
  }

  update(hitInfo) {
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

    if (this.currentPortal === 'blue') {
      this.blueHalo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);
      this.blueHalo.setVisible(true);
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
      this.orangePortalActive = true;
      this.orangePortalData = {
        point: hitInfo.point.clone(),
        normal: hitInfo.normal.clone(),
        object: hitInfo.object
      };
      return 'orange';
    }
  }
  
  // ADDED: Cleanup method
  dispose() {
    window.removeEventListener('keydown', this.keyHandler);
  }
}