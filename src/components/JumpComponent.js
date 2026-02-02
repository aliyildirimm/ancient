export class JumpComponent {
    constructor(jumpForce = 7, maxAirJumps = 3) {
        this.jumpForce = jumpForce;
        this.maxAirJumps = maxAirJumps;
        this.remainingAirJumps = maxAirJumps;  // Start with full air jumps
        this.wasGrounded = true;               // Track previous grounded state
    }

    update(deltaTime, entity) {
        const physics = entity.getComponent('physics');
        if (!physics) return;

        // Detect landing: transition from air to ground
        if (physics.isGrounded && !this.wasGrounded) {
            this.remainingAirJumps = this.maxAirJumps;  // Restore all air jumps
        }

        // Update state for next frame
        this.wasGrounded = physics.isGrounded;
    }

    triggerJump(entity) {
        const physics = entity.getComponent('physics');
        if (!physics) {
            console.warn('JumpComponent requires PhysicsComponent to work');
            return;
        }

        // Ground jump: free, always available when grounded
        if (physics.isGrounded) {
            physics.applyImpulse(0, this.jumpForce, 0);
            // Don't consume air jump
        }
        // Air jump: requires remaining air jumps
        else if (this.remainingAirJumps > 0) {
            physics.applyImpulse(0, this.jumpForce, 0);
            this.remainingAirJumps--;
        }
    }
}
