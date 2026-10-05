# CODE MEET 2026 — 3D INTERACTIVE ROBOT COMPANION & LANDING PAGE
> **"BEYOND THE EVENT HORIZON"**  
> Official 3D interactive landing page for **CODE MEET 2026** (24-Hour Hackathon & Tech Fest).  
> Hosted by **SUIET, Mukka** (Srinivas University Institute of Engineering & Technology) in collaboration with **Webflow Community**.

---

## 🤖 STEP 0: SPLINE SCENE INSPECTION REPORT

When auditing the 3D robot character scene (`https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`), the following primary objects and hierarchy were identified:

| Object Name | Type / Role | Action Taken |
|---|---|---|
| `Head` / `Head 2` | Robot Cranium & Face | Selected as primary gaze tracking object (`HEAD_OBJECT_NAME = "Head"`) with clamped yaw (+/-35°) and pitch (+/-20°). |
| `eyE` | Glowing Visor / Eyes | Used for interactive hover highlights and reactions. |
| `Neck` | Articulation Joint | Coordinates head pivot. |
| `Body` / `BodyG` | Main Torso | Configured for proportional body turning (~30% of head angle). |
| `arm`, `forearm`, `Hand` | Upper Extremities | Positioned for idle and scroll animation gestures. |

---

## ⚡ WHAT WAS REMOVED / AUDITED
1. **Removed Old 3D Helmet from R3F**: To avoid two heavy WebGL contexts competing for GPU resources, `RobotHelmet` was removed from the background Three.js scene. The background now retains only the lightweight `Starfield` and procedural `BlackHole` (`z-0`), leaving the foreground (`z-10`) dedicated to the interactive Spline 3D robot.
2. **Removed Top Credentials Strip**: Removed the header strip that overlapped the top of the hero section, giving the `CODE MEET 2026` title generous top padding (`pt-32` to `pt-40`) without touching the navbar.
3. **Replaced Text Preloader with Video Loader**: Removed the terminal boot sequence preloader. The site now loads with the official **3.9-second cinematic video loading screen** (`helmet_loading.mp4` / `Helmet_animation_.mp4`) with audio enabled and seamless blur-dissolve into the website.

---

## 🎮 ROBOT COMPANION BEHAVIORS & INTERACTIONS

1. **True Robot-Centric Gaze Following**:
   - Gaze coordinates are normalized relative to the **robot's actual on-screen bounding rect**, not the window center. The robot accurately looks at your cursor or finger wherever it is located.
   - Smooth delta-time damping (lerp factor ~0.08) ensures fluid movement without snapping.
2. **Target Tracking (`data-robot-target`)**:
   - Hovering over `REGISTER NOW`, `VIEW MISSIONS`, or the `COUNTDOWN TIMER` causes the robot to lock its gaze directly onto that element.
3. **Interactive Reactions (Click / Tap)**:
   - Clicking or tapping the robot cycles through 3 reactions (wave, jolt, lime visor flash).
   - Rate-limited to max 3 flashes/second.
4. **Scroll Choreography Across Sections**:
   - **Hero**: Robot stations on the right (40vw, 75-85vh). The Prize card is moved lower so the robot's face remains 100% visible.
   - **About**: Robot glides left, scaling to ~72%, turning to face the mission briefing copy.
   - **Missions (Day 1)**: Robot shifts right, ~62% scale, focusing on event cards.
   - **Hackathon (24H)**: Robot centers behind the 24-hour ring (~86% scale) as the climax.
   - **Prizes**: Robot hovers beside the ₹50,000 payload box.
   - **Final CTA**: Robot positions beside the QR code, directing visitors to register.
   - **Footer**: Robot docks as a subtle corner companion.
5. **Fast Scrolling Velocity Tilt**:
   - Rapid scrolling causes the robot to dynamically tilt opposite to the scroll momentum before settling.
6. **Mobile Optimization**:
   - `touch-action: pan-y` ensures smooth page scrolling without trapping touch gestures.
   - Docks smoothly to the bottom right on mobile devices after the hero section.

---

## ⚙️ CONFIGURATION & HOW TO CHANGE SETTINGS

All robot companion settings are centralized in **[`src/components/RobotCompanion.tsx`](file:///C:/Users/thora/OneDrive/Desktop/Codemeet%2026/Web/src/components/RobotCompanion.tsx)**:

```typescript
export const ROBOT_CONFIG = {
  SCENE_URL: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
  HEAD_OBJECT_NAME: "Head",    // Change to target a different mesh for gaze
  BODY_OBJECT_NAME: "Body",
  EYE_OBJECT_NAME: "eyE",
  FALLBACK_IMAGE: "/assets/helmet.png",
  MAX_FLASHES_PER_SEC: 3
};
```

To edit text, dates, or unconfirmed items, modify **[`src/data/content.ts`](file:///C:/Users/thora/OneDrive/Desktop/Codemeet%2026/Web/src/data/content.ts)**.

---

## 🌐 LIVE TESTING

- **PC (Windows):** [**http://localhost:3000**](http://localhost:3000)
- **Phone (same Wi-Fi):** **`http://10.46.28.110:3000`**
