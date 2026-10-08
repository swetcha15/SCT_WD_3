/**
 * TIC-TAC-TOE — Modern Neon Responsive Game Engine
 * SkillCraft Technology Web Development Internship Task 03
 */

// ==========================================================================
// Constants & Configuration
// ==========================================================================

const PLAYER_X = 'X';
const PLAYER_O = 'O';

// Winning 3-in-a-row board combinations
const WINNING_COMBINATIONS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Column 1
  [1, 4, 7], // Column 2
  [2, 5, 8], // Column 3
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6]  // Diagonal top-right to bottom-left
];

// Vibrant SVG Marks for X (Electric Cyan) and O (Neon Pink)
const SVG_X = `
  <svg class="cell-icon mark-x" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line class="line-1" x1="24" y1="24" x2="76" y2="76" />
    <line class="line-2" x1="76" y1="24" x2="24" y2="76" />
  </svg>
`;

const SVG_O = `
  <svg class="cell-icon mark-o" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="50" cy="50" r="30" />
  </svg>
`;

// ==========================================================================
// Game State
// ==========================================================================

let board = Array(9).fill(null);
let currentPlayer = PLAYER_X;
let gameMode = 'pvc'; // 'pvc' (Vs Computer) or 'pvp' (2 Players)
let gameActive = true;
let isComputerThinking = false;
let computerTimer = null;

// Player Custom Names
let playerXName = 'Player X';
let playerOName = 'Computer';

// Scores tracking
const scores = {
  x: 0,
  o: 0,
  draws: 0
};

// ==========================================================================
// DOM Elements
// ==========================================================================

const boardElement = document.getElementById('board');
const cellElements = Array.from(document.querySelectorAll('.cell'));
const modePvpBtn = document.getElementById('mode-pvp');
const modePvcBtn = document.getElementById('mode-pvc');
const newRoundBtn = document.getElementById('new-round-btn');
const resetScoresBtn = document.getElementById('reset-scores-btn');

// Player Name Inputs & Subtitle
const playerXInput = document.getElementById('player-x-name');
const playerOInput = document.getElementById('player-o-name');
const matchupSubtitle = document.getElementById('matchup-subtitle');

// Score Elements
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawsEl = document.getElementById('score-draws');

// Status Banner Elements
const statusBanner = document.getElementById('status-banner');
const statusIcon = document.getElementById('status-icon');
const statusTitle = document.getElementById('status-title');
const statusSubtitle = document.getElementById('status-subtitle');

// Result Modal Elements
const resultOverlay = document.getElementById('result-overlay');
const resultIconContainer = document.getElementById('result-icon-container');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');
const playAgainBtn = document.getElementById('play-again-btn');

// ==========================================================================
// Core Game Functions
// ==========================================================================

/**
 * Initializes listeners, player inputs, and sets default game state.
 */
function initializeGame() {
  // Bind cell click & keyboard interaction
  cellElements.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
    cell.addEventListener('keydown', (e) => handleCellKeydown(e, index));
  });

  // Bind mode selector buttons
  modePvpBtn.addEventListener('click', () => switchMode('pvp'));
  modePvcBtn.addEventListener('click', () => switchMode('pvc'));

  // Bind round & score reset buttons
  newRoundBtn.addEventListener('click', resetGame);
  resetScoresBtn.addEventListener('click', resetScores);
  playAgainBtn.addEventListener('click', () => {
    closeResultModal();
    resetGame();
  });

  // Live Player Name updates
  playerXInput.addEventListener('input', handleNameChange);
  playerOInput.addEventListener('input', handleNameChange);

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !resultOverlay.classList.contains('hidden')) {
      closeResultModal();
      resetGame();
    }
  });

  updateMatchupSubtitle();
  resetGame();
}

/**
 * Handles real-time player name adjustments.
 */
function handleNameChange() {
  playerXName = playerXInput.value.trim() || 'Player X';
  playerOName = playerOInput.value.trim() || (gameMode === 'pvc' ? 'Computer' : 'Player O');
  updateMatchupSubtitle();
  updateStatus();
}

/**
 * Updates the matchup subtitle below the main header.
 */
function updateMatchupSubtitle() {
  matchupSubtitle.innerHTML = `
    <span class="match-p1">${escapeHTML(playerXName.toUpperCase())}</span>
    <span class="match-vs">VS</span>
    <span class="match-p2">${escapeHTML(playerOName.toUpperCase())}</span>
  `;
}

/**
 * Handles click on any board cell.
 * @param {number} index - Board index (0 to 8).
 */
function handleCellClick(index) {
  if (!gameActive || isComputerThinking || board[index] !== null) {
    return;
  }

  // Execute human player move
  executeMove(index, currentPlayer);

  // Check victory condition
  const winCombo = checkWinner(board, currentPlayer);
  if (winCombo) {
    endGame(currentPlayer, winCombo);
    return;
  }

  // Check draw condition
  if (checkDraw(board)) {
    endGame(null, null);
    return;
  }

  // Switch turn
  if (gameMode === 'pvp') {
    currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    updateStatus();
  } else {
    // Vs Computer mode: computer plays O
    currentPlayer = PLAYER_O;
    updateStatus();
    makeComputerMove();
  }
}

/**
 * Places mark on the board and updates UI cell with SVG mark.
 * @param {number} index - Board index.
 * @param {string} player - PLAYER_X or PLAYER_O.
 */
function executeMove(index, player) {
  board[index] = player;
  const cell = cellElements[index];

  cell.innerHTML = player === PLAYER_X ? SVG_X : SVG_O;
  cell.classList.add('occupied');
  const playerName = player === PLAYER_X ? playerXName : playerOName;
  cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, Column ${(index % 3) + 1}, occupied by ${playerName}`);
}

/**
 * AI logic: places move after thinking delay.
 */
function makeComputerMove() {
  if (!gameActive) return;

  isComputerThinking = true;
  updateStatus();

  computerTimer = setTimeout(() => {
    if (!gameActive) {
      isComputerThinking = false;
      return;
    }

    const bestMove = getBestComputerMove();

    if (bestMove !== -1) {
      executeMove(bestMove, PLAYER_O);

      const winCombo = checkWinner(board, PLAYER_O);
      if (winCombo) {
        endGame(PLAYER_O, winCombo);
        isComputerThinking = false;
        return;
      }

      if (checkDraw(board)) {
        endGame(null, null);
        isComputerThinking = false;
        return;
      }

      // Return turn to player X
      currentPlayer = PLAYER_X;
      isComputerThinking = false;
      updateStatus();
    } else {
      isComputerThinking = false;
    }
  }, 420);
}

/**
 * Intelligent AI Move Heuristic:
 * 1. Win immediately if possible.
 * 2. Block player's impending win.
 * 3. Seize center square (index 4).
 * 4. Pick strategic corners.
 * 5. Pick remaining edges.
 * @returns {number} Board index.
 */
function getBestComputerMove() {
  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((val) => val !== null);

  if (emptyIndices.length === 0) return -1;

  // 1. Check for immediate winning move for Computer (O)
  for (const idx of emptyIndices) {
    const tempBoard = [...board];
    tempBoard[idx] = PLAYER_O;
    if (checkWinner(tempBoard, PLAYER_O)) {
      return idx;
    }
  }

  // 2. Block immediate winning move for Player (X)
  for (const idx of emptyIndices) {
    const tempBoard = [...board];
    tempBoard[idx] = PLAYER_X;
    if (checkWinner(tempBoard, PLAYER_X)) {
      return idx;
    }
  }

  // 3. Prefer center square
  if (board[4] === null) {
    return 4;
  }

  // 4. Prefer corners
  const corners = [0, 2, 6, 8].filter((idx) => board[idx] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Prefer sides/edges
  const edges = [1, 3, 5, 7].filter((idx) => board[idx] === null);
  if (edges.length > 0) {
    return edges[Math.floor(Math.random() * edges.length)];
  }

  return emptyIndices[0];
}

/**
 * Evaluates board against winning combinations.
 * @param {Array} currentBoard
 * @param {string} player
 * @returns {Array|null}
 */
function checkWinner(currentBoard, player) {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (
      currentBoard[a] === player &&
      currentBoard[b] === player &&
      currentBoard[c] === player
    ) {
      return combination;
    }
  }
  return null;
}

/**
 * Evaluates if board is full without a winner.
 * @param {Array} currentBoard
 * @returns {boolean}
 */
function checkDraw(currentBoard) {
  return currentBoard.every((cell) => cell !== null);
}

/**
 * Concludes round, increments scores, highlights winning line, and opens result modal.
 * @param {string|null} winner - PLAYER_X, PLAYER_O, or null.
 * @param {Array|null} winningIndices - Indices of the 3 winning cells.
 */
function endGame(winner, winningIndices) {
  gameActive = false;

  if (winner) {
    const isX = winner === PLAYER_X;
    const winnerName = isX ? playerXName : playerOName;

    // Increment winner score
    if (isX) {
      scores.x += 1;
      scoreXEl.textContent = scores.x;
    } else {
      scores.o += 1;
      scoreOEl.textContent = scores.o;
    }

    // Highlight winning cells with glowing styling matching winner
    winningIndices.forEach((index) => {
      cellElements[index].classList.add('winning', isX ? 'win-x' : 'win-o');
    });

    // Update status banner
    statusIcon.innerHTML = `<div class="pulse-indicator ${isX ? 'pulse-cyan' : 'pulse-pink'}"></div>`;
    statusTitle.textContent = `${winnerName} Wins!`;
    statusSubtitle.textContent = 'Three in a row secured the round!';

    setTimeout(() => {
      showResultModal(winner);
    }, 600);
  } else {
    // Draw condition
    scores.draws += 1;
    scoreDrawsEl.textContent = scores.draws;

    statusIcon.innerHTML = `<div class="pulse-indicator pulse-amber"></div>`;
    statusTitle.textContent = "It's a Draw!";
    statusSubtitle.textContent = "No squares left. Ready for another round?";

    setTimeout(() => {
      showResultModal(null);
    }, 450);
  }
}

/**
 * Resets board for the next round while preserving match scores.
 */
function resetGame() {
  if (computerTimer) {
    clearTimeout(computerTimer);
    computerTimer = null;
  }

  board = Array(9).fill(null);
  currentPlayer = PLAYER_X;
  gameActive = true;
  isComputerThinking = false;

  cellElements.forEach((cell, index) => {
    cell.innerHTML = '';
    cell.className = 'cell';
    cell.removeAttribute('disabled');
    cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, Column ${(index % 3) + 1}, empty`);
  });

  closeResultModal();
  updateStatus();
}

/**
 * Resets scoreboard back to zero.
 */
function resetScores() {
  scores.x = 0;
  scores.o = 0;
  scores.draws = 0;
  scoreXEl.textContent = '0';
  scoreOEl.textContent = '0';
  scoreDrawsEl.textContent = '0';
  resetGame();
}

/**
 * Updates status banner based on current turn and mode.
 */
function updateStatus(customTitle, customSubtitle) {
  if (customTitle) {
    statusTitle.textContent = customTitle;
    statusSubtitle.textContent = customSubtitle || '';
    return;
  }

  if (!gameActive) return;

  if (gameMode === 'pvc') {
    if (isComputerThinking) {
      statusIcon.innerHTML = `<div class="pulse-indicator pulse-pink"></div>`;
      statusTitle.textContent = "Computer is thinking...";
      statusSubtitle.textContent = "Calculating optimal strategy...";
    } else {
      statusIcon.innerHTML = `<div class="pulse-indicator pulse-cyan"></div>`;
      statusTitle.textContent = `Your turn — ${playerXName}`;
      statusSubtitle.textContent = "Place your mark on any available cell";
    }
  } else {
    // 2 Players mode
    if (currentPlayer === PLAYER_X) {
      statusIcon.innerHTML = `<div class="pulse-indicator pulse-cyan"></div>`;
      statusTitle.textContent = `${playerXName}'s turn — X`;
      statusSubtitle.textContent = "Place your mark on any available cell";
    } else {
      statusIcon.innerHTML = `<div class="pulse-indicator pulse-pink"></div>`;
      statusTitle.textContent = `${playerOName}'s turn — O`;
      statusSubtitle.textContent = "Place your mark on any available cell";
    }
  }
}

/**
 * Switches game mode between 2 Players (pvp) and Vs Computer (pvc).
 * @param {string} mode - 'pvp' or 'pvc'.
 */
function switchMode(mode) {
  if (gameMode === mode) return;

  gameMode = mode;

  if (mode === 'pvp') {
    modePvpBtn.classList.add('active');
    modePvpBtn.setAttribute('aria-checked', 'true');
    modePvcBtn.classList.remove('active');
    modePvcBtn.setAttribute('aria-checked', 'false');

    if (playerOInput.value.trim() === 'Computer') {
      playerOInput.value = 'Player O';
      playerOName = 'Player O';
    }
  } else {
    modePvcBtn.classList.add('active');
    modePvcBtn.setAttribute('aria-checked', 'true');
    modePvpBtn.classList.remove('active');
    modePvpBtn.setAttribute('aria-checked', 'false');

    if (playerOInput.value.trim() === 'Player O') {
      playerOInput.value = 'Computer';
      playerOName = 'Computer';
    }
  }

  updateMatchupSubtitle();
  resetScores();
}

// ==========================================================================
// Result Modal Presentation
// ==========================================================================

function showResultModal(winner) {
  if (winner === PLAYER_X) {
    resultIconContainer.innerHTML = SVG_X;
    resultTitle.textContent = `${playerXName} Wins!`;
    resultTitle.style.color = 'var(--neon-cyan)';
    resultDescription.textContent = gameMode === 'pvc' 
      ? 'Outstanding move! You outmaneuvered the computer.'
      : `${playerXName} has claimed victory in this round.`;
  } else if (winner === PLAYER_O) {
    resultIconContainer.innerHTML = SVG_O;
    resultTitle.textContent = `${playerOName} Wins!`;
    resultTitle.style.color = 'var(--neon-pink)';
    resultDescription.textContent = gameMode === 'pvc' 
      ? 'The computer secured three in a row.'
      : `${playerOName} has claimed victory in this round.`;
  } else {
    // Draw icon: Amber horizontal balance bar
    resultIconContainer.innerHTML = `
      <svg class="cell-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="22" y="44" width="56" height="12" rx="6" fill="#f59e0b" filter="drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))" />
      </svg>
    `;
    resultTitle.textContent = "It's a Draw!";
    resultTitle.style.color = 'var(--neon-amber)';
    resultDescription.textContent = "A well-matched contest. No player gave ground.";
  }

  resultOverlay.classList.remove('hidden');
  resultOverlay.setAttribute('aria-hidden', 'false');
  playAgainBtn.focus();
}

function closeResultModal() {
  resultOverlay.classList.add('hidden');
  resultOverlay.setAttribute('aria-hidden', 'true');
}

// ==========================================================================
// Keyboard Accessibility
// ==========================================================================

function handleCellKeydown(e, index) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleCellClick(index);
    return;
  }

  // 2D grid arrow navigation
  let targetIndex = null;
  const row = Math.floor(index / 3);
  const col = index % 3;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      if (row > 0) targetIndex = index - 3;
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (row < 2) targetIndex = index + 3;
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (col > 0) targetIndex = index - 1;
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (col < 2) targetIndex = index + 1;
      break;
    default:
      return;
  }

  if (targetIndex !== null && cellElements[targetIndex]) {
    cellElements[targetIndex].focus();
  }
}

// Utility: Escape HTML string
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================================================
// Application Bootstrap
// ==========================================================================

document.addEventListener('DOMContentLoaded', initializeGame);
