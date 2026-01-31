/**
 * Base Entity class
 * All game objects extend this
 */
export class Entity {
    constructor(name = 'Entity') {
        this.name = name;
        this.id = Symbol('entity');
        this.components = new Map();
        this.active = true;
        this.threeObject = null; // Three.js visual representation
    }

    /**
     * Add a component to this entity
     */
    addComponent(name, component) {
        this.components.set(name, component);
        if (component.onAdd) {
            component.onAdd(this);
        }
    }

    /**
     * Get a component by name
     */
    getComponent(name) {
        return this.components.get(name) || null;
    }

    /**
     * Check if entity has a component
     */
    hasComponent(name) {
        return this.components.has(name);
    }

    /**
     * Remove a component
     */
    removeComponent(name) {
        const component = this.components.get(name);
        if (component && component.onRemove) {
            component.onRemove(this);
        }
        this.components.delete(name);
    }

    /**
     * Update the entity (called each frame)
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update all components
        this.components.forEach((component) => {
            if (component.update) {
                component.update(deltaTime, this);
            }
        });
    }

    /**
     * Set the Three.js object for this entity
     */
    setThreeObject(object) {
        this.threeObject = object;
    }

    /**
     * Get the Three.js object
     */
    getThreeObject() {
        return this.threeObject;
    }

    /**
     * Destroy the entity and clean up
     */
    destroy() {
        this.components.forEach((component) => {
            if (component.onRemove) {
                component.onRemove(this);
            }
        });
        this.components.clear();
        this.active = false;
    }
}
