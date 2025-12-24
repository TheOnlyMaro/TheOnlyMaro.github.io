// PortalTeleport.js
import * as THREE from 'three';

export class PortalTeleport {
  /**
   * Handles teleportation between portals
   * @param {THREE.Object3D} player - the player object
   * @param {PortalSystem} portalSystem - your portal system instance
   * @param {CollisionController} collisionController - optional, to skip collisions for 1 frame
   */
  constructor(player, portalSystem, collisionController = null, mouseController = null) {
    this.player = player;
    this.portalSystem = portalSystem;
    this.collisionController = collisionController;
    this.mouseController = mouseController;

    // Better teleport cooldown system
    this.teleportCooldown = 0;
    this.cooldownDuration = 0.5; // half second cooldown
    this.lastTeleportTime = 0;

    // Track which portal we last teleported from to prevent ping-ponging
    this.lastPortalUsed = null;
  }

  update(deltaTime = 0.016) {
    // Update cooldown timer
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= deltaTime;
      return; // Skip teleport check during cooldown
    }

    const bluePortal = this.portalSystem.bluePortalData;
    const orangePortal = this.portalSystem.orangePortalData;

    // Need both portals active
    if (!bluePortal || !orangePortal) return;
    if (!this.portalSystem.bluePortalActive || !this.portalSystem.orangePortalActive) return;

    // Check distance to each portal
    const distToBlue = this.player.position.distanceTo(bluePortal.point);
    const distToOrange = this.player.position.distanceTo(orangePortal.point);

    const teleportRadius = 1.5; // Distance threshold for teleportation

    // Blue → Orange teleport
    if (distToBlue < teleportRadius && this.lastPortalUsed !== 'blue') {
      this.teleportTo(orangePortal, bluePortal, 'blue');
    }
    // Orange → Blue teleport
    else if (distToOrange < teleportRadius && this.lastPortalUsed !== 'orange') {
      this.teleportTo(bluePortal, orangePortal, 'orange');
    }
  }



  teleportTo(destinationPortal, sourcePortal, portalName) {
    // -------------------------------------------------------------------------
    // 1. Position Teleport
    // -------------------------------------------------------------------------
    const exitOffset = destinationPortal.normal.clone().multiplyScalar(1.5);
    const newPosition = destinationPortal.point.clone().add(exitOffset);
    this.player.position.copy(newPosition);

    // -------------------------------------------------------------------------
    // 2. Construct Robust Quaternions from Normals
    // -------------------------------------------------------------------------
    // We cannot trust .object.quaternion because the wall mesh might be unrotated.
    // We calculate the rotation required to look ALONG the normal.
    
    const dummyUp = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, 1);

    // Create Source Rotation (Looking out of the wall)
    const sourceQuat = new THREE.Quaternion();
    sourceQuat.setFromUnitVectors(forward, sourcePortal.normal);

    // Create Destination Rotation (Looking out of the wall)
    const destQuat = new THREE.Quaternion();
    destQuat.setFromUnitVectors(forward, destinationPortal.normal);

    // -------------------------------------------------------------------------
    // 3. Calculate Target View Direction
    // -------------------------------------------------------------------------
    // A. Get current direction player is looking
    const camera = this.player.children.find(c => c.isCamera);
    const currentViewDir = new THREE.Vector3();
    camera.getWorldDirection(currentViewDir);

    // B. Calculate Transform: Dest * Flip * Inverse(Source)
    // Flip is 180 degrees around Y (to turn "entering" into "exiting")
    const flipQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    
    const transformQuat = new THREE.Quaternion();
    transformQuat.copy(destQuat)
        .multiply(flipQuat)
        .multiply(sourceQuat.clone().invert());

    // C. Apply transform to the view vector
    const targetViewDir = currentViewDir.clone().applyQuaternion(transformQuat).normalize();

    // -------------------------------------------------------------------------
    // 4. Extract & Apply Euler Angles
    // -------------------------------------------------------------------------
    
    // A. Calculate PITCH (Up/Down)
    // asin(y) gives the vertical angle. Clamp it to avoid flipping over.
    let targetPitch = Math.asin(targetViewDir.y);
    const maxPitch = Math.PI / 2 - 0.05; // Slightly less than 90 deg
    targetPitch = Math.max(-maxPitch, Math.min(maxPitch, targetPitch));

    // B. Calculate YAW (Left/Right)
    // We use atan2(x, z) to find the angle on the horizon
    const targetYaw = Math.atan2(targetViewDir.x, targetViewDir.z);

    // C. Apply YAW to Player (Body)
    // Note: Three.js standard 0 rotation is usually +Z. 
    // If your character faces wrong, you might need (targetYaw + Math.PI).
    // But usually atan2 matches rotation.y directly.
    this.player.rotation.y = targetYaw;

    // D. Apply PITCH to MouseController (Head)
    if (this.mouseController) {
        this.mouseController.pitch = targetPitch;
        this.mouseController.camera.rotation.x = targetPitch;
    }

    // -------------------------------------------------------------------------
    // 5. Update Momentum
    // -------------------------------------------------------------------------
    if (this.player.velocity) {
         // Calculate simple velocity rotation based on Y-axis change
         // (Ignoring complex 3D velocity mapping for gameplay stability)
         const velocitySpeed = this.player.velocity.length();
         
         // Create a vector pointing in the new Yaw direction
         // and scale it by the original speed
         this.player.velocity.set(Math.sin(targetYaw), 0, Math.cos(targetYaw));
         this.player.velocity.normalize().multiplyScalar(velocitySpeed);
         
         // Preserve vertical momentum if needed, or dampen it?
         // Usually safer to reset Y velocity to 0 unless you want to launch out of floor portals
         // this.player.velocity.y = 0; 
    }

    // -------------------------------------------------------------------------
    // 6. Housekeeping
    // -------------------------------------------------------------------------
    if (this.collisionController) {
        this.collisionController.player.prevPosition = this.player.position.clone();
    }
    if (this.player.prevPosition) {
        this.player.prevPosition.copy(this.player.position);
    }

    this.teleportCooldown = this.cooldownDuration;
    this.lastPortalUsed = portalName;

    setTimeout(() => {
        if (this.lastPortalUsed === portalName) {
            this.lastPortalUsed = null;
        }
    }, this.cooldownDuration * 1000 + 200);
  }


}
