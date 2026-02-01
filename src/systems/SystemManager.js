/**
 * SystemManager
 * Orchestrates the execution of all game systems
 *
 * Systems run in two phases:
 * - preUpdate: Before entity component updates (input capture, etc.)
 * - postUpdate: After entity component updates (collision resolution, rendering, etc.)
 */
export class SystemManager {
    constructor(entities) {
        this.systems = [];
        this.entities = entities;
    }

    /**
     * Register a system with the manager
     * Calls system.init() if it exists
     */
    addSystem(system) {
        this.systems.push(system);
        if (system.init) {
            system.init();
        }
    }

    /**
     * Remove a system from the manager
     * Calls system.destroy() if it exists
     */
    removeSystem(system) {
        const index = this.systems.indexOf(system);
        if (index > -1) {
            if (system.destroy) {
                system.destroy();
            }
            this.systems.splice(index, 1);
        }
    }

    /**
     * Pre-update phase - runs before entity updates
     * Used for systems that need to run first (input capture, etc.)
     */
    preUpdate(deltaTime) {
        this.systems.forEach(system => {
            if (system.preUpdate) {
                system.preUpdate(deltaTime, this.entities);
            }
        });
    }

    /**
     * Post-update phase - runs after entity updates
     * Used for systems that need to run last (collision resolution, rendering, etc.)
     */
    postUpdate(deltaTime) {
        this.systems.forEach(system => {
            if (system.postUpdate) {
                system.postUpdate(deltaTime, this.entities);
            }
        });
    }

    /**
     * Cleanup all systems
     */
    destroy() {
        this.systems.forEach(system => {
            if (system.destroy) {
                system.destroy();
            }
        });
        this.systems = [];
    }
}
