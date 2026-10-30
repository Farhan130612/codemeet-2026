# CODE MEET 2026: SPEED TYPER CHAMPIONSHIP
## Host Event Day Runbook & Emergency Operational Guide

**Event:** Code Meet 2026 — Speed Typer Competition  
**Institution:** Srinivas University Institute of Engineering and Technology (SUIET), Mukka  
**Capacity:** 50–60 simultaneous stage participants (Certified up to 150+ concurrent typists)  

---

### Part 1: Architecture & Access Split

The platform strictly separates public participants from tournament hosts:
- **Public Participant Portal (`/`)**: No administrative controls, no room creation buttons, no host links. Typists enter their **Full Name**, **University USN** (e.g. `4SU22CS089`), and the **Room Code** (e.g. `K9X2M4R7`) or **6-Digit Room Number** (e.g. `482910`).
- **Admin Control Center (`/gogo`)**: Not indexed (`noindex, nofollow`, robots exclusion, zero public links). Protected by a constant-time comparison against `ADMIN_ACCESS_CODE` (default `20268899`) with a 5-failure/15-minute IP lockout.
- **Auditorium Projector View (`/?projector=<ROOM_CODE>`)**: Fullscreen 1920x1080 display for stage broadcast, featuring top podium, live racer velocity lanes, and real-time scoreboards.

---

### Part 2: Pre-Event Checklist (T-30 Minutes to Start)

1. **Verify Server Health:**
   - Open browser to `http://<HOST_IP_OR_DOMAIN>:3001/health`
   - Ensure `{"status":"ok"}` is returned.
2. **Projector Screen Setup (Auditorium Stage):**
   - Connect the hall projector HDMI cable to your presentation laptop.
   - Open a browser window on the projector display: `http://<HOST_IP_OR_DOMAIN>:5173/?projector=<ROOM_CODE>` (or launch from Admin Dashboard).
   - Press **F11** for seamless borderless presentation mode.
3. **Admin Laptop Setup:**
   - Keep host controls on an organizer laptop separate from the stage projector.
   - Go to `http://<HOST_IP_OR_DOMAIN>:5173/gogo` and sign in with the admin code.

---

### Part 3: Step-by-Step Operator Workflow (What to Click & When)

```
[1. Login at /gogo] -> [2. Create Arena] -> [3. Project Numeric Code] -> [4. Participants Join] -> [5. Start 3-2-1 Countdown] -> [6. Live Race] -> [7. Export Official CSV]
```

1. **Create Arena in Admin Panel:**
   - Log into `/gogo/dashboard` $\to$ click **+ NEW ARENA**.
   - Parameters:
     - **Title:** `Code Meet 2026 Speed Typer - Qualifier Heat 1`
     - **Timer:** `60 Seconds` (or `30s` for rapid qualifiers)
     - **Attempts:** `1 Attempt` (or `2 Attempts` for best-of-2)
     - **Min Accuracy:** `90%` (Typists below 90% are automatically disqualified)
     - **Punctuation:** Enabled | **Numbers:** Optional
   - Click **CREATE ROOM**. The system generates:
     - An 8-character code: `K9X2M4R7` (for URL direct join: `/?code=K9X2M4R7`)
     - A 6-digit numeric room number: `482910` (easy to read aloud or write on the auditorium whiteboard)
2. **Onboard Participants:**
   - Announce on microphone: *"Open the link, enter your Full Name, your University USN number, and Room Code `482910`."*
   - Typists join and appear instantly on your **Live Monitor** table.
   - Typists click **I'M READY** on their screens. Ready count updates in real-time.
3. **Lock Arena (T-30 Seconds):**
   - Once the heat is filled, click **LOCK ROOM** to prevent late arrivals from interrupting the countdown.
4. **Initiate Test (Stage Countdown):**
   - Announce on microphone: *"Hands on home row. Test starts in 3... 2... 1..."*
   - Click **START TEST FOR EVERYONE**.
   - Server synchronizes and broadcasts a 3-2-1 countdown across all screens. Target text unlocks precisely at zero.
5. **Live Auditorium Monitoring:**
   - The Auditorium Projector displays real-time racer lanes and live velocity for all participants.
   - In the Admin **Live Monitor**, organizer sees live speeds, accuracy, connection status, and anti-cheat counters.
   - If an automated bot or paste is detected, the participant is flagged with a warning pill and queued for review.
6. **Conclude & Export:**
   - When the timer reaches zero, tests lock automatically and results are computed server-side.
   - Click **EXPORT CSV** to download `CodeMeet2026_<CODE>_results.csv` containing:
     - Rank, Display Name, USN, Net WPM, Raw WPM, Accuracy %, Total Keystrokes, Error Count, Disqualification Status, and Completion Timestamp.
   - Announce the top 3 qualifiers from the podium.

---

### Part 4: Troubleshooting & Contingency Matrix ("If X Happens...")

| Incident | Immediate Action |
| :--- | :--- |
| **Participant accidentally refreshed browser** | **State is preserved.** Session tokens and participant IDs are cached in `localStorage`. The typist simply re-enters the room code, and their active attempt and progress are automatically resumed. |
| **Participant tried key mashing / spamming wrong keys** | **Protected by Server-Authoritative Engine.** Scores are strictly calculated from correctly matched characters minus uncorrected errors. Key mashing yields **0.0 Net WPM**, 0% Accuracy, and automatic disqualification. |
| **A typist used automated bot macro or paste** | The anti-cheat filter catches sub-15ms bursts and paste events (>2 chars injected). A red **FLAGGED** pill appears in the Admin Live Monitor with evidence. Host can click **Accept**, **Disqualify**, or **Request Retype**. |
| **Participant claims their screen froze** | In the Admin Live Monitor, find their row and click **RESET ATTEMPT** or **+1 ATTEMPT** to grant a re-run. |
| **Typist typo in USN or Name** | In the Admin Live Monitor, click the **Edit (Pencil)** icon on their row to update their name or USN immediately. |
| **College Internet/WAN drops during event** | **Offline LAN Mode:** Connect laptops and projector to an offline Wi-Fi access point / router. Run the server locally on the host laptop (`npm start`). Typists connect via local IP (e.g. `http://192.168.1.50:3001`). SQLite runs fully in-process with zero cloud dependencies. |
| **Need Round 2 / Next Heat** | Click **DUPLICATE ROOM** or **RESET ROUND** in the Admin Rooms view. A fresh arena is created instantly with randomized text. |

---

### Part 5: Operator Quick Commands

- **Start Dev Stack:** `npm run dev` (Runs backend on 3001 and Vite frontend on 5173)
- **Start Production Container:** `docker compose up -d`
- **Run Automated Verification:** `npm test` (Runs 26 test suites)
- **Run 150-Client Load Test:** `npm run load-test`
- **Direct Database File:** `./data/codemeet_typing.db` (SQLite WAL mode)
