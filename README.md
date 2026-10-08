# Tic-Tac-Toe Web Application

A modern, vibrant, and responsive Tic-Tac-Toe web application built for the **SkillCraft Technology Web Development Internship (Task 03)**.

Designed with an electric cyber aesthetic inspired by modern esports dashboards, featuring editable player names, persistent round score tracking, fluid micro-animations, full keyboard accessibility, and a strategic computer opponent.

---

## Features

- **Custom Player Names**:
  - Enter custom names for Player 1 (X) and Player 2 (O) in real-time.
  - Dynamically updates the matchup subtitle, live turn notifications, and victory modals.
- **Vibrant Modern Neon Theme**:
  - Technical dark grid background with ambient cyan and pink radial glows.
  - Distinct color-coded marks: **Electric Cyan** (`#00f0ff`) for X and **Neon Pink** (`#ff2a85`) for O.
  - Golden Amber (`#f59e0b`) accents for draws and stalemates.
- **Round Scoreboard**:
  - Real-time score counter tracking Player 1 wins, Player 2/Computer wins, and Draws.
  - "New Round" preserves current match tally while clearing the 3×3 grid.
  - "Reset Scores" zeroes out score counters for a brand-new match series.
- **Player vs Player (2 Players)**: Local two-player mode with alternating turns.
- **Player vs Computer (Vs Computer)**: Single-player mode against an intelligent automated opponent.
- **Intelligent Computer Moves**: 
  - Detects and executes immediate winning opportunities.
  - Blocks opponent winning combinations proactively.
  - Prioritizes strategic center and corner board control.
  - Features a realistic thinking delay and dynamic status indicator.
- **Winning Animation**: Highlights the three victorious cells with glowing color-matched borders and ambient pulsing.
- **Responsive Design**: Fluidly adapts across mobile, tablet, and desktop viewports without horizontal scrolling.
- **Keyboard Accessibility**: Full arrow-key grid navigation, Enter/Space activation, dynamic ARIA live labels, and focus rings.

---

## Technologies

- **HTML5**: Semantic document structure and ARIA accessibility roles (`grid`, `gridcell`, `radio`).
- **CSS3**: Custom design tokens, CSS Grid, Flexbox, hardware-accelerated SVG stroke animations, and backdrop filters.
- **JavaScript**: Modular vanilla JavaScript with pure state management, AI heuristics, and zero external dependencies.

---

## Project Structure

```
SCT_WD_3/
├── index.html    # Semantic markup, scoreboards, and player name inputs
├── style.css     # Vibrant neon styling, grid background, and animations
├── script.js     # Game engine, player state, AI logic, and score tracking
└── README.md     # Project documentation and setup guide
```

---

## How to Run

No external dependencies, build tools, or server installations are required.

### Option 1: Direct File Open
1. Clone or download this repository to your local computer.
2. Locate the project folder.
3. Double-click `index.html` to open it in your preferred modern web browser (Google Chrome, Firefox, Microsoft Edge, Safari, or Brave).

### Option 2: Using VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. If installed, right-click `index.html` and select **"Open with Live Server"**.
3. The application will launch at `http://127.0.0.1:5500/index.html`.

### Option 3: Local HTTP Server (Python / Node.js)
If you prefer running a lightweight local server from the terminal:

**Using Python:**
```bash
# In the project directory:
python -m http.server 3000
```
Then navigate to `http://localhost:3000` in your browser.

**Using Node.js (npx):**
```bash
# In the project directory:
npx serve .
```

---

## Author

Developed as part of the **SkillCraft Technology Web Development Internship (Task 03)**.
