import * as THREE from 'three';

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

    if (!bluePortal || !orangePortal) return;
    if (!this.portalSystem.bluePortalActive || !this.portalSystem.orangePortalActive) return;

    const distToBlue = this.player.position.distanceTo(bluePortal.point);
    const distToOrange = this.player.position.distanceTo(orangePortal.point);
    const teleportRadius = 1.5;

    if (distToBlue < teleportRadius && this.lastPortalUsed !== 'blue') {
      this.teleportTo(orangePortal, bluePortal, 'blue');
    }
    else if (distToOrange < teleportRadius && this.lastPortalUsed !== 'orange') {
      this.teleportTo(bluePortal, orangePortal, 'orange');
    }
  }

  teleportTo(destinationPortal, sourcePortal, portalName) {
    console.log(`🌀 Teleporting from ${portalName}...`);

    // 1. Position Teleport
    const exitOffset = destinationPortal.normal.clone().multiplyScalar(1.5);
    const newPosition = destinationPortal.point.clone().add(exitOffset);
    this.player.position.copy(newPosition);

    // ... inside teleportTo ...

    // -------------------------------------------------------------------------
    // 2. Validate Normals (The Fix)
    // -------------------------------------------------------------------------
    
    // Clone to avoid modifying the original data
    let srcNorm = sourcePortal.normal.clone();
    let dstNorm = destinationPortal.normal.clone();

    // DEBUG: Check what the physics engine/raycaster is actually giving us
    // If these print the exact same values for different walls, that's the bug.
    console.log(`Source Raw Normal: ${srcNorm.x.toFixed(2)}, ${srcNorm.y.toFixed(2)}, ${srcNorm.z.toFixed(2)}`);
    console.log(`Dest Raw Normal:   ${dstNorm.x.toFixed(2)}, ${dstNorm.y.toFixed(2)}, ${dstNorm.z.toFixed(2)}`);

    // FIX: If the portal data has the object reference, transform normal to World Space
    // (Only needed if your normals are coming back as Local Space)
    if (sourcePortal.object) {
        // Transform direction by the object's rotation quaternion
        // Note: transformDirection is used for vectors (ignores translation)
        // srcNorm.applyQuaternion(sourcePortal.object.quaternion).normalize();
    }
    if (destinationPortal.object) {
        // dstNorm.applyQuaternion(destinationPortal.object.quaternion).normalize();
    }

    // Now use these (potentially corrected) normals for the math
    const forward = new THREE.Vector3(0, 0, 1);
    const sourceQuat = new THREE.Quaternion().setFromUnitVectors(forward, srcNorm);
    const destQuat = new THREE.Quaternion().setFromUnitVectors(forward, dstNorm);

    // ... continue with Step 3 ...
    // 3. Calculate Target Look Vector
    const camera = this.player.children.find(c => c.isCamera) || this.player.getObjectByProperty('type', 'PerspectiveCamera');
    const currentViewDir = new THREE.Vector3();
    camera.getWorldDirection(currentViewDir);

    // Transform: Dest * Flip(180) * Source_Inverse
    const flipQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    const transformQuat = new THREE.Quaternion();
    transformQuat.copy(destQuat).multiply(flipQuat).multiply(sourceQuat.clone().invert());

    const targetViewDir = currentViewDir.clone().applyQuaternion(transformQuat).normalize();

    // 4. Extract Euler Angles
    // Pitch (X-axis): asin of the Y component
    // Clamp to avoid 90-degree locks
    const targetPitch = Math.max(-1.5, Math.min(1.5, Math.asin(targetViewDir.y)));
    
    // Yaw (Y-axis): atan2 of X, Z
    // We use negative components to align with the camera's -Z forward axis
    const targetYaw = Math.atan2(-targetViewDir.x, -targetViewDir.z);

    console.log(`🎯 New Angles -> Pitch: ${targetPitch.toFixed(2)}, Yaw: ${targetYaw.toFixed(2)}`);

    // 5. Apply to Controllers
    // Force Player Body to new Yaw
    this.player.rotation.y = targetYaw;

    // Force Mouse Controller to new Pitch
    if (this.mouseController) {
        this.mouseController.pitch = targetPitch;
        this.mouseController.camera.rotation.x = targetPitch;
    } else {
        // Fallback: Try to force camera directly if controller is missing
        console.warn("⚠️ No MouseController found. Forcing camera directly (Snap-back may occur).");
        camera.rotation.x = targetPitch;
    }

    // 6. Rotate Velocity
    if (this.player.velocity) {
         const speed = this.player.velocity.length();
         // Reset velocity to point in new forward direction (simplified for stability)
         this.player.velocity.set(Math.sin(targetYaw), 0, Math.cos(targetYaw)).multiplyScalar(speed);
    }

    // 7. Housekeeping
    if (this.collisionController) this.collisionController.player.prevPosition = this.player.position.clone();
    if (this.player.prevPosition) this.player.prevPosition.copy(this.player.position);

    this.teleportCooldown = this.cooldownDuration;
    this.lastPortalUsed = portalName;

    setTimeout(() => {
      if (this.lastPortalUsed === portalName) this.lastPortalUsed = null;
    }, this.cooldownDuration * 1000 + 200);
  }
}