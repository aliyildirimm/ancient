# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A 3D browser-based game built with vanilla JavaScript (ES6 modules) and Three.js. No build tools, no npm dependencies, no bundler. Three.js is loaded via CDN importmap in `src/index.html`.

## Running the Game

```bash
npx http-server -p 5173 -c-1
# Open http://localhost:5173/src/index.html
```

No build step, test framework, or linter is configured.

## Architecture

**Entity-Component System (ECS)** — the core design pattern throughout.

**Entry flow:** `src/index.html` → `src/main.js` → `src/game/GameScene.js`

### Core Components
- `src/core/Entity.js` — Base class. Stores components in a `Map<name, component>`, calls `update(deltaTime, entity)` on each component every frame. Manages Three.js object attachment.
- `src/components/` — Pure component system (state holders):
  - `PositionComponent` — Tracks entity position (x, y, z)
  - `MovementComponent` — WASD tank-style controls (W/S move forward, A/D rotate)
  - `RotationComponent` — Smooth rotation management
  - `JumpComponent` — Jump logic with air jumps support
  - `PhysicsComponent` — Mass, velocity, acceleration, gravity, collision state

  Each component is self-contained with optional lifecycle: `onAdd(entity)`, `update(dt, entity)`, `onRemove(entity)`.

- `src/controllers/` — Component controllers (orchestrators):
  - `AnimationController` — Manages model-based animations using THREE.AnimationMixer. Automatically transitions between idle/walk/jump animations based on input and physics state.

### Entity & World Systems
- `src/entities/players/HumanEntity.js` — Creates a humanoid player entity from `models/humanoid.glb` (GLTF model with 21 built-in animations). Scales the model, positions it above ground, and composes all movement, physics, and animation components.
- `src/entities/` — Organized hierarchically by type:
  - `players/` — Player entities
  - `npcs/` — NPC entities (placeholder for future)
  - `world/` — World objects (placeholder for future)
- `src/game/GameScene.js` — Scene setup, entity creation, game loop (`requestAnimationFrame`), camera follow system (positioned behind character dynamically).
- `src/world/Plane.js` — Procedural world generation: 16x16 grid of ground tiles (0.5m height), ~25% chance of random-colored buildings per tile (excluded from center spawn area).

### Systems
- `src/systems/InputSystem.js` — Centralized keyboard input handling with key press and "just pressed" state tracking
- `src/systems/PhysicsSystem.js` — Gravity, velocity, collision detection (3D AABB with buildings), ground detection

### Utilities & Factories
- `src/loaders/ModelLoader.js` — GLTF model loading with texture blob preservation and animation extraction
- `src/factories/camera.js` and `src/factories/light.js` — Three.js camera and lighting setup
- `src/utils/constants.js` — All game configuration values (speeds, grid dimensions, key mappings, building sizes, animation parameters)

## Conventions

- Components use `Component` suffix, entities use `Entity` suffix in filenames
- Controllers are meta-managers stored in `src/controllers/` separate from pure components
- Entities are organized hierarchically: `src/entities/players/`, `src/entities/npcs/`, `src/entities/world/`
- Loaders are in `src/loaders/`, factories are in `src/factories/`
- Each major folder has an `index.js` barrel export for convenient importing
- Imports use relative paths with `.js` extensions (required for native ES modules)
- Constants are imported from `src/utils/constants.js` or `src/utils/index.js`
- No npm/node runtime — everything runs in the browser

## Current Game Features

### Player Character
- **Model**: GLTF humanoid with 21 built-in animations (idle, walk, walk_left, walk_right, walk_back, run, jump, etc.)
- **Controls**: WASD for movement (W forward, S backward, A rotate left, D rotate right), Space to jump
- **Animation System**: Automatic animation state machine (idle ↔ walk ↔ jump) based on input and physics
- **Physics**: Gravity, ground detection, building collision, 3D AABB collision resolution
- **Scale**: 1.5x model size, positioned 1.0+ units above ground for visibility

### World
- 16×16 procedurally generated grid of ground tiles
- Random colored buildings (~25% per tile, excluded from spawn area)
- Camera follows character dynamically, positioned behind at fixed distance and height

### Known Limitations
- Texture blob URLs fail to load (character renders untextured but fully functional)
- No sound system
- No UI/HUD
- Single player only
- Limited animation set (21 animations from model)
