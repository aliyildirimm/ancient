/**
 * Movement Component
 * Handles keyboard-based movement
 */
import { SPEED, TARGET_ROTATIONS } from "../utils/constants.js";

export class MovementComponent {
    constructor(speed = SPEED, inputSystem = null) {
        this.speed = speed;
        this.inputSystem = inputSystem;
    }

    /**
     * Set the InputSystem reference
     * Called after component creation to inject dependencies
     */
    setInputSystem(inputSystem) {
        this.inputSystem = inputSystem;
    }

    update(deltaTime, entity) {
        if (!entity.threeObject || !this.inputSystem) return;

        const position = entity.threeObject.position;
        const rotation = entity.getComponent('rotation');

        // Read input state from InputSystem
        const moveForward = this.inputSystem.isKeyPressed('w');
        const moveBackward = this.inputSystem.isKeyPressed('s');
        const moveLeft = this.inputSystem.isKeyPressed('a');
        const moveRight = this.inputSystem.isKeyPressed('d');

        // Calculate movement direction in local space (relative to character facing)
        // In local space: +Z is forward, +X is left, -X is right
        let moveX = 0;
        let moveZ = 0;

        if (moveForward) {
            moveZ += this.speed * deltaTime;
        }
        if (moveBackward) {
            moveZ -= this.speed * deltaTime;
        }
        if (moveLeft) {
            moveX += this.speed * deltaTime;
        }
        if (moveRight) {
            moveX -= this.speed * deltaTime;
        }

        // Apply rotation to movement vector
        if (moveX !== 0 || moveZ !== 0) {
            const entityRotation = rotation ? rotation.getRotation() : 0;
            const cos = Math.cos(entityRotation);
            const sin = Math.sin(entityRotation);

            // Rotate movement vector by entity's Y rotation
            const rotatedX = moveX * cos - moveZ * sin;
            const rotatedZ = moveX * sin + moveZ * cos;

            position.x += rotatedX;
            position.z += rotatedZ;
        }

        // Update rotation target based on movement direction
        if (rotation) {
            if (moveForward) rotation.setTargetRotation(TARGET_ROTATIONS.w);
            if (moveBackward) rotation.setTargetRotation(TARGET_ROTATIONS.s);
            if (moveLeft) rotation.setTargetRotation(TARGET_ROTATIONS.a);
            if (moveRight) rotation.setTargetRotation(TARGET_ROTATIONS.d);
        }

        // Sync position component
        const posComponent = entity.getComponent('position');
        if (posComponent) {
            posComponent.x = position.x;
            posComponent.y = position.y;
            posComponent.z = position.z;
        }
    }
}
