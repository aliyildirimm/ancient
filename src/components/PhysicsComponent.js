/**
 * PhysicsComponent
 * Stores physics data for an entity
 *
 * The PhysicsSystem reads and updates this data each frame
 */
export class PhysicsComponent {
    constructor(mass = 1, useGravity = true) {
        this.mass = mass;
        this.useGravity = useGravity;

        // Velocity (m/s)
        this.velocity = { x: 0, y: 0, z: 0 };

        // Acceleration (m/s²) - cleared each frame after applied
        this.acceleration = { x: 0, y: 0, z: 0 };

        // Ground detection
        this.isGrounded = false;
        this.groundY = 0;

        // Collision (simple sphere collider)
        this.colliderRadius = 0.5; // Half the character width

        // Bottom offset - distance from entity center to bottom (for ground detection)
        this.bottomOffset = 1.0; // Default: human legs extend 1.0 units down from center

        // Drag/friction
        this.drag = 0.1; // Air resistance
        this.friction = 0.9; // Ground friction (multiplier)
    }

    /**
     * Apply an instant velocity change (impulse)
     * Used for jumping, knockback, etc.
     */
    applyImpulse(x, y, z) {
        this.velocity.x += x;
        this.velocity.y += y;
        this.velocity.z += z;
    }

    /**
     * Apply a force (gradual acceleration)
     * F = ma, so a = F/m
     */
    applyForce(x, y, z) {
        this.acceleration.x += x / this.mass;
        this.acceleration.y += y / this.mass;
        this.acceleration.z += z / this.mass;
    }

    /**
     * Stop all movement
     */
    stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        this.acceleration.z = 0;
    }
}
