import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { audioManager, AudioManager } from './AudioManager.js';

export class PlayerController {
    constructor(camera, domElement) {
        this.player = new THREE.Object3D();
        this.camera = camera;
        
        this.camera.position.set(0, 2.5, 0);
        this.player.add(this.camera);
        
        // Physics
        this.velocity = new THREE.Vector3();
        
        // LINK VELOCITY so PortalTeleport sees it
        this.player.velocity = this.velocity; 

        this.direction = new THREE.Vector3();
        this.speed = 8; 
        this.jumpStrength = 10;
        this.gravity = -30; 
        this.onGround = false;
        
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 2);
        this.floorMeshes = []; 

        this.gunLoaded = false;
        this.loadGun();
    }

    setFloorMeshes(meshes) {
        this.floorMeshes = meshes;
    }

    loadGun() {
        const loader = new GLTFLoader();
        loader.load('/models/laser_gun.glb', gltf => {
            this.gun = gltf.scene;
            this.gun.scale.set(0.05, 0.05, 0.05);
            this.gun.position.set(0.2, -0.3, -1.2);
            this.gun.rotation.y = Math.PI / 2;
            this.gun.traverse(child => {
                if (child.isMesh) {
                    child.material.metalness = 1.0;
                    child.material.roughness = 0.2;
                    child.castShadow = true;
                }
            });
            this.camera.add(this.gun);
            this.gunLoaded = true;
        }, undefined, error => { console.error('GLTF failed:', error); });
    }

    getObject() { return this.player; }

    // WASD Movement (Direct Translation)
    moveForward(distance) { this.player.translateZ(-distance); }
    moveRight(distance) { this.player.translateX(distance); }

    jump() {
        if (this.onGround) {
            this.velocity.y = this.jumpStrength;
            this.onGround = false;
            audioManager.playJump();
        }
    }

    update(delta) {
        // 1. Apply Gravity
        this.velocity.y += this.gravity * delta;

        // [REMOVED] Friction/Drag Step
        // We removed the drag calculation so momentum is perfectly preserved in the air.

        // 2. Apply Velocity to Position
        // This moves the player based on the portal fling or gravity
        this.player.position.x += this.velocity.x * delta;
        this.player.position.z += this.velocity.z * delta;
        this.player.position.y += this.velocity.y * delta;

        // 3. Ground Detection
        const rayOrigin = this.player.position.clone();
        rayOrigin.y += 1.0; 
        
        this.raycaster.ray.origin.copy(rayOrigin);
        
        // Look ahead for ground
        const moveY = this.velocity.y * delta;
        const lookAhead = Math.max(0, -moveY) + 0.2; 
        this.raycaster.far = 1.0 + lookAhead;

        const intersections = this.raycaster.intersectObjects(this.floorMeshes, false);
        
        this.onGround = false;

        if (intersections.length > 0) {
            const hit = intersections[0];
            
            // If we hit the floor while falling (or standing)
            if (this.velocity.y <= 0) {
                // Snap to floor
                this.player.position.y = hit.point.y; 
                
                // RESET ALL VELOCITY (Stop Instantly)
                this.velocity.y = 0; 
                this.velocity.x = 0; // <--- Stop Horizontal Momentum
                this.velocity.z = 0; // <--- Stop Horizontal Momentum
                
                this.onGround = true;
            }
        }

        // Safety Net
        if (this.player.position.y < -50) {
            this.velocity.set(0, 0, 0);
            this.player.position.set(0, 5, 0);
        }
    }
}