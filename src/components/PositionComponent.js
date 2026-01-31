/**
 * Position Component
 * Manages entity position in 3D space
 */
export class PositionComponent {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    onAdd(entity) {
        if (entity.threeObject) {
            entity.threeObject.position.set(this.x, this.y, this.z);
        }
    }

    update(deltaTime, entity) {
        if (entity.threeObject) {
            // Sync position from Three.js object
            this.x = entity.threeObject.position.x;
            this.y = entity.threeObject.position.y;
            this.z = entity.threeObject.position.z;
        }
    }

    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (this.entity && this.entity.threeObject) {
            this.entity.threeObject.position.set(x, y, z);
        }
    }

    getPosition() {
        return { x: this.x, y: this.y, z: this.z };
    }
}
