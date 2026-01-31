/**
 * Rotation Component
 * Manages smooth entity rotation
 */
import { ROTATION_SPEED } from "../constants.js";

export class RotationComponent {
    constructor(rotationY = 0, rotationSpeed = ROTATION_SPEED) {
        this.rotationY = rotationY;
        this.targetRotation = rotationY;
        this.rotationSpeed = rotationSpeed;
    }

    onAdd(entity) {
        if (entity.threeObject) {
            entity.threeObject.rotation.y = this.rotationY;
        }
    }

    update(deltaTime, entity) {
        if (!entity.threeObject) return;

        // Smoothly rotate towards target
        let diff = this.targetRotation - this.rotationY;
        
        // Handle wrap-around for shortest path
        if (Math.abs(diff) > Math.PI) {
            if (diff > 0) {
                diff = diff - (2 * Math.PI);
            } else {
                diff = diff + (2 * Math.PI);
            }
        }

        if (Math.abs(diff) > 0.01) {
            this.rotationY += diff * deltaTime * this.rotationSpeed;
            entity.threeObject.rotation.y = this.rotationY;
        } else {
            this.rotationY = this.targetRotation;
            entity.threeObject.rotation.y = this.rotationY;
        }
    }

    setTargetRotation(rotationY) {
        this.targetRotation = rotationY;
    }

    getRotation() {
        return this.rotationY;
    }
}
