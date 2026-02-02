export class PhysicsSystem {
    constructor() {
        this.gravity = -15;
        this.groundLevel = 0.25;
        this.buildings = [];
    }

    preUpdate(deltaTime, entities) {
        entities.forEach(entity => {
            const physics = entity.getComponent('physics');
            if (!physics || !entity.threeObject) return;

            const pos = entity.threeObject.position;

            if (physics.useGravity && !physics.isGrounded) {
                physics.velocity.y += this.gravity * deltaTime;
            }

            physics.velocity.x += physics.acceleration.x * deltaTime;
            physics.velocity.y += physics.acceleration.y * deltaTime;
            physics.velocity.z += physics.acceleration.z * deltaTime;

            const dragFactor = Math.pow(1 - physics.drag, deltaTime);
            physics.velocity.x *= dragFactor;
            physics.velocity.z *= dragFactor;

            pos.x += physics.velocity.x * deltaTime;
            pos.y += physics.velocity.y * deltaTime;
            pos.z += physics.velocity.z * deltaTime;

            this.checkGroundCollision(entity, physics);
            this.resolveBuildingCollisions(entity, physics);

            physics.acceleration.x = 0;
            physics.acceleration.y = 0;
            physics.acceleration.z = 0;

            const posComponent = entity.getComponent('position');
            if (posComponent) {
                posComponent.x = pos.x;
                posComponent.y = pos.y;
                posComponent.z = pos.z;
            }
        });
    }

    postUpdate(deltaTime, entities) {
        // Re-check ground collision after entity movements (e.g., from MovementComponent)
        entities.forEach(entity => {
            const physics = entity.getComponent('physics');
            if (!physics || !entity.threeObject) return;

            this.checkGroundCollision(entity, physics);
        });
    }

    checkGroundCollision(entity, physics) {
        const pos = entity.threeObject.position;

        // Ground detection uses bottom of entity, not center
        const groundHeight = this.detectGround(pos.x, pos.z);
        const bottomY = pos.y - physics.bottomOffset;
        const groundTolerance = 0.01;

        if (bottomY <= groundHeight + groundTolerance) {
            pos.y = groundHeight + physics.bottomOffset;
            physics.velocity.y = 0;
            physics.isGrounded = true;
            physics.groundY = groundHeight;
            physics.velocity.x *= physics.friction;
            physics.velocity.z *= physics.friction;
        } else {
            physics.isGrounded = false;
        }
    }

    detectGround(x, z) {
        let maxHeight = this.groundLevel;

        this.buildings.forEach(building => {
            const halfWidth = building.width / 2;
            const halfDepth = building.depth / 2;

            const withinX = x >= building.x - halfWidth &&
                           x <= building.x + halfWidth;
            const withinZ = z >= building.z - halfDepth &&
                           z <= building.z + halfDepth;

            if (withinX && withinZ) {
                const buildingTop = building.y + building.height / 2 + this.groundLevel;
                if (buildingTop > maxHeight) {
                    maxHeight = buildingTop;
                }
            }
        });

        return maxHeight;
    }

    resolveBuildingCollisions(entity, physics) {
        const pos = entity.threeObject.position;
        const radius = physics.colliderRadius;

        this.buildings.forEach(building => {
            const halfWidth = building.width / 2;
            const halfDepth = building.depth / 2;

            const closestX = Math.max(
                building.x - halfWidth,
                Math.min(pos.x, building.x + halfWidth)
            );
            const closestZ = Math.max(
                building.z - halfDepth,
                Math.min(pos.z, building.z + halfDepth)
            );

            const distX = pos.x - closestX;
            const distZ = pos.z - closestZ;
            const distanceSquared = distX * distX + distZ * distZ;

            if (distanceSquared < radius * radius && distanceSquared > 0) {
                const distance = Math.sqrt(distanceSquared);
                const penetration = radius - distance;

                const pushDirX = distX / distance;
                const pushDirZ = distZ / distance;

                pos.x += pushDirX * penetration;
                pos.z += pushDirZ * penetration;

                // Project velocity onto collision normal and remove it
                const dot = physics.velocity.x * pushDirX + physics.velocity.z * pushDirZ;
                if (dot < 0) {
                    physics.velocity.x -= pushDirX * dot;
                    physics.velocity.z -= pushDirZ * dot;
                }
            }
        });
    }

    setBuildings(buildings) {
        this.buildings = buildings;
    }

    setGroundLevel(level) {
        this.groundLevel = level;
    }
}
