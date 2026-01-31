/**
 * Jump Component
 * Handles jumping behavior
 */
export class JumpComponent {
    constructor(jumpSpeed = 0.1, targetHeight = 2) {
        this.jumpSpeed = jumpSpeed;
        this.targetHeight = targetHeight;
        this.isJumping = false;
        this.isFalling = false;
        this.startY = 0;
    }

    update(deltaTime, entity) {
        if (!entity.threeObject) return;

        if (this.isJumping) {
            // Jump speed is in units per second, so multiply by deltaTime
            entity.threeObject.position.y += this.jumpSpeed * deltaTime * 10; // Scale appropriately
            
            const currentHeight = entity.threeObject.position.y - this.startY;
            if (currentHeight >= this.targetHeight) {
                this.isJumping = false;
                this.isFalling = true;
            }
        } else if (this.isFalling) {
            // Fall at same speed
            entity.threeObject.position.y -= this.jumpSpeed * deltaTime * 10;
            
            if (entity.threeObject.position.y <= this.startY) {
                entity.threeObject.position.y = this.startY;
                this.isFalling = false;
            }
        }
    }

    jump() {
        // We need the entity reference, so we'll set it when jump is called
        // This is called from scene.js which has access to the entity
    }

    onAdd(entity) {
        if (entity.threeObject) {
            this.startY = entity.threeObject.position.y;
        }
    }

    // Helper method to trigger jump (called from outside)
    triggerJump(entity) {
        if (!this.isJumping && !this.isFalling && entity.threeObject) {
            this.isJumping = true;
            this.startY = entity.threeObject.position.y;
        }
    }
}
