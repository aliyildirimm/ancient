export class Entity {
    constructor(name = 'Entity') {
        this.name = name;
        this.id = Symbol('entity');
        this.components = new Map();
        this.active = true;
        this.threeObject = null;
    }

    addComponent(name, component) {
        this.components.set(name, component);
        if (component.onAdd) {
            component.onAdd(this);
        }
    }

    getComponent(name) {
        return this.components.get(name) || null;
    }

    hasComponent(name) {
        return this.components.has(name);
    }

    removeComponent(name) {
        const component = this.components.get(name);
        if (component && component.onRemove) {
            component.onRemove(this);
        }
        this.components.delete(name);
    }

    update(deltaTime) {
        if (!this.active) return;

        this.components.forEach((component) => {
            if (component.update) {
                component.update(deltaTime, this);
            }
        });
    }

    setThreeObject(object) {
        this.threeObject = object;
    }

    getThreeObject() {
        return this.threeObject;
    }

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
