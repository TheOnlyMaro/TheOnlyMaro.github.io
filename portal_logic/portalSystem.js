import * as THREE from 'three';
import { PortalHalo } from './portalHalo.js';

export class PortalSystem extends THREE.Object3D {
  constructor() {
    super(); // make this an Object3D

    // Create halos
    this.blueHalo = new PortalHalo(0x0000ff);
    this.orangeHalo = new PortalHalo(0xff6600);

    // Add halos as children of this Object3D
    this.add(this.blueHalo.mesh);
    this.add(this.orangeHalo.mesh);

    this.currentPortal = 'blue';

    // Keyboard switching
    window.addEventListener('keydown', (e) => {
      if (e.key === 'q') this.currentPortal = 'blue';
      if (e.key === 'e') this.currentPortal = 'orange';
    });
  }

  update(hitInfo) {
    if (!hitInfo) {
      this.blueHalo.setVisible(false);
      this.orangeHalo.setVisible(false);
      return;
    }

    const halo = this.currentPortal === 'blue' ? this.blueHalo : this.orangeHalo;
    halo.setPositionAndOrientation(hitInfo.point, hitInfo.normal);

    this.blueHalo.setVisible(this.currentPortal === 'blue');
    this.orangeHalo.setVisible(this.currentPortal === 'orange');
  }
}
