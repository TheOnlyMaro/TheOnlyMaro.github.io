import * as THREE from 'three';
import { PlayerController } from './PlayerController.js';
import { KeyboardController } from './keyboardController.js';
import { MouseController } from './MouseController.js';
import { CollisionController } from './collisionController.js';
import { audioManager } from './AudioManager.js';
export class CameraController {
    // walls = Objects that stop X/Z movement
    // floors = Objects that stop Y movement (gravity)
    constructor(camera, scene, walls, floors = []) {
        this.camera = camera;
        this.player = new PlayerController(camera);
        
        // Pass the floors to the player for gravity checks
        this.player.setFloorMeshes(floors);

        scene.add(this.player.getObject());
        
        this.keyboard = new KeyboardController();
        this.mouse = new MouseController(this.player.getObject(), camera);

        // CollisionController ONLY handles Walls (horizontal collisions)
        // We do NOT pass floors here, or the player will get stuck.
        this.collision = new CollisionController(this.player.getObject(), walls, [], scene); 
        
        this.player.getObject().prevPosition = this.player.getObject().position.clone();
        // this.clock = new THREE.Clock();
        // temp remove clock for bug fix


        this.stepTimer = 0; // For footstep sounds
    }

    update(delta) {
        
        // Save position BEFORE movement for wall collision rollback
        const playerObj = this.player.getObject();
        if (!playerObj.prevPosition) playerObj.prevPosition = new THREE.Vector3();
        playerObj.prevPosition.copy(playerObj.position);

        // Movement Logic
        const moveDistance = this.player.speed * delta;
        const input = this.keyboard.getDirection();

        const isMoving = input.forward || input.backward || input.left || input.right;
        if (input.forward) this.player.moveForward(moveDistance);
        if (input.backward) this.player.moveForward(-moveDistance);
        if (input.left) this.player.moveRight(-moveDistance);
        if (input.right) this.player.moveRight(moveDistance);

        // Footstep Sounds
        if (isMoving && this.player.onGround) {
            this.stepTimer += delta;

        // Every 0.5 seconds (adjust for walking speed)
            if (this.stepTimer > 0.5) {
                audioManager.playStep();
                this.stepTimer = 0; // Reset timer
            }
        } else {
            // Reset timer immediately if we stop so the first step happens sooner when we start again
            this.stepTimer = 0.4; 
        }

        if (this.keyboard.keys['Space']) {
            this.player.jump();
        }

        // Physics Update (Gravity & Floor Check)
        this.player.update(delta);

        // Wall Collision Check (Push back if hitting wall)
        this.collision.update();
    }

    getPlayer() {
        return this.player.getObject();
    }
}
