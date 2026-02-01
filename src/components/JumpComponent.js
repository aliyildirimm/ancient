/**
 * Jump Component
 * Handles jumping behavior using PhysicsComponent
 *
 * Much simpler now! Physics handles gravity and landing.
 * This component just applies upward velocity when triggered.
 */
export class JumpComponent {
    constructor(jumpForce = 7) {
        this.jumpForce = jumpForce; // Upward velocity applied on jump
        this.canJump = true; // Prevents double-jumping
    }

    /**
     * Update each frame
     * Resets jump ability when grounded
     */
    update(deltaTime, entity) {
        const physics = entity.getComponent('physics');
        if (!physics) return;

        // Reset jump ability when grounded
        if (physics.isGrounded) {
            this.canJump = true;
        }
    }

    /**
     * Trigger a jump
     * Only works if entity has PhysicsComponent and is grounded
     */
    triggerJump(entity) {
        const physics = entity.getComponent('physics');
        if (!physics) {
            console.warn('JumpComponent requires PhysicsComponent to work');
            return;
        }

        // Only jump if grounded and able to jump
        if (physics.isGrounded && this.canJump) {
            // Apply upward impulse
            physics.applyImpulse(0, this.jumpForce, 0);
            this.canJump = false;

            // Optional: Could add jump sound/animation here
        }
    }
}
