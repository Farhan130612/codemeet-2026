/**
 * ============================================================================
 * ROBOT COMPANION CONFIGURATION (Centralized State & Physics)
 * ============================================================================
 */

export const ROBOT_CONFIG = {
  // Scene Asset URL (Spline runtime stream)
  SCENE_URL: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
  EDITOR_URL: "https://app.spline.design/file/41e42068-e87b-48b6-af9f-9c248721c0bb",
  FALLBACK_IMAGE: "/assets/helmet.png",

  // Mesh Target Hierarchy Names
  HEAD_OBJECT_NAME: "Head",
  BODY_OBJECT_NAME: "Body",
  EYE_OBJECT_NAME: "eyE",

  // Gaze Kinematics & Damping
  MAX_YAW_DEG: 35,       // Max horizontal head turn (+/- 35 deg)
  MAX_PITCH_DEG: 20,     // Max vertical head nod (+/- 20 deg)
  BODY_FOLLOW_RATIO: 0.3,// Body tracks 30% of head rotation
  DAMPING: 0.08,         // Delta-smoothed lerp factor

  // Interactive Flashes & Speech
  MAX_FLASHES_PER_SEC: 3,
  SPEECH_CHIPS: [
    "Ready for the descent?",
    "Squad up, Pilot.",
    "Time dilates at 00:00.",
    "24 hours. No limits.",
    "Need coordinates? Tap me."
  ],

  // 3 Primary Robot States (Driven by Section Boundaries, Eased 1.2s power3.inOut)
  STATES: {
    // 1. HERO STAGE (Desktop: right 45% of viewport, fully visible; Mobile: top ~45svh)
    HERO: {
      desktop: {
        width: '45vw',
        height: '82vh',
        top: '12vh',
        left: '53vw',
        scale: 1.05,
        opacity: 1,
        isPorthole: false
      },
      mobile: {
        width: '90vw',
        height: '46svh',
        top: '10svh',
        left: '5vw',
        scale: 0.78,
        opacity: 1,
        isPorthole: false
      }
    },

    // 2. PINNED SHOWCASE ("The Descent" 24H Hackathon Climax, 300vh scroll)
    SHOWCASE: {
      desktop: {
        width: '52vw',
        height: '84vh',
        top: '8vh',
        left: '42vw',
        scale: 1.25,
        opacity: 1,
        isPorthole: false
      },
      mobile: {
        width: '95vw',
        height: '52svh',
        top: '4svh',
        left: '2.5vw',
        scale: 0.88,
        opacity: 1,
        isPorthole: false
      }
    },

    // 3. MINI COMPANION (Everything else: docked to bottom-right in framed porthole)
    COMPANION: {
      desktop: {
        width: '160px',
        height: '160px',
        bottom: '28px',
        right: '28px',
        top: 'auto',
        left: 'auto',
        scale: 0.48,
        opacity: 1,
        isPorthole: true
      },
      mobile: {
        width: '115px',
        height: '115px',
        bottom: '76px', // Sits cleanly ABOVE the mobile sticky register bar
        right: '16px',
        top: 'auto',
        left: 'auto',
        scale: 0.38,
        opacity: 1,
        isPorthole: true
      }
    },

    // FINAL CTA MOMENT (Large beside the registration QR code)
    FINAL_CTA: {
      desktop: {
        width: '42vw',
        height: '75vh',
        top: '18vh',
        left: '54vw',
        scale: 1.1,
        opacity: 1,
        isPorthole: false
      },
      mobile: {
        width: '88vw',
        height: '42svh',
        top: '12svh',
        left: '6vw',
        scale: 0.72,
        opacity: 0.9,
        isPorthole: false
      }
    },

    // HIDDEN (When sections need 100% clean stage)
    HIDDEN: {
      desktop: {
        width: '160px',
        height: '160px',
        bottom: '28px',
        right: '28px',
        top: 'auto',
        left: 'auto',
        scale: 0.2,
        opacity: 0,
        isPorthole: true
      },
      mobile: {
        width: '115px',
        height: '115px',
        bottom: '76px',
        right: '16px',
        top: 'auto',
        left: 'auto',
        scale: 0.2,
        opacity: 0,
        isPorthole: true
      }
    }
  }
};
