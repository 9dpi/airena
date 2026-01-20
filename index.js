// Configuration
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxtZhI8T_CKc78vSRo8VytvDZ3DFnebYJQnuLT1MtsG3XFKpFLq18sNpaU2vibDwVnX/exec";

let board = null;
let game = new Chess();
let moveCount = 0;
let matchActive = false;

// DOM Elements
const moveCountEl = document.getElementById('move-count');
const evalScoreEl = document.getElementById('eval-score');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const simulateMoveBtn = document.getElementById('simulate-move-btn');
const historyList = document.getElementById('match-history');

// Initialization
function initBoard() {
    const config = {
        draggable: true,
        position: 'start',
        onDrop: handleMove,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };
    board = Chessboard('board', config);
}

function handleMove(source, target) {
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });

    if (move === null) return 'snapback';

    updateStatus();
    checkGameOver();
}

function updateStatus() {
    moveCount++;
    moveCountEl.innerText = moveCount;
    // Mock evaluation score
    const score = (Math.random() * 2 - 1).toFixed(1);
    evalScoreEl.innerText = (score >= 0 ? '+' : '') + score;
    evalScoreEl.style.color = score >= 0 ? 'var(--primary)' : 'var(--accent)';
}

function checkGameOver() {
    if (game.game_over()) {
        const winner = game.in_checkmate() ? (game.turn() === 'w' ? 'Black' : 'White') : 'Draw';
        saveMatch(winner);
        matchActive = false;
        startBtn.innerText = "Initiate Battle";
        alert(`Game Over! Winner: ${winner}`);
    }
}

async function saveMatch(winner) {
    const activeWhiteAI = document.querySelector('.ai-card.active[data-side="white"]').dataset.ai;
    const activeBlackAI = document.querySelector('.ai-card.active[data-side="black"]').dataset.ai;
    const selectedGame = document.getElementById('game-selector').value;

    const resultData = {
        secret: "AI_ARENA_2026", // Matching the GAS secret
        matchId: "AIRENA_" + Date.now(),
        game: selectedGame,
        aiA: activeWhiteAI,
        aiB: activeBlackAI,
        winner: winner,
        result: winner === 'Draw' ? 'draw' : 'win',
        moves: moveCount,
        durationMs: 5000,
        replayLink: ""
    };

    addToHistory(resultData);

    // GAS Logic: DO NOT add headers, headers: { 'Content-Type': 'application/json' } triggers OPTIONS preflight
    // Apps Script does not support OPTIONS preflight.
    if (GAS_WEB_APP_URL.includes("XXXXXXXXXXXX")) {
        console.warn("GAS URL not configured. Match saved locally only.");
        return;
    }

    try {
        console.log("Pushing to Google Sheets...", resultData);

        fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Essential for GAS to avoid CORS preflight issues
            body: JSON.stringify(resultData)
        })
            .then(() => {
                console.log("GAS request sent (no-cors mode)");
                document.getElementById('gas-status').innerText = "Match Synced! ✅";
                setTimeout(() => {
                    document.getElementById('gas-status').innerText = "Google Sheet Connected 🟢";
                }, 3000);
            });

    } catch (e) {
        console.error("Failed to sync with Sheets:", e);
        document.getElementById('gas-status').innerText = "Sync Failed ❌";
    }
}

function addToHistory(match) {
    const item = document.createElement('div');
    item.className = 'match-item';
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
            <span>${match.aiA} vs ${match.aiB}</span>
            <span class="status-badge ${match.result === 'win' ? 'badge-win' : 'badge-draw'}">${match.winner}</span>
        </div>
        <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">Chess • ${match.moves} moves • Just now</div>
    `;
    historyList.prepend(item);
}

// AI Simulation Logic
function makeRandomMove() {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    board.position(game.fen());
    updateStatus();
    checkGameOver();
}

// Event Listeners
startBtn.addEventListener('click', () => {
    if (!matchActive) {
        matchActive = true;
        startBtn.innerText = "Battle in Progress...";
        // Simple simulation loop
        const battleId = setInterval(() => {
            if (!matchActive) {
                clearInterval(battleId);
                return;
            }
            makeRandomMove();
        }, 1000);
    }
});

resetBtn.addEventListener('click', () => {
    game.reset();
    board.start();
    moveCount = 0;
    moveCountEl.innerText = "0";
    matchActive = false;
    startBtn.innerText = "Initiate Battle";
});

simulateMoveBtn.addEventListener('click', makeRandomMove);

// AI Selection Logic
document.querySelectorAll('.ai-card').forEach(card => {
    card.addEventListener('click', () => {
        const side = card.dataset.side;
        document.querySelectorAll(`.ai-card[data-side="${side}"]`).forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });
});

// Start
initBoard();
console.log("AIRENA Initialized");
