import * as THREE from 'three';

export class PortalMesh {
  constructor(renderTarget, width = 3, height = 4) {
    // Larger plane to cover full portal area
    const geometry = new THREE.PlaneGeometry(width, height);
    
    const material = new THREE.MeshBasicMaterial({
      map: renderTarget.texture,
      side: THREE.DoubleSide,
      transparent: false
    });
    
    // Configure stencil test - only render where stencil = 1
    material.stencilWrite = false;
    material.stencilFunc = THREE.EqualStencilFunc;
    material.stencilRef = 1;
    material.stencilFail = THREE.KeepStencilOp;
    material.stencilZFail = THREE.KeepStencilOp;
    material.stencilZPass = THREE.KeepStencilOp;
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.renderOrder = 0; // Render after mask
  }
  
  setPositionAndOrientation(position, normal) {
    this.mesh.position.copy(position);
    
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );
    this.mesh.quaternion.copy(quaternion);
    
    // Slight offset to prevent z-fighting
    const offset = normal.clone().multiplyScalar(0.01);
    this.mesh.position.add(offset);
  }
  
  setVisible(visible) {
    this.mesh.visible = visible;
  }
  
  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}