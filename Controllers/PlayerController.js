import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class PlayerController {
    constructor(camera, domElement) {
        this.player = new THREE.Object3D();
        this.camera = camera;
        
        this.camera.position.set(0, 1.6, 0);
        this.player.add(this.camera);
        
        // Physics
        this.velocity = new THREE.Vector3();
        
        // --- CRITICAL FIX: Link velocity to the Mesh so PortalTeleport can find it ---
        this.player.velocity = this.velocity; 
        // -----------------------------------------------------------------------------

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

    // Standard movement (WASD) - Independent of momentum
    moveForward(distance) { this.player.translateZ(-distance); }
    moveRight(distance) { this.player.translateX(distance); }

    jump() {
        if (this.onGround) {
            this.velocity.y = this.jumpStrength;
            this.onGround = false;
        }
    }

    update(delta) {
        // 1. Apply Gravity
        this.velocity.y += this.gravity * delta;

        // 2. Apply Air Resistance / Ground Friction to Horizontal Momentum
        // This ensures the "fling" eventually slows down
        const drag = this.onGround ? 5.0 : 0.5; // High friction on ground, low in air
        this.velocity.x -= this.velocity.x * drag * delta;
        this.velocity.z -= this.velocity.z * drag * delta;

        // Clean up tiny values to stop sliding
        if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
        if (Math.abs(this.velocity.z) < 0.1) this.velocity.z = 0;

        // 3. Apply Velocity to Position (This makes the Fling happen!)
        this.player.position.x += this.velocity.x * delta;
        this.player.position.z += this.velocity.z * delta;
        this.player.position.y += this.velocity.y * delta;

        // 4. Ground Detection
        const rayOrigin = this.player.position.clone();
        rayOrigin.y += 1.0; 
        
        this.raycaster.ray.origin.copy(rayOrigin);
        const moveY = this.velocity.y * delta;
        const lookAhead = Math.max(0, -moveY) + 0.2; 
        this.raycaster.far = 1.0 + lookAhead;

        const intersections = this.raycaster.intersectObjects(this.floorMeshes, false);
        
        this.onGround = false;

        if (intersections.length > 0) {
            const hit = intersections[0];
            
            // Only snap to floor if falling
            if (this.velocity.y <= 0) {
                this.player.position.y = hit.point.y; 
                this.velocity.y = 0; 
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