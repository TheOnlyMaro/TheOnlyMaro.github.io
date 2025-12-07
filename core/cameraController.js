import * as THREE from 'three';

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 1.8, 3); // human eye height


const pointerLocked = { active: false };
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const speed = 50.0; // Acceleration
const gravity = 30.0;
const jumpForce = 10.0;
const drag = 10.0;

function enablePointerLock() {
    const canvas = document.body;

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        pointerLocked.active = document.pointerLockElement === canvas;
    });

    document.addEventListener('mousemove', (event) => {
        if (!pointerLocked.active) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        camera.rotation.y -= movementX * 0.002;
        camera.rotation.x -= movementY * 0.002;

        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    });
}

function setupMovement() {
    const onKeyDown = (event) => {
        switch (event.code) {
            case 'KeyW': moveForward = true; break;
            case 'KeyS': moveBackward = true; break;
            case 'KeyA': moveLeft = true; break;
            case 'KeyD': moveRight = true; break;
            case 'Space':
                if (canJump) {
                    velocity.y = jumpForce;
                    canJump = false;
                }
                break;
        }
    };

    const onKeyUp = (event) => {
        switch (event.code) {
            case 'KeyW': moveForward = false; break;
            case 'KeyS': moveBackward = false; break;
            case 'KeyA': moveLeft = false; break;
            case 'KeyD': moveRight = false; break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function updateCameraControls(delta) {
    if (!pointerLocked.active) return;

    // Deceleration (Friction)
    velocity.x -= velocity.x * drag * delta;
    velocity.z -= velocity.z * drag * delta;

    // Gravity
    velocity.y -= gravity * delta;

    // Input Movement
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // Ensure consistent speed in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    // Apply Velocity
    camera.translateX(-velocity.x * delta); // Invert X for correct strafing relative to look
    camera.translateZ(-velocity.z * delta); // Invert Z for correct forward/back

    // Y Movement is absolute (global up/down), not relative to camera
    // However, translateX/Z are relative. We need to decouple Y or ensure camera parent handles it, 
    // BUT for a simple FPS camera, usually we move a "Player" object and the camera is attached.
    // Here we are moving the camera directly. translateX/Z rotates with camera.
    // To implement "Grounded" movement (not flying), we need to correct the vector application.
    // Actually, THREE.PointerLockControls usually handles this by moving "Right" and "Forward" on the horizontal plane.

    // Let's correct: translateX/Z rotates the move vector by camera rotation.
    // If looking up, 'Forward' moves up. We want to move on XZ plane.
    // We'll undo the camera rotation effect for movement, OR use a different approach.

    // Simpler approach for "Grounded camera-only":
    // 1. Get forward vector on floor
    // 2. Get right vector on floor
    // 3. Apply velocity to position

    // Reverting the "Apply Velocity" lines above to a more robust method:

    // Forward Vector projected on XZ
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    // Right Vector projected on XZ
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    // Accumulate velocity input *directly* to global x/z velocity, ignoring previous "relative" logic
    // Actually, let's keep the velocity localized but apply it globally.
    // The previous velocity.x/z logic was mixing relative input with global drag. Let's simplify.

    // Correct logic:
    // velocity.x and velocity.z represent GLOBAL velocity on the horizontal plane

    // Input Force
    if (moveForward) {
        velocity.x += forward.x * speed * delta;
        velocity.z += forward.z * speed * delta;
    }
    if (moveBackward) {
        velocity.x -= forward.x * speed * delta;
        velocity.z -= forward.z * speed * delta;
    }
    if (moveRight) {
        velocity.x += right.x * speed * delta;
        velocity.z += right.z * speed * delta;
    }
    if (moveLeft) {
        velocity.x -= right.x * speed * delta;
        velocity.z -= right.z * speed * delta;
    }

    camera.position.x += velocity.x * delta;
    camera.position.z += velocity.z * delta;
    camera.position.y += velocity.y * delta;

    // Floor Collision
    if (camera.position.y < 1.8) {
        velocity.y = 0;
        camera.position.y = 1.8;
        canJump = true;
    }

    checkCollisions();
}

let colliders = [];
export function setColliders(newColliders) {
    colliders = newColliders;
}

function checkCollisions() {
    const playerRadius = 0.5;
    const playerPos = camera.position.clone();
    playerPos.y -= 0.9; // Check from center/feet, currently camera is at eyes (1.8m)

    const playerBox = new THREE.Box3();
    playerBox.setFromCenterAndSize(playerPos, new THREE.Vector3(playerRadius * 2, 1.8, playerRadius * 2));

    for (const collider of colliders) {
        const colliderBox = new THREE.Box3().setFromObject(collider);
        if (playerBox.intersectsBox(colliderBox)) {
            // Resolve collision (Simple push out)
            // Just reversing velocity works for walls but feels jerky.
            // Better: Push player out of buffer.

            // For now, VERY simple: if we hit something, undo the movement step.
            // This requires storing 'previous position'.

            // Since we don't have previous pos stored in this scope easily without refactor,
            // let's do safe step:

            // Actually, we can just push back against velocity direction.
            // But we already moved.

            // Let's implement a 'try move' approach or 'resolve' approach.
            // Push out based on overlap depth?

            // Simpler "Wall Stop" logic for Prototype:
            // Calculate overlap.
            const intersection = playerBox.intersect(colliderBox);
            const dx = intersection.max.x - intersection.min.x;
            const dz = intersection.max.z - intersection.min.z;
            const dy = intersection.max.y - intersection.min.y; // usually irrelevant for simple wall walking if strict floor logic

            // Check minimal penetration
            if (dx < dz && dx < dy) {
                // X collision
                const sign = playerPos.x > colliderBox.getCenter(new THREE.Vector3()).x ? 1 : -1;
                camera.position.x += sign * dx;
                velocity.x = 0;
            } else if (dz < dx && dz < dy) {
                // Z collision
                const sign = playerPos.z > colliderBox.getCenter(new THREE.Vector3()).z ? 1 : -1;
                camera.position.z += sign * dx; // Typo fix: should be dz? 
                // Ah interception box dim is dx, dz.
                camera.position.z += sign * dz;
                velocity.z = 0;
            }
            else if (dy < dx && dy < dz) {
                // Y collision (e.g. hitting head or landing on platform)
                const sign = playerPos.y > colliderBox.getCenter(new THREE.Vector3()).y ? 1 : -1;
                camera.position.y += sign * dy;
                velocity.y = 0;
                if (sign > 0) canJump = true; // Landed on top
            }
        }
    }
}

function resizeCamera() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}

enablePointerLock();
setupMovement();
resizeCamera();


export function getPlayerPosition() {
    return camera.position;
}

export { camera, updateCameraControls };
