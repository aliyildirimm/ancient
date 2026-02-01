export class JumpComponent {
    constructor(jumpForce = 7) {
        this.jumpForce = jumpForce;
        this.canJump = true;
    }

    update(deltaTime, entity) {
        const physics = entity.getComponent('physics');
        if (!physics) return;

        if (physics.isGrounded) {
            this.canJump = true;
        }
    }

    triggerJump(entity) {
        const physics = entity.getComponent('physics');
        if (!physics) {
            console.warn('JumpComponent requires PhysicsComponent to work');
            return;
        }

        if (physics.isGrounded && this.canJump) {
            physics.applyImpulse(0, this.jumpForce, 0);
            this.canJump = false;
        }
    }
}
