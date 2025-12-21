import * as THREE from 'three';

export class PortalCamera {
  constructor(fov = 75, aspect = 1, near = 0.1, far = 500) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  }
  
  /**
   * Update camera position and orientation based on player and portal transforms
   */
  updateFromPortals(playerPos, playerRot, sourcePortal, destPortal) {
    if (!sourcePortal || !destPortal) return;
    
    // Calculate player position relative to source portal
    const sourceToPlayer = new THREE.Vector3().subVectors(playerPos, sourcePortal.point);
    
    // Create transformation matrices
    const sourceMatrix = new THREE.Matrix4();
    const sourceQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      sourcePortal.normal
    );
    sourceMatrix.compose(sourcePortal.point, sourceQuat, new THREE.Vector3(1, 1, 1));
    
    const destMatrix = new THREE.Matrix4();
    const destQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      destPortal.normal.clone().negate()
    );
    destMatrix.compose(destPortal.point, destQuat, new THREE.Vector3(1, 1, 1));
    
    // Transform player relative position through portal
    const sourceInverse = new THREE.Matrix4().copy(sourceMatrix).invert();
    const localPos = sourceToPlayer.clone().applyMatrix4(sourceInverse);
    
    // Flip Z for portal direction reversal
    localPos.z = -localPos.z;
    
    // Transform to destination portal space
    const worldPos = localPos.applyMatrix4(destMatrix);
    
    // Set camera position
    this.camera.position.copy(destPortal.point).add(worldPos);
    
    // Calculate camera rotation
    const playerDirection = new THREE.Vector3(0, 0, -1);
    playerDirection.applyQuaternion(playerRot);
    
    // Transform direction through portals
    const localDir = playerDirection.clone().applyMatrix4(sourceInverse);
    localDir.z = -localDir.z;
    const worldDir = localDir.applyMatrix4(destMatrix);
    
    // Make camera look in that direction
    const lookAtPoint = this.camera.position.clone().add(worldDir);
    this.camera.lookAt(lookAtPoint);
  }
}