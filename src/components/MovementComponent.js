/**
 * Movement Component
 * Handles keyboard-based tank controls
 * - W: Move forward in current facing direction
 * - S: Turn 180° and move forward
 * - A: Rotate left (no movement)
 * - D: Rotate right (no movement)
 */
import { SPEED, ROTATION_SPEED } from "../utils/constants.js";

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
        const turnLeft = this.inputSystem.isKeyPressed('a');
        const turnRight = this.inputSystem.isKeyPressed('d');

        // Handle rotation (A/D for turning, S for 180° flip)
        if (rotation) {
            if (turnLeft) {
                // Rotate counter-clockwise (left) - immediate rotation
                rotation.rotate(ROTATION_SPEED * deltaTime, entity);
            }
            if (turnRight) {
                // Rotate clockwise (right) - immediate rotation
                rotation.rotate(-ROTATION_SPEED * deltaTime, entity);
            }
            if (moveBackward && this.inputSystem.wasKeyJustPressed('s')) {
                // Turn 180° when S is first pressed
                const currentRotation = rotation.getRotation();
                rotation.setTargetRotation(currentRotation + Math.PI);
            }
        }

        // Handle forward movement (W or S moves forward in current facing direction)
        let moveDistance = 0;
        if (moveForward) {
            moveDistance = this.speed * deltaTime;
        }
        if (moveBackward) {
            moveDistance = this.speed * deltaTime;
        }

        // Apply movement in character's facing direction
        if (moveDistance !== 0 && rotation) {
            const entityRotation = rotation.getRotation();
            const sin = Math.sin(entityRotation);
            const cos = Math.cos(entityRotation);

            // Move forward in current facing direction
            position.x += moveDistance * sin;
            position.z += moveDistance * cos;
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
