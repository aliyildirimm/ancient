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

        // Apply movement based on input
        if (moveForward) position.z -= this.speed * deltaTime;
        if (moveBackward) position.z += this.speed * deltaTime;
        if (moveLeft) position.x -= this.speed * deltaTime;
        if (moveRight) position.x += this.speed * deltaTime;

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
