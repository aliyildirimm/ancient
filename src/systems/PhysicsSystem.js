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
                const buildingTop = building.y + building.height / 2;
                if (buildingTop > maxHeight) {
                    maxHeight = buildingTop;
                }
            }
        });

        return maxHeight;
    }

    resolveBuildingCollisions(entity, physics) {
        const pos = entity.threeObject.position;

        for (const building of this.buildings) {
            const charBox = this.getCharacterAABB(pos, physics);
            const buildingBox = this.getBuildingAABB(building);

            // Check 3D AABB overlap
            if (!this.aabbOverlap(charBox, buildingBox)) {
                continue; // No collision
            }

            // Calculate penetration depths on each axis
            const penetration = this.getPenetrationDepths(charBox, buildingBox);

            // Find axis with minimum penetration
            let minAxis = 'y';
            let minPenetration = penetration.y;
            if (penetration.x < minPenetration) {
                minAxis = 'x';
                minPenetration = penetration.x;
            }
            if (penetration.z < minPenetration) {
                minAxis = 'z';
            }

            // Resolve collision based on minimum penetration axis
            if (minAxis === 'y') {
                // Y-axis collision - platform or ceiling
                if (charBox.centerY > buildingBox.centerY) {
                    // Character above building center - PLATFORM collision
                    if (physics.velocity.y <= 0) {
                        pos.y = buildingBox.maxY + physics.bottomOffset;
                        physics.velocity.y = 0;
                        physics.isGrounded = true;
                        physics.groundY = buildingBox.maxY;
                        physics.velocity.x *= physics.friction;
                        physics.velocity.z *= physics.friction;
                    }
                } else {
                    // Character below building center - CEILING collision
                    if (physics.velocity.y > 0) {
                        pos.y = buildingBox.minY + physics.bottomOffset;
                        physics.velocity.y = 0;
                    }
                }
            } else if (minAxis === 'x') {
                // X-axis collision - wall (left/right)
                if (charBox.centerX < buildingBox.centerX) {
                    pos.x = buildingBox.minX - physics.colliderRadius;
                } else {
                    pos.x = buildingBox.maxX + physics.colliderRadius;
                }
                physics.velocity.x = 0;
            } else {
                // Z-axis collision - wall (front/back)
                if (charBox.centerZ < buildingBox.centerZ) {
                    pos.z = buildingBox.minZ - physics.colliderRadius;
                } else {
                    pos.z = buildingBox.maxZ + physics.colliderRadius;
                }
                physics.velocity.z = 0;
            }
        }
    }

    setBuildings(buildings) {
        this.buildings = buildings;
    }

    setGroundLevel(level) {
        this.groundLevel = level;
    }

    getCharacterAABB(pos, physics) {
        return {
            minX: pos.x - physics.colliderRadius,
            maxX: pos.x + physics.colliderRadius,
            minY: pos.y - physics.bottomOffset,
            maxY: pos.y - physics.bottomOffset + physics.colliderHeight,
            minZ: pos.z - physics.colliderRadius,
            maxZ: pos.z + physics.colliderRadius,
            centerX: pos.x,
            centerY: pos.y,
            centerZ: pos.z
        };
    }

    getBuildingAABB(building) {
        return {
            minX: building.x - building.width / 2,
            maxX: building.x + building.width / 2,
            minY: building.y - building.height / 2,
            maxY: building.y + building.height / 2,
            minZ: building.z - building.depth / 2,
            maxZ: building.z + building.depth / 2,
            centerX: building.x,
            centerY: building.y,
            centerZ: building.z
        };
    }

    aabbOverlap(box1, box2) {
        return (
            box1.minX < box2.maxX && box1.maxX > box2.minX &&
            box1.minY < box2.maxY && box1.maxY > box2.minY &&
            box1.minZ < box2.maxZ && box1.maxZ > box2.minZ
        );
    }

    getPenetrationDepths(charBox, buildingBox) {
        const overlapX = Math.min(charBox.maxX - buildingBox.minX, buildingBox.maxX - charBox.minX);
        const overlapY = Math.min(charBox.maxY - buildingBox.minY, buildingBox.maxY - charBox.minY);
        const overlapZ = Math.min(charBox.maxZ - buildingBox.minZ, buildingBox.maxZ - charBox.minZ);
        return { x: overlapX, y: overlapY, z: overlapZ };
    }
}
