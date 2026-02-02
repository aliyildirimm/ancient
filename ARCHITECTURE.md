# Game Architecture - Entity Component System

## Overview

The codebase uses an **Entity-Component System** pattern for clean, extensible code. This makes it easy to add new game objects (enemies, items, etc.) without duplicating code.

## File Structure

```
src/
├── core/                          # Core systems
│   └── Entity.js                 # Base Entity class
│
├── components/                    # Reusable components (pure state holders)
│   ├── PositionComponent.js       # Position tracking
│   ├── MovementComponent.js       # WASD keyboard movement
│   ├── RotationComponent.js       # Smooth rotation
│   ├── JumpComponent.js           # Jump behavior
│   ├── PhysicsComponent.js        # Physics state (velocity, acceleration, gravity)
│   └── index.js                   # Component exports
│
├── controllers/                   # Component controllers (meta-managers)
│   ├── AnimationController.js     # Model animation state machine
│   └── index.js                   # Controller exports
│
├── entities/                      # Game entities (organized by type)
│   ├── index.js                   # Main entity exports
│   ├── players/                   # Player entities
│   │   ├── HumanEntity.js        # Player entity (GLTF model with animations)
│   │   └── index.js               # Player entity exports
│   ├── npcs/                      # NPC entities (future)
│   │   └── index.js               # NPC entity exports (placeholder)
│   └── world/                     # World entities (future)
│       └── index.js               # World entity exports (placeholder)
│
├── systems/                       # Game systems
│   ├── InputSystem.js            # Keyboard input handling
│   ├── PhysicsSystem.js          # Gravity, collision, ground detection
│   ├── SystemManager.js          # System orchestration
│   └── index.js                   # System exports
│
├── game/
│   ├── GameScene.js              # Main game loop and scene setup
│   └── index.js                   # Game exports
│
├── world/
│   ├── Plane.js                  # Procedural world generation
│   └── index.js                   # World exports
│
├── loaders/                       # Resource loaders
│   ├── ModelLoader.js            # GLTF model & animation loading
│   └── index.js                   # Loader exports
│
├── factories/                     # Factory functions
│   ├── camera.js                 # Camera setup
│   ├── light.js                  # Lighting setup
│   └── index.js                   # Factory exports
│
├── utils/
│   ├── constants.js              # Game constants
│   └── index.js                   # Utils exports
│
├── index.html                     # Entry point
└── main.js                        # Application initialization
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

**PhysicsComponent** (`components/PhysicsComponent.js`)
- Stores physics state: velocity, acceleration, mass
- Tracks grounded state and ground level
- Used by PhysicsSystem for gravity and collision resolution

### 2b. Controllers (`controllers/`)

**AnimationController** (`controllers/AnimationController.js`)
- Manages THREE.AnimationMixer for GLTF model animations
- State machine: idle ↔ walk ↔ jump based on input and physics
- Automatically plays/stops animations based on game state
- Handles animation transitions smoothly
- Note: Controllers are distinct from components—they orchestrate other systems

**Component Index** (`components/index.js`)
- Exports all components for easy importing
- Use: `import { MovementComponent } from './components/index.js'`

### 3. Entities (`entities/`)

Entities are organized hierarchically by type for scalability:

**Player Entities** (`entities/players/`)
- **HumanEntity** (`entities/players/HumanEntity.js`)
  - Creates the player entity from GLTF model (`models/humanoid.glb`)
  - Automatically loads 21 built-in animations
  - Scales model 1.5x and positions above ground
  - Composes: PositionComponent, MovementComponent, RotationComponent, JumpComponent, PhysicsComponent, AnimationController
  - Exports `createHumanEntity(modelUrl)` async function

**NPC Entities** (`entities/npcs/`) (Future)
- Placeholder for NPC entities (enemies, allies, etc.)

**World Entities** (`entities/world/`) (Future)
- Placeholder for world objects (buildings, collectibles, etc.)

**Entity Index** (`entities/index.js`)
- Re-exports main entities for convenient importing
- Use: `import { createHumanEntity } from './entities/index.js'`

### 4. Systems (`systems/`)

**SystemManager** (`systems/SystemManager.js`)
- Orchestrates game systems
- Calls `preUpdate()` phase (input capture)
- Calls `postUpdate()` phase (collision resolution)
- Manages system lifecycle (init/destroy)

**InputSystem** (`systems/InputSystem.js`)
- Centralizes keyboard input (keydown/keyup)
- Tracks current key state and "just pressed" events
- Clears frame-specific state each preUpdate

**PhysicsSystem** (`systems/PhysicsSystem.js`)
- Applies gravity and velocity
- Detects ground collisions (raycasting by height)
- Resolves building collisions (3D AABB)
- Updates entity positions based on physics

### 5. Scene Management (`game/GameScene.js`) **UPDATED**

**Game Loop**:
- Creates entities using entity system
- Initializes systems (InputSystem, PhysicsSystem)
- Updates all systems each frame:
  - `systemManager.preUpdate(dt)` - capture input
  - `entities.forEach(e => e.update(dt))` - update entity components
  - `systemManager.postUpdate(dt)` - resolve collisions
- Components handle their own logic automatically

**Key Features**:
- Entity-based updates (no direct manipulation)
- Camera dynamically follows character (positioned behind at distance)
- Dynamic camera positioning based on character rotation
- Keyboard input via InputSystem
- Physics via PhysicsSystem

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

### Importing Controllers
```javascript
// Import specific controller
import { AnimationController } from './controllers/index.js';
```

### Importing Entities
```javascript
// Import entity creation function from main barrel export
import { createHumanEntity } from './entities/index.js';

// Or import directly from subfolder
import { createHumanEntity } from './entities/players/HumanEntity.js';
```

### Importing Loaders
```javascript
// Import loader from new loaders folder
import { loadHumanoidModelWithAnimations } from './loaders/ModelLoader.js';
// Or via barrel export
import { loadHumanoidModelWithAnimations } from './loaders/index.js';
```

### Importing Factories
```javascript
// Import factories from new factories folder
import { createCamera, createLight } from './factories/index.js';
```

### Importing Core
```javascript
// Import base Entity class
import { Entity } from './core/Entity.js';
```

### Importing Constants
```javascript
// Import constants from utils
import { SPEED, JUMP_SPEED, ROTATION_SPEED } from './utils/constants.js';
// Or via barrel export
import { SPEED, JUMP_SPEED } from './utils/index.js';
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

## Current Status

✅ **Completed**:
- Player movement (WASD tank controls)
- Model-based animations (idle, walk, jump with automatic transitions)
- Physics system (gravity, ground detection, building collision)
- Procedural world generation
- Dynamic camera following
- Input system with centralized keyboard handling

⚠️ **Known Issues**:
- Texture blob URLs fail to load (model renders untextured)
- Only one player entity supported

## Next Steps

Easy additions using existing ECS system:
1. **Add enemies** - Create entities with AI components
2. **Add collectibles** - Entities with collectible components
3. **Add projectiles** - Entities with velocity components
4. **Add NPCs** - Entities with different movement/animation components
5. **Fix texture loading** - Improve model texture blob URL handling or use alternative approach
6. **Add UI** - Create HUD components for health, score, etc.
7. **Add sound** - Audio system for footsteps, jumping, etc.

All without duplicating movement, rotation, animation, or physics code!

## Best Practices

1. **One component per file** - Keeps code organized
2. **Use index.js** - Makes imports cleaner
3. **Component naming** - Use `Component` suffix (e.g., `MovementComponent`)
4. **Entity naming** - Use `Entity` suffix for entity files (e.g., `HumanEntity.js`)
5. **Keep components focused** - Each component should do one thing well
