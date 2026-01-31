/**
 * Movement Component
 * Handles keyboard-based movement
 */
import { SPEED, TARGET_ROTATIONS } from "../constants.js";

export class MovementComponent {
    constructor(speed = SPEED) {
        this.speed = speed;
        this.keys = { w: false, a: false, s: false, d: false };
    }

    update(deltaTime, entity) {
        if (!entity.threeObject) return;

        const position = entity.threeObject.position;
        const rotation = entity.getComponent('rotation');

        // Movement based on keys
        if (this.keys.w) position.z -= this.speed * deltaTime;
        if (this.keys.s) position.z += this.speed * deltaTime;
        if (this.keys.a) position.x -= this.speed * deltaTime;
        if (this.keys.d) position.x += this.speed * deltaTime;

        // Update rotation target based on movement direction
        if (rotation) {
            if (this.keys.w) rotation.setTargetRotation(TARGET_ROTATIONS.w);
            if (this.keys.s) rotation.setTargetRotation(TARGET_ROTATIONS.s);
            if (this.keys.a) rotation.setTargetRotation(TARGET_ROTATIONS.a);
            if (this.keys.d) rotation.setTargetRotation(TARGET_ROTATIONS.d);
        }

        // Update position component if it exists
        const posComponent = entity.getComponent('position');
        if (posComponent) {
            posComponent.x = position.x;
            posComponent.y = position.y;
            posComponent.z = position.z;
        }
    }

    setKeyState(key, pressed) {
        const k = key.toLowerCase();
        if (k in this.keys) {
            this.keys[k] = pressed;
        }
    }
}
