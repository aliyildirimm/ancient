# Game Architecture - Entity Component System

## Overview

The codebase uses an **Entity-Component System** pattern for clean, extensible code. This makes it easy to add new game objects (enemies, items, etc.) without duplicating code.

## File Structure

```
src/
├── core/                      # Core systems
│   └── Entity.js             # Base Entity class
│
├── components/                # Reusable components
│   ├── PositionComponent.js   # Position tracking
│   ├── MovementComponent.js   # Keyboard movement
│   ├── RotationComponent.js  # Smooth rotation
│   ├── JumpComponent.js      # Jump behavior
│   └── index.js              # Component exports
│
├── entities/                  # Game entities
│   ├── HumanEntity.js        # Player entity
│   └── index.js              # Entity exports
│
├── index.html                 # Entry point
├── scene.js                   # Main game loop
├── constants.js               # Game constants
├── utils.js                   # Utilities (camera, lights)
└── plane.js                   # World generation
```

## How It Works

### 1. Core System (`core/Entity.js`)

**Entity Class**: Base class for all game objects
- Stores components (abilities) in a Map
- Updates all components each frame
- Manages Three.js visual representation
- Handles component lifecycle (onAdd, onRemove)

### 2. Components (`components/`)

Each component is a separate file for better organization:

**PositionComponent** (`components/PositionComponent.js`)
- Tracks x, y, z position
- Syncs with Three.js object position
- Can be used for collision detection

**MovementComponent** (`components/MovementComponent.js`)
- Keyboard-based movement (WASD)
- Updates position based on speed
- Automatically updates rotation target
- Responds to key state changes

**RotationComponent** (`components/RotationComponent.js`)
- Smoothly rotates towards target rotation
- Handles shortest-path rotation (wraps around)
- Configurable rotation speed

**JumpComponent** (`components/JumpComponent.js`)
- Handles jump physics
- Integrates with main game loop (no recursive requestAnimationFrame!)
- Fixed the old jump bug

**Component Index** (`components/index.js`)
- Exports all components for easy importing
- Use: `import { MovementComponent } from './components/index.js'`

### 3. Entities (`entities/`)

**HumanEntity** (`entities/HumanEntity.js`)
- Creates the player entity
- Combines visual mesh with components
- Exports `createHumanEntity()` function

**Entity Index** (`entities/index.js`)
- Exports all entity creation functions
- Use: `import { createHumanEntity } from './entities/index.js'`

### 4. Scene Management (`scene.js`)

**Game Loop**:
- Creates entities using entity system
- Stores all entities in an array
- Updates all entities each frame: `entities.forEach(e => e.update(dt))`
- Components handle their own logic automatically
- OrbitControls for camera (zoom, rotate, pan)

**Key Features**:
- Entity-based updates (no direct manipulation)
- Camera follows player but allows user control
- Keyboard input routed to components
- Multiple camera angles support

## Key Benefits

### ✅ Organized Structure

- **Core** - Base systems (Entity class)
- **Components** - Reusable behaviors (one file per component)
- **Entities** - Game objects (one file per entity type)
- **Root** - Game logic and utilities

### ✅ Easy to Add New Objects

Want to add an enemy? Just:

```javascript
// 1. Create component (if needed)
// src/components/AIComponent.js
export class AIComponent {
    update(dt, entity) {
        // AI logic here
    }
}

// 2. Add to components/index.js
export { AIComponent } from './AIComponent.js';

// 3. Create entity
// src/entities/EnemyEntity.js
import { Entity } from '../core/Entity.js';
import { PositionComponent, MovementComponent, AIComponent } from '../components/index.js';

export const createEnemyEntity = () => {
    const enemy = new Entity("Enemy");
    enemy.setThreeObject(createEnemyMesh());
    enemy.addComponent("position", new PositionComponent(10, 1, 10));
    enemy.addComponent("movement", new MovementComponent(1)); // Slower speed
    enemy.addComponent("ai", new AIComponent());
    return enemy;
};

// 4. Add to scene.js
import { createEnemyEntity } from './entities/index.js';
const enemy = createEnemyEntity();
entities.push(enemy);
```

### ✅ No Code Duplication

- Movement logic in `MovementComponent` - reusable for any entity
- Rotation logic in `RotationComponent` - reusable
- Position tracking in `PositionComponent` - reusable
- Each component is self-contained and testable

### ✅ Clean Separation

- **Visual** (Three.js mesh) - in entity files
- **Behavior** (components) - in `components/` folder
- **Core Logic** (Entity class) - in `core/` folder
- **Game Logic** (scene management) - in `scene.js`

## Example: Adding a Coin

```javascript
// 1. Create CollectibleComponent
// src/components/CollectibleComponent.js
export class CollectibleComponent {
    constructor() {
        this.collected = false;
    }
    
    update(dt, entity) {
        if (!this.collected && entity.threeObject) {
            // Rotate coin
            entity.threeObject.rotation.y += dt;
        }
    }
}

// 2. Add to components/index.js
export { CollectibleComponent } from './CollectibleComponent.js';

// 3. Create coin entity
// src/entities/CoinEntity.js
import { Entity } from '../core/Entity.js';
import { PositionComponent, CollectibleComponent } from '../components/index.js';

export const createCoinEntity = (x, y, z) => {
    const coin = new Entity("Coin");
    coin.setThreeObject(createCoinMesh());
    coin.addComponent("position", new PositionComponent(x, y, z));
    coin.addComponent("collectible", new CollectibleComponent());
    return coin;
};

// 4. Use in scene.js
import { createCoinEntity } from './entities/index.js';
const coin = createCoinEntity(5, 1, 5);
entities.push(coin);
```

## Import Patterns

### Importing Components
```javascript
// Import specific component
import { MovementComponent } from './components/MovementComponent.js';

// Import multiple components
import { PositionComponent, MovementComponent, RotationComponent } from './components/index.js';
```

### Importing Entities
```javascript
// Import entity creation function
import { createHumanEntity } from './entities/index.js';
```

### Importing Core
```javascript
// Import base Entity class
import { Entity } from './core/Entity.js';
```

## Component Lifecycle

Components can implement lifecycle methods:

- `onAdd(entity)` - Called when component is added to entity
- `update(deltaTime, entity)` - Called each frame
- `onRemove(entity)` - Called when component is removed

Example:
```javascript
export class MyComponent {
    onAdd(entity) {
        // Initialize when added
        this.entity = entity;
    }
    
    update(dt, entity) {
        // Update logic here
    }
    
    onRemove(entity) {
        // Cleanup when removed
    }
}
```

## Next Steps

Now you can easily:
1. **Add enemies** - Create entities with AI components
2. **Add collectibles** - Entities with collectible components
3. **Add projectiles** - Entities with velocity components
4. **Add NPCs** - Entities with different movement/ai components
5. **Add systems** - Create systems folder for game systems (collision, physics, etc.)

All without duplicating movement, rotation, or position code!

## Best Practices

1. **One component per file** - Keeps code organized
2. **Use index.js** - Makes imports cleaner
3. **Component naming** - Use `Component` suffix (e.g., `MovementComponent`)
4. **Entity naming** - Use `Entity` suffix for entity files (e.g., `HumanEntity.js`)
5. **Keep components focused** - Each component should do one thing well
