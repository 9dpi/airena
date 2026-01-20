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
const gameSelector = document.getElementById('game-selector');
const aiASelector = document.getElementById('ai-a-selector');
const aiBSelector = document.getElementById('ai-b-selector');

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
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    updateStatus();
    checkGameOver();
}

function updateStatus() {
    moveCount++;
    moveCountEl.innerText = moveCount;
    const score = (Math.random() * 2 - 1).toFixed(1);
    evalScoreEl.innerText = (score >= 0 ? '+' : '') + score;
    evalScoreEl.style.color = score >= 0 ? 'var(--primary)' : 'var(--accent)';
}

function checkGameOver() {
    if (game.game_over()) {
        const winner = game.in_checkmate() ? (game.turn() === 'w' ? 'Black' : 'White') : 'Draw';
        alert(`Game Over! Winner: ${winner}`);
        matchActive = false;
        startBtn.innerText = "Initiate Battle";
    }
}

/**
 * NEW MULTI-GAME BATTLE FLOW
 * Frontend sends config -> Backend runs engine -> Backend saves to Sheet -> Frontend shows result
 */
async function startBattle() {
    if (matchActive) return;

    matchActive = true;
    startBtn.innerText = "Battle in Progress...";
    document.getElementById('gas-status').innerText = "AI thinking... 🧠";

    const payload = {
        secret: "AI_ARENA_2026",
        game: gameSelector.value,
        aiA: aiASelector.value,
        aiB: aiBSelector.value
    };

    console.log("Starting Battle via GAS:", payload);

    try {
        // We use typical fetch here. If the user deployed with CORS support (as per my code.gs), 
        // we might still need mode: 'no-cors' if we don't want to handle preflight.
        // However, the user's prompt says "fetch(APP_SCRIPT_URL, ...).then(r => r.json())".
        // This requires CORS to work. GAS supports CORS if you return JSON correctly.

        const response = await fetch(GAS_WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        // Note: fetch to GAS with POST often follows redirects. 
        // If mode: 'no-cors' is used, we can't read the response body.
        // To read the body, we need the GAS to handle the request properly.
        // My code.gs returns a proper JSON response.

        const res = await response.json();
        console.log("Battle Result:", res);

        if (res.error) {
            throw new Error(res.error);
        }

        // Update UI with Result
        alert(`Battle Finished!\nGame: ${res.game}\nWinner: ${res.winner}\nMoves: ${res.moves}`);

        addToHistory(res);

        document.getElementById('gas-status').innerText = "Match Synced! ✅";
        setTimeout(() => {
            document.getElementById('gas-status').innerText = "Google Sheet Connected 🟢";
        }, 3000);

    } catch (err) {
        console.error("Battle Error:", err);
        document.getElementById('gas-status').innerText = "Battle Error ❌";
        alert("Error during battle: " + err.message);
    } finally {
        matchActive = false;
        startBtn.innerText = "Initiate Battle";
    }
}

function addToHistory(match) {
    const item = document.createElement('div');
    item.className = 'match-item';
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
            <span>${match.aiA} vs ${match.aiB}</span>
            <span class="status-badge badge-win">${match.winner}</span>
        </div>
        <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">${match.game} • ${match.moves} moves • Just now</div>
    `;
    historyList.prepend(item);
}

// Event Listeners
startBtn.addEventListener('click', startBattle);

resetBtn.addEventListener('click', () => {
    game.reset();
    board.start();
    moveCount = 0;
    moveCountEl.innerText = "0";
    matchActive = false;
    startBtn.innerText = "Initiate Battle";
});

// Start
initBoard();
console.log("AIRENA Multi-Game Engine Ready");
