# Level Three - Complex Portal Puzzle Level Design

## Overview
This level is a sophisticated multi-room portal puzzle that guides the player through a carefully designed sequence of challenges, forcing them to master portal mechanics and spatial reasoning.

## Level Structure

### 1. **Initial Dark Corridor (Corridor 1)**
- **Purpose**: Tutorial area that teaches the player about light mechanics
- **Length**: 150 units
- **Key Features**:
  - Starts in complete darkness (no ambient light)
  - **Button Behind Player** (at position 5,0,0): Pressing this button activates ambient lighting
  - **Light Bulb at End** (position 150,8,0): Emissive sphere that glows when activated
  - Forces player to explore and understand the environment
  - **Visual Progression**: Player goes from darkness to light discovery

**Player Journey**:
1. Spawns at entrance unable to see anything
2. Turns around or explores to find the button
3. Button press turns on ambient light and spotlight at light bulb
4. Now sees the light bulb at the end of corridor
5. Motivation to move forward toward the light

---

### 2. **Underground Pit with Obstacles**
- **Purpose**: Introduce platforming challenges and spike hazards
- **Location**: Below ground level (y = -8)
- **Components**:

#### Spike Area 1 (Directly ahead)
- **Position**: X: 110, Z: 0
- **Length**: 15 units
- **Hazard**: Cone-shaped spikes arranged in a row
- **Difficulty**: JUMPABLE - Player can leap over with careful timing
- **Learning**: Introduces spike hazards; player learns to avoid/jump

#### Platform 1 (Landing spot)
- **Position**: X: 130, Z: 0
- **Size**: 8x8 units
- **Purpose**: Safe resting point; teaches platforming
- **Difficulty**: JUMPABLE - Medium jump distance from spike area 1

#### Spike Area 2 (Blocked path forward)
- **Position**: X: 150, Z: 0
- **Length**: 15 units
- **Hazard**: Dense spike formation
- **Difficulty**: NOT JUMPABLE - Gap too wide; impossible to clear
- **Learning Moment**: Player realizes portals are necessary
- **Forced Mechanic**: Must use portal to bypass

#### Platform 2 (Portal landing spot)
- **Position**: X: 167, Z: 0
- **Size**: 5x5 units (very tight)
- **Purpose**: Small landing area reachable only via portal
- **Challenge**: Portal must be placed at precise angle on ceiling
- **Difficulty**: PORTAL-ONLY - Tests portal placement accuracy

---

### 3. **Second Corridor (Corridor 2)**
- **Purpose**: Transitional space; tempts player forward
- **Length**: 60 units
- **Position**: Turns right (offset from main path)
- **Key Features**:
  - **Light Bulb at End** (position 210,8,30)
  - Visible from the end of Corridor 1
  - Provides visual goal and motivation
  - Emissive yellow glow

**Strategic Design**:
- Player sees this light from afar
- Tempts them to move forward into Corridor 2
- Builds anticipation for the final challenge

---

### 4. **Spike Corridor (Corridor 3)**
- **Purpose**: Final challenge area; dangerous environment
- **Length**: 80 units
- **Position**: Turns right again (creates winding path)
- **Floor**: Covered with spike cones throughout
- **Hazard Level**: HIGH - Spikes everywhere
- **Navigation**: Must jump carefully or use portals to avoid

---

### 5. **Final Platform Room**
- **Purpose**: Boss room / Final puzzle area
- **Size**: 12x12 unit square platform
- **Position**: X: 295, Z: 85 (at end of Corridor 3)
- **Height**: Y: 5 (above spike level)

#### Components on Final Platform:

**Puzzle Block** (DraggableCube)
- **Position**: X: 290, Y: 2, Z: 85
- **Purpose**: Pressure-activated trigger object
- **Mechanics**: Must be placed on the button to open exit

**Button on Wall** (Wall Button)
- **Position**: X: 295, Y: 5, Z: 105
- **Distance**: Far enough (10 units) to be unreachable by walking
- **Access**: PORTAL-ONLY - Must portal through to reach
- **Constraint**: Player cannot stand in that location when button is pressed

**Exit Door**
- **Position**: X: 295, Y: 5, Z: 100
- **Activation**: Opens when block is placed on button
- **Message**: Signifies level completion

---

## Puzzle Mechanics

### Portal Strategy Requirements

The level forces players to use portals in specific ways:

1. **Spike Area 2 Bypass**: 
   - Cannot jump across spike area 2
   - Must place portal on ceiling above Platform 2
   - Portal must be at tight angle for landing precision

2. **Wall Button Access**:
   - Button is behind player relative to the main platform
   - Must place portal to teleport behind/to the button location
   - Demonstrates "indirect access" portal mechanic

3. **Block Placement**:
   - Block on button opens exit
   - Player cannot stand on button when block is activated
   - Forces understanding of physics consequences

---

## Light Mechanics

### Ambient Light System
- **Initially OFF** at scene start
- **Activated by**: Button press in Corridor 1
- **Intensity**: 0.6 (medium ambient illumination)
- **Effect**: Reveals the entire level for navigation

### Point Lights
- **Spotlight 1** (Corridor 1 end): Illuminates light bulb with yellow glow
- **Spotlight 2** (Corridor 2 end): Same yellow glow effect
- **Purpose**: Visual navigation aids; guide player through level

### Light Bulb Design
- **Material**: Emissive spheres (yellow, #ffff99)
- **Glow Effect**: Additional transparent sphere for halo effect
- **Position**: Ceiling height (y: 8-9)
- **Visibility**: Acts as waypoint markers

---

## Level Dimensions Reference

```
Corridor 1:
- Start: X: 0-150, Y: 0, Z: -5 to 5
- Width: 10 units, Height: 10 units

Underground Pit:
- Floor Y: -8
- Platforms: varying X positions
- Spike areas: Dense cone forests

Corridor 2:
- X: 145-205, Y: 0, Z: 20-40
- Offset for right turn

Corridor 3:
- X: 205-285, Y: 0, Z: 75-95
- Another right turn
- Spike floor

Final Platform:
- X: 295, Y: 5, Z: 85
- 12x12 unit square
```

---

## Gameplay Flow

### Player Journey:
1. **Dark Start**: Spawn confused in darkness
2. **Discovery**: Find button, activate lights
3. **Exploration**: Walk through Corridor 1 toward light
4. **Fall/Jump**: Descend to underground pit
5. **Platforming**: Jump Spike Area 1 and Platform 1
6. **Portal Realization**: Spike Area 2 blocks path → use portal
7. **Corridor 2**: Walk through and see next light bulb
8. **Corridor 3**: Navigate spike corridor (challenging)
9. **Final Platform**: Reach the goal platform
10. **Block Puzzle**: Use block to trigger door
11. **Button Challenge**: Portal to unreachable wall button
12. **Exit**: Door opens, level complete

---

## Design Principles

### 1. **Progressive Difficulty**
- Starts with light introduction
- Simple platforming (Spike Area 1)
- Forced portal usage (Spike Area 2)
- Complex spatial reasoning (Final platform)

### 2. **Environmental Storytelling**
- Darkness → Light metaphor
- Light bulbs act as waypoints
- Architecture guides player direction

### 3. **Challenge Escalation**
- Each section gets harder
- Portal dependency increases
- Final section combines all mechanics

### 4. **Spatial Design**
- Multiple turns create distinct areas
- Height variations (pit) add dimension
- Final platform elevated for emphasis

---

## How to Use in Your Project

### Loading the Level:
```javascript
// In main.js, set:
const CURRENT_LEVEL = 3; // To test Level Three

// The scene will automatically initialize with all features
```

### Accessing Level Features:
```javascript
// Ambient light control
scene.userData.ambientLight // Can modify intensity
scene.userData.spotLight1 // First corridor light
scene.userData.spotLight2 // Second corridor light

// Puzzle objects
scene.userData.puzzleBlock // Draggable cube
scene.userData.finalButton // Button on wall
scene.userData.exitDoor // Exit door
```

### Modifying Level Parameters:
Edit these in LevelThree.js to customize:
- `corridor1Data = buildCorridor(150, ...)` - Change length/width
- `spikeArea1 = createSpikeArea(scene, position, length, width)`
- `Platform positions and sizes`
- `Light intensities and colors`

---

## Testing Checklist

- [ ] Player spawns in darkness
- [ ] Button press activates lighting
- [ ] Light bulbs glow when lights are on
- [ ] Can jump Spike Area 1
- [ ] Cannot jump Spike Area 2 (blocked)
- [ ] Can portal to Platform 2
- [ ] Can navigate Corridor 2
- [ ] Can navigate Corridor 3 (with spike jumping/portaling)
- [ ] Can reach Final Platform
- [ ] Block interacts with button
- [ ] Door opens when block on button
- [ ] Can portal to wall button
- [ ] Level completion works

---

## Physics and Collision Notes

- **Fall Damage**: Consider adding threshold (spikes hurt, floor doesn't)
- **Platform Size**: Final platform is intentionally tight (12x12)
- **Jump Heights**: Standard player jump ~2-3 units; spikes Area 1 is ~5 units wide
- **Portal Placement**: Raycasting will place portals on vertical surfaces for tight angles

---

## Future Enhancements

Possible additions to make this level even more complex:

1. **Moving Platforms**: Add platforms that move in the pit
2. **Multiple Buttons**: Buttons controlling multiple doors
3. **Timed Mechanics**: Doors that close after button press
4. **Weight-Sensitive Elements**: Block triggers different effects
5. **Portal Puzzles**: Portals that must be placed in specific sequence
6. **Enemy/Hazards**: Moving spikes or laser beams
7. **Gravity Changes**: Inverted gravity in certain areas

---

**Level Design Complete!** 🎮
This level demonstrates advanced portal mechanics and spatial puzzle design.
