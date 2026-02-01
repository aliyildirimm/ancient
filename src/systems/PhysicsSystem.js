/**
 * PhysicsSystem
 * Handles physics simulation for all entities with PhysicsComponent
 *
 * Features:
 * - Gravity simulation
 * - Ground detection (including building tops)
 * - Collision detection and response
 * - Velocity integration
 */
export class PhysicsSystem {
    constructor() {
        this.gravity = -15; // m/s² downward (stronger than real gravity for game feel)
        this.groundLevel = 0.25; // Default ground height (GRID_HEIGHT / 2)
        this.buildings = []; // Array of building bounds for collision
    }

    /**
     * Pre-update phase - Apply physics before entity logic
     * This ensures entities can query their physics state in their update()
     */
    preUpdate(deltaTime, entities) {
        entities.forEach(entity => {
            const physics = entity.getComponent('physics');
            if (!physics || !entity.threeObject) return;

            const pos = entity.threeObject.position;

            // 1. Apply gravity (if not grounded and gravity enabled)
            if (physics.useGravity && !physics.isGrounded) {
                physics.velocity.y += this.gravity * deltaTime;
            }

            // 2. Apply acceleration to velocity
            physics.velocity.x += physics.acceleration.x * deltaTime;
            physics.velocity.y += physics.acceleration.y * deltaTime;
            physics.velocity.z += physics.acceleration.z * deltaTime;

            // 3. Apply drag (air resistance)
            const dragFactor = Math.pow(1 - physics.drag, deltaTime);
            physics.velocity.x *= dragFactor;
            physics.velocity.z *= dragFactor;

            // 4. Apply velocity to position
            pos.x += physics.velocity.x * deltaTime;
            pos.y += physics.velocity.y * deltaTime;
            pos.z += physics.velocity.z * deltaTime;

            // 5. Ground detection (use bottom of entity, not center)
            const groundHeight = this.detectGround(pos.x, pos.z);
            const bottomY = pos.y - physics.bottomOffset;
            const groundTolerance = 0.01; // Small tolerance for floating point precision

            if (bottomY <= groundHeight + groundTolerance) {
                // Hit ground - stop falling
                // Set position so bottom is at ground level
                pos.y = groundHeight + physics.bottomOffset;
                physics.velocity.y = 0;
                physics.isGrounded = true;
                physics.groundY = groundHeight;

                // Apply ground friction to horizontal movement
                physics.velocity.x *= physics.friction;
                physics.velocity.z *= physics.friction;
            } else {
                // In air
                physics.isGrounded = false;
            }

            // 6. Building collision detection and response
            this.resolveBuildingCollisions(entity, physics);

            // 7. Reset acceleration (forces are applied per-frame)
            physics.acceleration.x = 0;
            physics.acceleration.y = 0;
            physics.acceleration.z = 0;

            // 8. Sync position component if it exists
            const posComponent = entity.getComponent('position');
            if (posComponent) {
                posComponent.x = pos.x;
                posComponent.y = pos.y;
                posComponent.z = pos.z;
            }
        });
    }

    /**
     * Detect the ground height at a given X,Z position
     * Checks both the default ground level and building tops
     *
     * @param {number} x - X position
     * @param {number} z - Z position
     * @returns {number} The Y height of the ground at this position
     */
    detectGround(x, z) {
        let maxHeight = this.groundLevel;

        // Check if standing on a building
        this.buildings.forEach(building => {
            const halfWidth = building.width / 2;
            const halfDepth = building.depth / 2;

            const withinX = x >= building.x - halfWidth &&
                           x <= building.x + halfWidth;
            const withinZ = z >= building.z - halfDepth &&
                           z <= building.z + halfDepth;

            if (withinX && withinZ) {
                // Standing on this building's footprint
                const buildingTop = building.y + building.height / 2 + this.groundLevel;
                if (buildingTop > maxHeight) {
                    maxHeight = buildingTop;
                }
            }
        });

        return maxHeight;
    }

    /**
     * Check and resolve collisions with buildings
     * Uses simple circle-rectangle collision
     *
     * @param {Entity} entity - The entity to check
     * @param {PhysicsComponent} physics - The entity's physics component
     */
    resolveBuildingCollisions(entity, physics) {
        const pos = entity.threeObject.position;
        const radius = physics.colliderRadius;

        this.buildings.forEach(building => {
            const halfWidth = building.width / 2;
            const halfDepth = building.depth / 2;

            // Find closest point on building rectangle to entity circle
            const closestX = Math.max(
                building.x - halfWidth,
                Math.min(pos.x, building.x + halfWidth)
            );
            const closestZ = Math.max(
                building.z - halfDepth,
                Math.min(pos.z, building.z + halfDepth)
            );

            // Calculate distance from entity to closest point
            const distX = pos.x - closestX;
            const distZ = pos.z - closestZ;
            const distanceSquared = distX * distX + distZ * distZ;

            // Check if entity is colliding (within radius)
            if (distanceSquared < radius * radius && distanceSquared > 0) {
                // Collision detected!
                const distance = Math.sqrt(distanceSquared);
                const penetration = radius - distance;

                // Calculate push direction (normalized)
                const pushDirX = distX / distance;
                const pushDirZ = distZ / distance;

                // Push entity out of building
                pos.x += pushDirX * penetration;
                pos.z += pushDirZ * penetration;

                // Stop velocity in collision direction
                // Project velocity onto collision normal and remove it
                const dot = physics.velocity.x * pushDirX + physics.velocity.z * pushDirZ;
                if (dot < 0) {
                    physics.velocity.x -= pushDirX * dot;
                    physics.velocity.z -= pushDirZ * dot;
                }
            }
        });
    }

    /**
     * Set the buildings array for collision detection
     * Called from GameScene after world is created
     *
     * @param {Array} buildings - Array of building data {x, y, z, width, depth, height}
     */
    setBuildings(buildings) {
        this.buildings = buildings;
    }

    /**
     * Set the default ground level
     * @param {number} level - Ground Y position
     */
    setGroundLevel(level) {
        this.groundLevel = level;
    }
}
