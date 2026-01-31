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
│   ├── scene.js              # Main game loop
│   ├── constants.js          # Game constants
│   ├── utils.js              # Utilities (camera, lights)
│   ├── plane.js              # World generation
│   ├── core/                 # Core systems
│   │   └── Entity.js         # Base Entity class
│   ├── components/           # Reusable components
│   │   ├── PositionComponent.js
│   │   ├── MovementComponent.js
│   │   ├── RotationComponent.js
│   │   ├── JumpComponent.js
│   │   └── index.js          # Component exports
│   └── entities/             # Game entities
│       ├── HumanEntity.js    # Player entity
│       └── index.js           # Entity exports
├── status_imgs/              # Status images
└── README.md                  # This file
```

## Future Expansion

The entity system makes it easy to add:
- Enemies with AI
- Collectible items
- Multiple players
- Projectiles
- Any game object by mixing components!
