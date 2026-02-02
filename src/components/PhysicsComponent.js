export class PhysicsComponent {
    constructor(mass = 1, useGravity = true) {
        this.mass = mass;
        this.useGravity = useGravity;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.acceleration = { x: 0, y: 0, z: 0 };
        this.isGrounded = false;
        this.groundY = 0;
        this.colliderRadius = 0.5;
        this.colliderHeight = 2.5;
        this.bottomOffset = 1.0;
        this.drag = 0.1;
        this.friction = 0.9;
    }

    applyImpulse(x, y, z) {
        this.velocity.x += x;
        this.velocity.y += y;
        this.velocity.z += z;
    }

    applyForce(x, y, z) {
        this.acceleration.x += x / this.mass;
        this.acceleration.y += y / this.mass;
        this.acceleration.z += z / this.mass;
    }

    stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        this.acceleration.z = 0;
    }
}
