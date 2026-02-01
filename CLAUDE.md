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

- `src/core/Entity.js` — Base class. Stores components in a `Map<name, component>`, calls `update(deltaTime, entity)` on each component every frame. Manages Three.js object attachment.
- `src/components/` — One file per component (PositionComponent, MovementComponent, RotationComponent, JumpComponent). Each is self-contained with optional lifecycle: `onAdd(entity)`, `update(dt, entity)`, `onRemove(entity)`.
- `src/entities/` — Entity factory functions (e.g., `createHumanEntity()`) that compose an Entity with components and a Three.js mesh.
- `src/game/GameScene.js` — Scene setup, entity creation, game loop (`requestAnimationFrame`), camera controls (OrbitControls with 3 preset angles).
- `src/world/Plane.js` — Procedural world generation: 16x16 grid of ground tiles, ~25% chance of random-colored buildings per tile (excluded from center spawn area).
- `src/utils/constants.js` — All game configuration values (speeds, grid dimensions, key mappings, building sizes).
- `src/utils/camera.js` and `src/utils/light.js` — Three.js camera and lighting setup.

## Conventions

- Components use `Component` suffix, entities use `Entity` suffix in filenames
- Each `components/` and `entities/` folder has an `index.js` barrel export
- Imports use relative paths with `.js` extensions (required for native ES modules)
- Constants are imported from `src/utils/constants.js`
- No npm/node runtime — everything runs in the browser
