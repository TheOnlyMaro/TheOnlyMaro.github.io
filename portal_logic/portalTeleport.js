import * as THREE from 'three';
import { audioManager } from '../Controllers/AudioManager.js';

export class PortalTeleport {
  constructor(player, portalSystem, collisionController = null, mouseController = null) {
    this.player = player;
    this.portalSystem = portalSystem;
    this.collisionController = collisionController;
    this.mouseController = mouseController;

    if (!this.mouseController) {
        console.error("⚠️ PortalTeleport: MouseController is MISSING! Camera pitch will not work.");
    } else {
        console.log("✅ PortalTeleport: MouseController linked successfully.");
    }

    this.teleportCooldown = 0;
    this.cooldownDuration = 0.5;
    this.lastTeleportTime = 0;
    this.lastPortalUsed = null;
  }

  update(deltaTime = 0.016) {
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= deltaTime;
      return;
    }

    const bluePortal = this.portalSystem.bluePortalData;
    const orangePortal = this.portalSystem.orangePortalData;

    const playerCenter = this.player.position.clone();
    playerCenter.y += 1.75; 

    if (!bluePortal || !orangePortal) return;
    if (!this.portalSystem.bluePortalActive || !this.portalSystem.orangePortalActive) return;

    const distToBlue = playerCenter.distanceTo(bluePortal.point);
    const distToOrange = playerCenter.distanceTo(orangePortal.point);
    const teleportRadius = 2.0;

    if (distToBlue < teleportRadius && this.lastPortalUsed !== 'blue') {
      this.teleportTo(orangePortal, bluePortal, 'blue');
    }
    else if (distToOrange < teleportRadius && this.lastPortalUsed !== 'orange') {
      this.teleportTo(bluePortal, orangePortal, 'orange');
    }
  }

  teleportTo(destinationPortal, sourcePortal, portalName) {
    console.log(`🌀 Teleporting from ${portalName}...`);
    audioManager.playTeleport();

    // -------------------------------------------------------------------------
    // 1. Position Teleport
    // -------------------------------------------------------------------------
    // Bump out slightly to avoid clipping
    const exitOffset = destinationPortal.normal.clone().multiplyScalar(1.5);
    const newPosition = destinationPortal.point.clone().add(exitOffset);
    this.player.position.copy(newPosition);

    // -------------------------------------------------------------------------
    // 2. Prepare Rotation Math
    // -------------------------------------------------------------------------
    const forward = new THREE.Vector3(0, 0, 1);
    const srcNorm = sourcePortal.normal.clone();
    const dstNorm = destinationPortal.normal.clone();

    // Create Quaternions representing the "Facing" of each portal
    const sourceQuat = new THREE.Quaternion().setFromUnitVectors(forward, srcNorm);
    const destQuat = new THREE.Quaternion().setFromUnitVectors(forward, dstNorm);

    // -------------------------------------------------------------------------
    // 3. Calculate The "Portal Transform" Matrix
    // -------------------------------------------------------------------------
    // This Quaternion represents the exact rotation needed to map
    // "Entering Source" -> "Exiting Destination"
    const flipQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    
    const transformQuat = new THREE.Quaternion();
    transformQuat.copy(destQuat)
        .multiply(flipQuat)
        .multiply(sourceQuat.clone().invert());

    // -------------------------------------------------------------------------
    // 4. Apply Rotation to VIEW (Camera/Body)
    // -------------------------------------------------------------------------
    const camera = this.player.children.find(c => c.isCamera) || this.player.getObjectByProperty('type', 'PerspectiveCamera');
    const currentViewDir = new THREE.Vector3();
    camera.getWorldDirection(currentViewDir);

    // Calculate new look direction
    const targetViewDir = currentViewDir.clone().applyQuaternion(transformQuat).normalize();

    // Extract Yaw/Pitch (Using negative values for Camera -Z alignment)
    const targetPitch = Math.max(-1.5, Math.min(1.5, Math.asin(targetViewDir.y)));
    const targetYaw = Math.atan2(-targetViewDir.x, -targetViewDir.z);

    // Apply to Controllers
    this.player.rotation.y = targetYaw;
    if (this.mouseController) {
        this.mouseController.pitch = targetPitch;
        this.mouseController.camera.rotation.x = targetPitch;
    }

    // -------------------------------------------------------------------------
    // 5. Apply Rotation to MOMENTUM (The Velocity Fix)
    // -------------------------------------------------------------------------
    // We apply the EXACT same transform to the velocity vector.
    // This converts "Falling Down" (-Y) into "Flying Out" (+X or +Z)
    
    if (this.player.velocity) {
         // Apply the portal rotation to the velocity vector
         this.player.velocity.applyQuaternion(transformQuat);

         // OPTIONAL: Add a tiny "kick" away from the portal to prevent
         // the player's collision check from accidentally re-triggering the portal immediately
         // (Only if velocity is very low)
         if (this.player.velocity.length() < 5.0) {
             const exitPush = destinationPortal.normal.clone().multiplyScalar(5.0);
             this.player.velocity.add(exitPush);
         }
    }

    // -------------------------------------------------------------------------
    // 6. Housekeeping
    // -------------------------------------------------------------------------
    if (this.collisionController) this.collisionController.player.prevPosition = this.player.position.clone();
    if (this.player.prevPosition) this.player.prevPosition.copy(this.player.position);

    this.teleportCooldown = this.cooldownDuration;
    //this.lastPortalUsed = portalName;

    // setTimeout(() => {
    //   if (this.lastPortalUsed === portalName) this.lastPortalUsed = null;
    // }, this.cooldownDuration * 1000 + 200);
  }
}