# Men Folder Architecture - Entity Component System

## Overview

The codebase has been restructured to use an **Entity-Component System** pattern. This makes it easy to add new game objects (enemies, items, etc.) without duplicating code.

## File Structure

```
men/
├── entity.js          # Base Entity class and Components (NEW)
├── human.js           # HumanEntity creation (REFACTORED)
├── scene.js           # Main game loop using entities (REFACTORED)
├── plane.js           # World/ground creation (UNCHANGED)
├── utils.js           # Camera and light utilities (UNCHANGED)
├── constants.js       # Game constants (UNCHANGED)
└── index.html         # Entry point (UNCHANGED)
```

## How It Works

### 1. Entity System (`entity.js`)

**Entity Class**: Base class for all game objects
- Stores components (abilities)
- Updates all components each frame
- Manages Three.js visual representation

**Components** (reusable behaviors):
- `PositionComponent` - Tracks position
- `MovementComponent` - Keyboard-based movement
- `RotationComponent` - Smooth rotation
- `JumpComponent` - Jumping behavior

### 2. Human Entity (`human.js`)

**Before**: `createHuman()` returned a Three.js Group

**Now**: `createHumanEntity()` returns an Entity with:
- Visual representation (the Three.js mesh)
- Position component
- Movement component (responds to WASD)
- Rotation component (smooth rotation)
- Jump component (spacebar to jump)

### 3. Scene Management (`scene.js`)

**Before**: Directly manipulated `human.position`, `human.rotation`

**Now**: 
- Creates `humanEntity` using entity system
- Stores all entities in an array
- Updates all entities each frame: `entities.forEach(e => e.update(dt))`
- Components handle their own logic automatically

## Key Benefits

### ✅ Easy to Add New Objects

Want to add an enemy? Just:
```javascript
const enemy = new Entity("Enemy");
enemy.setThreeObject(createEnemyMesh());
enemy.addComponent("position", new PositionComponent(10, 1, 10));
enemy.addComponent("movement", new MovementComponent(1)); // Slower speed
enemy.addComponent("ai", new AIComponent()); // Different behavior
entities.push(enemy);
```

### ✅ No Code Duplication

Movement logic is in `MovementComponent` - reusable for any entity!

### ✅ Clean Separation

- **Visual** (Three.js mesh) - in `human.js`
- **Behavior** (components) - in `entity.js`
- **Game Logic** (scene management) - in `scene.js`

## Example: Adding a Coin

```javascript
// In scene.js
const coin = new Entity("Coin");
coin.setThreeObject(createCoinMesh());
coin.addComponent("position", new PositionComponent(5, 1, 5));
coin.addComponent("collectible", new CollectibleComponent());
entities.push(coin);
```

That's it! The coin automatically rotates (if CollectibleComponent handles that) and can be collected.

## Component Details

### MovementComponent
- Responds to keyboard input (WASD)
- Updates position based on speed
- Automatically updates rotation target

### RotationComponent
- Smoothly rotates towards target
- Handles shortest-path rotation (wraps around)

### JumpComponent
- Handles jump physics
- Integrates with main game loop (no recursive requestAnimationFrame!)
- Fixed the old jump bug

### PositionComponent
- Syncs with Three.js object position
- Can be used for collision detection later

## Migration Notes

- `index.html` - **No changes needed** (same API)
- All existing functionality preserved
- Jump system now works properly (fixed the bug!)
- Code is more maintainable and extensible

## Next Steps

Now you can easily:
1. Add enemies (just create entities with AI components)
2. Add collectibles (entities with collectible components)
3. Add projectiles (entities with velocity components)
4. Add NPCs (entities with different movement/ai components)

All without duplicating movement, rotation, or position code!
