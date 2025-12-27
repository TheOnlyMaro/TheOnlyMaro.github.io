import * as THREE from 'three';

export class PortalHalo {
  constructor(color = 0x0000ff, radius = 1.08, thickness = 0.17) {
    // Size chosen between original and previous change: close to the portal mask
    // so there is no visible gap, but still mostly outside the portal opening.
    const geometry = new THREE.RingGeometry(radius, radius + thickness, 64);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // new: glow effect
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.visible = false;

    // Add inner glow mesh
    const glowGeometry = new THREE.RingGeometry(radius * 0.32, radius * 0.92, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(this.glowMesh);
    // Overlay mesh (placement preview) — separate from the placed portal mesh
    const overlayMaterial = material.clone();
    overlayMaterial.opacity = 0.6;
    const overlayGeometry = geometry.clone();
    this.overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
    this.overlayMesh.visible = false;
    // Slightly render on top
    this.overlayMesh.renderOrder = 999;
    // Add a subtle inner ring to the overlay for clarity
    const overlayInner = new THREE.Mesh(glowGeometry.clone(), glowMaterial.clone());
    overlayInner.material.opacity = 0.25;
    this.overlayMesh.add(overlayInner);
    this.animationTime = 0;
    this.baseRadius = radius;
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }

  setOverlayVisible(visible) {
    if (this.overlayMesh) this.overlayMesh.visible = visible;
  }

  setOverlayPositionAndOrientation(position, normal) {
    if (!this.overlayMesh) return;
    const offset = normal.clone().multiplyScalar(0.035);
    this.overlayMesh.position.copy(position).add(offset);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.overlayMesh.quaternion.copy(quaternion);
    this.overlayMesh.visible = true;
  }

  setPositionAndOrientation(position, normal) {
    const offset = normal.clone().multiplyScalar(0.035);
    this.mesh.position.copy(position).add(offset);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.mesh.quaternion.copy(quaternion);

    this.mesh.visible = true;
  }
  animate(deltaTime) {
    this.animationTime += deltaTime;
    const pulse = Math.sin(this.animationTime * 3) * 0.1 + 0.9;
    if (this.glowMesh && this.mesh.visible) {
      this.glowMesh.material.opacity = pulse * 0.3;
      this.glowMesh.rotation.z += deltaTime * 0.5;
    }
    // Animate overlay separately
    if (this.overlayMesh && this.overlayMesh.visible) {
      // rotate the overlay for a subtle motion
      this.overlayMesh.rotation.z += deltaTime * 0.6;
      // pulse overlay opacity a bit
      if (this.overlayMesh.material) this.overlayMesh.material.opacity = 0.4 + Math.sin(this.animationTime * 2) * 0.15;
    }
  }
}
