# Men Game

A 3D game built with Three.js using an Entity-Component System architecture.

## Features

- 3D character movement (WASD controls)
- Smooth rotation and camera following
- Jump mechanics (Spacebar)
- Multiple camera angles
- Procedurally generated world with buildings

## Getting Started

### Run the Game

```bash
npx http-server -p 5173 -c-1
```

Then open `http://localhost:5173/src/index.html` in your browser.

### Controls

- **W/A/S/D** - Move character
- **Spacebar** - Jump
- **Camera Buttons** - Switch between 3 camera angles

## Architecture

This game uses an **Entity-Component System** for clean, extensible code:

- **Entities** - Game objects (player, enemies, items, etc.)
- **Components** - Reusable behaviors (Movement, Rotation, Jump, etc.)
- **Systems** - Game loop that updates all entities

## Project Structure

```
ancient/
├── src/                      # Game source code
│   ├── index.html            # Entry point
│   ├── main.js               # Application initialization
│   ├── core/                 # Core systems
│   │   └── Entity.js         # Base Entity class
│   ├── components/           # Reusable components (state holders)
│   │   ├── PositionComponent.js
│   │   ├── MovementComponent.js
│   │   ├── RotationComponent.js
│   │   ├── JumpComponent.js
│   │   ├── PhysicsComponent.js
│   │   └── index.js          # Component exports
│   ├── controllers/          # Component controllers (managers)
│   │   ├── AnimationController.js
│   │   └── index.js          # Controller exports
│   ├── entities/             # Game entities (organized by type)
│   │   ├── players/          # Player entities
│   │   │   ├── HumanEntity.js
│   │   │   └── index.js
│   │   ├── npcs/             # NPC entities (future)
│   │   ├── world/            # World entities (future)
│   │   └── index.js          # Main entity exports
│   ├── systems/              # Game systems
│   │   ├── SystemManager.js
│   │   ├── InputSystem.js
│   │   ├── PhysicsSystem.js
│   │   └── index.js          # System exports
│   ├── game/                 # Game scene
│   │   ├── GameScene.js      # Main game loop
│   │   └── index.js
│   ├── world/                # World generation
│   │   ├── Plane.js          # Procedural world
│   │   └── index.js
│   ├── loaders/              # Resource loaders
│   │   ├── ModelLoader.js    # GLTF model loading
│   │   └── index.js
│   ├── factories/            # Factory functions
│   │   ├── camera.js         # Camera setup
│   │   ├── light.js          # Lighting setup
│   │   └── index.js
│   └── utils/                # Utilities
│       ├── constants.js      # Game configuration
│       └── index.js          # Utils exports
├── models/                   # 3D models
│   └── humanoid.glb          # Player model with animations
├── status_imgs/              # Status images
└── README.md                 # This file
```

## Future Expansion

The entity system makes it easy to add:
- **Enemies with AI** → Add to `entities/npcs/`
- **Collectible items** → Add to `entities/world/`
- **Multiple players** → Add to `entities/players/`
- **Projectiles** → Add to `entities/world/`
- **Any game object** by mixing components and organizing by type!

The hierarchical folder structure (`players/`, `npcs/`, `world/`) scales naturally as the game grows.
