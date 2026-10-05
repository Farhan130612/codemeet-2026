/**
 * ============================================================================
 * CODE MEET 2026 — CENTRALIZED EVENT DATA & CONFIGURATION
 * All confirmed facts are strictly verified from the official poster/brief.
 * Any unconfirmed items are explicitly marked with "TODO: replace".
 * ============================================================================
 */

export const EVENT_CONFIG = {
  // Official Event Identity
  name: "CODE MEET 2026",
  shortName: "CODE MEET",
  year: "2026",
  tagline: "BEYOND THE EVENT HORIZON",
  subTagline: "24 hours. One horizon. Ship before time bends.",
  hashtagBadge: "</> #24hrs_Hackathon",
  
  // 3D Spline Robot Companion Configuration
  splineSceneUrl: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
  splineEditorRef: "https://app.spline.design/file/41e42068-e87b-48b6-af9f-9c248721c0bb",
  
  // Host & Credentials
  host: {
    institution: "SUIET, Mukka",
    fullName: "Srinivas University Institute of Engineering & Technology",
    collaboration: "Webflow Community",
    credentials: [
      { label: "NAAC Accredited Grade A", badgeImg: "/assets/naac-badge.png" },
      { label: "IIC - C202115982", badgeImg: "/assets/srinivas-iic.png" }
    ],
    location: "Mukka, Mangalore, Karnataka, India",
    // TODO: replace with exact Google Maps URL when provided
    mapsUrl: "https://maps.google.com/?q=Srinivas+University+Institute+of+Engineering+and+Technology+Mukka"
  },

  // Key Dates (IST)
  launchDateISO: "2026-10-31T00:00:00+05:30",
  dates: {
    day1: "31st October 2026",
    day23: "1st - 2nd November 2026"
  },

  // Prize Pool
  prizePool: {
    total: "Rs 50,000",
    numeric: 50000,
    currency: "₹",
    // TODO: replace with official breakdown once confirmed by organizers
    breakdown: [
      { rank: "1st Place (Orbital Champion)", amount: "₹25,000", perk: "Trophy + Certificates + Direct Incubation Pitch" },
      { rank: "2nd Place (Horizon Runner)", amount: "₹15,000", perk: "Trophy + Certificates + Goodies" },
      { rank: "3rd Place (Singularity Crew)", amount: "₹10,000", perk: "Trophy + Certificates + Goodies" }
    ]
  },

  // Official Student Coordinators
  coordinators: [
    {
      name: "Shreyas",
      phone: "+91 8660415798",
      telLink: "tel:+918660415798",
      whatsapp: "https://wa.me/918660415798?text=Hi%20Shreyas,%20inquiring%20about%20Code%20Meet%202026",
      role: "Lead Student Coordinator"
    },
    {
      name: "Abir",
      phone: "+91 9108907485",
      telLink: "tel:+919108907485",
      whatsapp: "https://wa.me/919108907485?text=Hi%20Abir,%20inquiring%20about%20Code%20Meet%202026",
      role: "Co-Lead Student Coordinator"
    }
  ],

  // Links & Registration
  // TODO: replace with live Google Form / Devfolio / Unstop link
  registrationUrl: "https://forms.gle/codemeet2026-placeholder-register",
  qrImage: "/assets/qr-code.png",

  // Code Snippet from Poster
  posterCodeSnippet: `const ideas = [code, "create", "conquer"];
ideas.forEach(v => build(v));
return future();`,

  // Telemetry Stats
  stats: [
    { value: 24, label: "Hours Continuous Hack", suffix: "H" },
    { value: 50, label: "Prize Pool (INR)", prefix: "₹", suffix: "K" },
    { value: 3, label: "Day 1 Orbital Missions", suffix: "" },
    { value: 2, label: "Days Toward Singularity", suffix: "D" }
  ],

  // Missions & Events
  day1Events: [
    {
      title: "Speed Typing",
      code: "MISSION // TYP-01",
      description: "Push keypress latency to zero. Battle against high-WPM coders in high-pressure syntax sprints.",
      // TODO: replace with specific round timings
      time: "10:00 AM - 12:30 PM (TODO: replace)",
      tag: "Solo Orbit"
    },
    {
      title: "Free Fire",
      code: "MISSION // ESP-02",
      description: "Tactical squad combat arena. Coordinate strategy, reflex, and team supremacy under battle pressure.",
      // TODO: replace with tournament bracket times
      time: "01:30 PM - 04:30 PM (TODO: replace)",
      tag: "Squad Combat"
    },
    {
      title: "Treasure Hunt",
      code: "MISSION // CRYP-03",
      description: "Multi-stage physical and digital cipher decrypt. Decouple hidden QR clues across campus perimeter.",
      // TODO: replace with final timeline
      time: "05:00 PM - 07:30 PM (TODO: replace)",
      tag: "Team Quest"
    }
  ],

  hackathonDetails: {
    title: "The Descent: 24 Hours Hackathon",
    code: "PRIMARY DESCENT // 24H-CORE",
    dates: "1st - 2nd November 2026",
    structure: [
      { round: "Round 1 (Online Screening)", fee: "FREE", note: "Four problem statement tracks open for submission." },
      { round: "Round 2 (Onsite 24h Hack)", fee: "₹400 per team", note: "Finalists assemble at SUIET Mukka campus." }
    ],
    // TODO: replace with official problem statement themes when released
    tracks: [
      {
        name: "AI & Neural Singularity",
        desc: "Autonomous agents, predictive telemetry, local LLM integrations, and cognitive workflows.",
        status: "TODO: replace with official prompt"
      },
      {
        name: "Web3 & Decentralized Protocols",
        desc: "Zero-knowledge verification, verifiable compute, and trustless peer communication.",
        status: "TODO: replace with official prompt"
      },
      {
        name: "Open Cybernetic Innovation",
        desc: "High-impact hardware-software fusion, sustainability tech, and emergency rapid response.",
        status: "TODO: replace with official prompt"
      }
    ]
  },

  // Schedule Timeline
  // TODO: replace with confirmed minute-by-minute schedule from department
  schedule: {
    day1: [
      { time: "09:00 AM", title: "Crew Reporting & Badge Verification", desc: "Check-in at SUIET Mukka Main Foyer (TODO: replace)" },
      { time: "10:30 AM", title: "Speed Typing Arena Begins", desc: "Syntax benchmark tests and qualifier rounds" },
      { time: "01:30 PM", title: "Free Fire Tactical Showdown", desc: "Knockout brackets & live spectator projection" },
      { time: "05:00 PM", title: "Treasure Hunt Decryption", desc: "Cryptic campus navigation challenge" },
      { time: "08:00 PM", title: "Day 1 Debrief & Winner Announcements", desc: "Awards for Day 1 orbital missions" }
    ],
    day23: [
      { time: "09:00 AM (1st Nov)", title: "Hackathon Check-in & Orientation", desc: "Power stations allocation & mentor introductions" },
      { time: "10:00 AM (1st Nov)", title: "T-Minus 00: Hackathon Clock Starts", desc: "24-Hour countdown initiates" },
      { time: "04:00 PM (1st Nov)", title: "Checkpoint 1: Architecture Review", desc: "Mentor feedback on system design and API contracts" },
      { time: "11:30 PM (1st Nov)", title: "Midnight Caffeine Reload", desc: "Energy drinks, snacks, and mini-games" },
      { time: "06:00 AM (2nd Nov)", title: "Checkpoint 2: Code Freeze & Testing", desc: "Deployment verification and pitch deck polish" },
      { time: "10:00 AM (2nd Nov)", title: "T-Zero: Final Submissions", desc: "Github repo commit lockdown" },
      { time: "11:30 AM (2nd Nov)", title: "Jury Demonstrations & Grand Valedictory", desc: "Live stage demos and prize distribution" }
    ]
  },

  // FAQ Protocol
  // TODO: replace with department-specific rules if amended
  faqs: [
    {
      q: "What is the team size for the 24-hour hackathon?",
      a: "Teams can consist of 2 to 4 members. Inter-college teams are welcome. (TODO: replace if team limits change)"
    },
    {
      q: "What is the registration fee?",
      a: "Round 1 (Online screening) is 100% FREE. Teams selected for Round 2 (Onsite 24h Hackathon) pay ₹400 per team."
    },
    {
      q: "What should participants bring to SUIET campus?",
      a: "Laptops, chargers, extension cords, student ID cards, and personal toiletries. High-speed Wi-Fi, power, and meals will be provided."
    },
    {
      q: "Will participation certificates be awarded?",
      a: "Yes, all verified attendees will receive official certificates endorsed by Srinivas University and collaborating partners."
    }
  ],

  // Allied Partners
  partners: [
    { name: "Srinivas University", type: "Host Institution", logo: "/assets/srinivas-iic.png" },
    { name: "Webflow Community", type: "Community Partner", logo: "/assets/webflow.jpg" },
    { name: "IBM", type: "Powered By", logo: "/assets/poster.jpg" },
    { name: "NAAC Grade A", type: "Accreditation", logo: "/assets/naac-badge.png" }
  ]
};
