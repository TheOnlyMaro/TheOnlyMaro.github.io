# 🌀 Portal 3D: Web Edition

A high-performance, browser-based 3D puzzle-platformer inspired by the classic Portal series. Built with **Three.js**, this project features seamless portal teleportation, physics-integrated puzzles, and complex level design.

---

## 🚀 Core Features

-   **High-Fidelity Portals**: Real-time recursive rendering for recursive portal views.
-   **Seamless Teleportation**: Instant, momentum-preserving transit through portals.
-   **Physics Puzzles**: Grabbable cubes, pressure-sensitive buttons, and door mechanics.
-   **Level Challenges**: Progress from basic movement to complex spatial puzzles.
-   **Dynamic Audio**: Immersive ambient noises and sound effects for a complete experience.

---

## 🛠️ Technology Stack

-   **Engine**: [Three.js](https://threejs.org/) (WebGL)
-   **Logic**: Vanilla JavaScript (ES6 Modules)
-   **Physics**: Custom collision and gravity controllers
-   **Styling**: Modern CSS3 with glassmorphism effects

---

## 🎮 How to Play

Master the portals to navigate through increasingly difficult test chambers.

### **Controls**
| Action | Key / Input |
| :--- | :--- |
| **Move** | `W` `A` `S` `D` |
| **Jump** | `Space` |
| **Shoot Portal** | `Left Click` |
| **Pickup/Drop Cube** | `Left Click` (when looking at cube) |
| **Blue Portal** | `Q` |
| **Orange Portal** | `E` |
| **Look Around** | `Mouse Movement` |

---

## 🛠️ Getting Started

### **Prerequisites**
-   [Node.js](https://nodejs.org/) installed on your machine.

### **Installation**
1.  Clone the repository and navigate to the directory:
    ```bash
    npm install
    ```

2.  Launch the development server:
    ```bash
    npm run dev
    # OR for a quick static server:
    npx http-server -p 8000 -c-1
    ```

---

## 📂 Project Structure

-   `core/` — Core engine, renderer, and camera management.
-   `portal_logic/` — The "brains" behind portal rendering and teleportation.
-   `scenes/` — Level definitions and environment setup.
-   `models/` — 3D assets (GLTF/GLB).
-   `Controllers/` — Input handling (Keyboard, Mouse, Player).

---

## 👷 Developer Notes

-   **Disable Cache**: During development, keep your browser DevTools open (F12) and ensure **"Disable Cache"** is checked in the Network tab to see immediate JS/CSS changes.
-   **Refresh Assets**: If textures or models appear stale, unregister any active Service Workers in the Application tab.
-   **Level Selection**: You can manually switch levels by changing the `CURRENT_LEVEL` constant in `main.js`.

---

