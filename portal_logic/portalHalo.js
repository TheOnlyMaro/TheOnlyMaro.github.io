import * as THREE from 'three';

export class PortalHalo {
  constructor(color = 0x0000ff, radius = 0.7, thickness = 0.1) {
    const geometry = new THREE.RingGeometry(radius, radius + thickness, 64);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2; // default orientation
    this.mesh.visible = false;
    this.mesh.position.y += 0.01;
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  setPositionAndOrientation(position, normal) {
    this.mesh.position.copy(position);
    const offset = normal.clone().multiplyScalar(0.01);
    
    // Orient ring perpendicular to surface normal
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), // default normal of ring
      normal
    );
    this.mesh.quaternion.copy(quaternion);
  }
}
