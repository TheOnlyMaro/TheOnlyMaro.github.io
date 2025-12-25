import * as THREE from 'three';

export class CollisionController {
  constructor(player, walls, dynamicObjects = []) {
    this.player = player;       // THREE.Object3D of the player
    this.walls = walls;         // Array of THREE.Mesh walls
    this.dynamicObjects = dynamicObjects; // Array of moving meshes

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

  update() {
    // Update player bounding box
    // Made slightly smaller (0.6 width) to prevent feeling "too wide" in doorways
    const playerSize = new THREE.Vector3(0.6, 1.7, 0.6);
    this.playerBox.setFromCenterAndSize(
      this.player.position,
      playerSize
    );

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