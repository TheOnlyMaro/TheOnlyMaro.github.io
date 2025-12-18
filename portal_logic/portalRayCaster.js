import * as THREE from 'three';

export class PortalRaycaster {
  constructor(maxDistance = 50, muzzleOffset = new THREE.Vector3(0.2, -0.3, -1.2)) {
    this.maxDistance = maxDistance;
    this.muzzleOffset = muzzleOffset; // relative to camera
    this.raycaster = new THREE.Raycaster();
    this.hitInfo = null;

    // Debug line
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3()
    ]);
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    this.debugRay = new THREE.Line(geometry, material);
  }

  update(camera, objects) {
    if (!camera) return;

    // --- Compute ray origin in world space ---
    const origin = this.muzzleOffset.clone().applyMatrix4(camera.matrixWorld);

    // --- Compute ray direction along camera forward ---
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction).normalize();

    // --- Cast the ray ---
    this.raycaster.set(origin, direction);
    this.raycaster.far = this.maxDistance;

    const intersects = this.raycaster.intersectObjects(objects, true);

    // --- Compute ray end ---
    const end = origin.clone().add(direction.clone().multiplyScalar(this.maxDistance));
    if (intersects.length > 0) {
      end.copy(intersects[0].point);
      this.hitInfo = {
        point: intersects[0].point.clone(),
        normal: intersects[0].face.normal.clone().transformDirection(intersects[0].object.matrixWorld),
        object: intersects[0].object
      };
    } else {
      this.hitInfo = null;
    }

    // --- Update debug line ---
    this.debugRay.geometry.setFromPoints([origin, end]);
  }
}
