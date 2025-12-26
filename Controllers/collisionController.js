import * as THREE from 'three';

export class CollisionController {
  constructor(player, walls, dynamicObjects = [], scene = null) {
    this.player = player;       // THREE.Object3D of the player
    this.walls = walls;         // Array of THREE.Mesh walls
    this.dynamicObjects = dynamicObjects; // Array of moving meshes
    this.scene = scene;         // Optional: Scene for debug drawing

    // Player collision box size
    this.playerBox = new THREE.Box3();
    
    // OPTIMIZATION: Pre-calculate static wall boxes once
    // Re-calculating setFromObject() every frame for static walls kills performance.
    this.wallBoxes = this.walls.map(wall => {
        const box = new THREE.Box3();
        box.setFromObject(wall);
        return box;
    });
  }


  debugDraw(scene) {
    if (!this.helper) {
        this.helper = new THREE.Box3Helper(this.playerBox, 0xff0000);
        scene.add(this.helper);
    }
    // Helper updates automatically when this.playerBox changes
  }

  update() {

    this.debugDraw(this.scene);
    // Player Dimensions
    // Made slightly smaller (0.6 width) to prevent feeling "too wide" in doorways
    const width = 0.6; // Slightly thinner than 0.7 to avoid getting stuck in doors
    const totalHeight = 2.7; // Head height
    const stepHeight = 0.2;  // LIFT the box 0.2m off the ground

    // Calculate Box Size
    // The box only needs to cover from [Shin] to [Head]
    const boxHeight = totalHeight - stepHeight; 

    // Calculate Box Center
    // Start at feet position
    const boxCenter = this.player.position.clone();
    // Move UP by Step Height + Half of the remaining box height
    boxCenter.y += stepHeight + (boxHeight / 2); 

    this.playerBox.setFromCenterAndSize(boxCenter, new THREE.Vector3(width, boxHeight, width));

    // 1. Check cached Static Walls
    for (const wallBox of this.wallBoxes) {
      if (this.playerBox.intersectsBox(wallBox)) {
        this.handleCollision();
        return; 
      }
    }

    // 2. Check Dynamic Objects (Must re-calculate these every frame)
    for (let obj of this.dynamicObjects) {
      const box = new THREE.Box3().setFromObject(obj);
      if (this.playerBox.intersectsBox(box)) {
        this.handleCollision();
        return; 
      }
    }
  }

  handleCollision() {
    if (!this.player.prevPosition) return;

    // THE FIX FOR STICKY WALLS:
    // Only revert Horizontal (X/Z) movement.
    // We leave Y alone so gravity can still pull you down while you slide against the wall.
    
    this.player.position.x = this.player.prevPosition.x;
    this.player.position.z = this.player.prevPosition.z;
    
    // Note: If you have ceilings/overhangs in 'walls', you might need to check Y too.
    // But for vertical walls, this prevents the "Spider-Man" stickiness.
  }
}