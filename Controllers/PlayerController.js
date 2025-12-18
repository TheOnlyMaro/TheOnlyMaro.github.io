import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export class PlayerController {
  constructor(camera) {
    this.player = new THREE.Object3D();
    this.camera = camera;
    this.camera.position.set(0, 1.6, 0);
    this.player.add(this.camera);
    
    this.velocity = new THREE.Vector3();
    this.speed = 5;
    this.jumpStrength = 8;
    this.gravity = -20;
    this.onGround = false;
    this.gunLoaded = false;
    this.loadGun() 
  }

  loadGun() {
  const loader = new GLTFLoader()

loader.load(
  '/models/laser_gun.glb',
  gltf => {
    this.gun = gltf.scene
    this.gun.scale.set(0.05, 0.05, 0.05);
    this.gun.position.set(0.2, -0.3, -1.2);
    this.gun.rotation.y = Math.PI / 2;

         // Apply metalness, roughness, and color to all meshes
this.gun.traverse(child => {
    if (child.isMesh) {
        child.material.metalness = 1.0;   // fully metallic
        child.material.roughness = 0.2;   // very shiny
        child.material.envMapIntensity = 1.0; // full reflection from environment
        child.material.needsUpdate = true;
        child.castShadow = true;
    }
});
    this.camera.add(this.gun)
    this.gunLoaded = true; 
  },
  undefined,
  error => {
    console.error('GLTF failed to load:', error);
  }
)
}



  getGun() {
  return this.gunLoaded ? this.gun : null;
}

  getObject() {
    return this.player;
  }

  moveForward(distance) {
    this.player.translateZ(-distance);
  }

  moveRight(distance) {
    this.player.translateX(distance);
  }

  jump() {
    if (this.onGround) {
      this.velocity.y = this.jumpStrength;
      this.onGround = false;
    }
  }

  update(delta) {
    // Apply gravity
    this.velocity.y += this.gravity * delta;

    // Update vertical position
    this.player.position.y += this.velocity.y * delta;

    // Simple floor collision
    if (this.player.position.y < 1.6) {
      this.player.position.y = 1.6;
      this.velocity.y = 0;
      this.onGround = true;
    }
  }
}
