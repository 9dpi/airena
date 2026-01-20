// Configuration
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxtZhI8T_CKc78vSRo8VytvDZ3DFnebYJQnuLT1MtsG3XFKpFLq18sNpaU2vibDwVnX/exec";

// Unicode Pieces Mapping
const PIECES = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
};

let game = new Chess.Chess();
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

/**
 * 🎨 CUSTOM RENDER ENGINE
 */
function renderBoard(fen) {
    const boardEl = document.getElementById("board");
    boardEl.innerHTML = "";

    const rows = fen.split(" ")[0].split("/");

    rows.forEach((row, y) => {
        let x = 0;
        for (const char of row) {
            if (isNaN(char)) {
                const square = createSquare(x, y, PIECES[char]);
                boardEl.appendChild(square);
                x++;
            } else {
                for (let i = 0; i < parseInt(char); i++) {
                    const square = createSquare(x, y, "");
                    boardEl.appendChild(square);
                    x++;
                }
            }
        }
    });
}

function createSquare(x, y, piece) {
    const div = document.createElement("div");
    // Standard chess coordinates: (x+y)%2 gives the right pattern
    div.className = "square " + ((x + y) % 2 === 0 ? "white" : "black");
    div.textContent = piece;
    return div;
}

function updateStatus() {
    moveCount++;
    moveCountEl.innerText = moveCount;
    // Mock evaluation score
    const score = (Math.random() * 2 - 1).toFixed(1);
    evalScoreEl.innerText = (score >= 0 ? '+' : '') + score;
    evalScoreEl.style.color = score >= 0 ? 'var(--primary)' : 'var(--accent)';
}

async function startBattle() {
    if (matchActive) return;

    const selectedArena = gameSelector.value;

    // Chess Specific Flow
    if (selectedArena === 'chess') {
        matchActive = true;
        startBtn.innerText = "Battle in Progress...";

        const battleInterval = setInterval(() => {
            if (game.isGameOver() || !matchActive) {
                clearInterval(battleInterval);
                if (game.isGameOver()) {
                    const winner = game.isCheckmate() ? (game.turn() === 'w' ? 'Black' : 'White') : 'Draw';
                    finishBattle(winner);
                }
                return;
            }

            const moves = game.moves();
            const move = moves[Math.floor(Math.random() * moves.length)];
            game.move(move);
            renderBoard(game.fen());
            updateStatus();
        }, 500);
    } else {
        // Other games go through Backend for simulation
        simulateRemoteBattle();
    }
}

async function simulateRemoteBattle() {
    matchActive = true;
    startBtn.innerText = "Simulating...";
    document.getElementById('gas-status').innerText = "AI thinking... 🧠";

    const payload = {
        secret: "AI_ARENA_2026",
        game: gameSelector.value,
        aiA: aiASelector.value,
        aiB: aiBSelector.value
    };

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const res = await response.json();

        if (res.error) throw new Error(res.error);

        addToHistory(res);
        alert(`Battle Finished! Winner: ${res.winner}`);
        document.getElementById('gas-status').innerText = "Match Synced! ✅";
    } catch (err) {
        console.error("Battle Error:", err);
        document.getElementById('gas-status').innerText = "Sync Failed ❌";
    } finally {
        matchActive = false;
        startBtn.innerText = "Initiate Battle";
    }
}

async function finishBattle(winner) {
    matchActive = false;
    startBtn.innerText = "Initiate Battle";

    const resultData = {
        secret: "AI_ARENA_2026",
        matchId: "AIRENA_" + Date.now(),
        game: "chess",
        aiA: aiASelector.value,
        aiB: aiBSelector.value,
        winner: winner,
        result: winner === 'Draw' ? 'draw' : 'win',
        moves: moveCount,
        durationMs: 5000,
        replayLink: ""
    };

    addToHistory(resultData);

    try {
        fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(resultData)
        });
        document.getElementById('gas-status').innerText = "Match Synced! ✅";
    } catch (e) {
        console.error("GAS Sync error:", e);
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
        <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">${match.game.toUpperCase()} • ${match.moves} moves</div>
    `;
    historyList.prepend(item);
}

// Event Listeners
startBtn.addEventListener('click', startBattle);

resetBtn.addEventListener('click', () => {
    game = new Chess.Chess();
    renderBoard(game.fen());
    moveCount = 0;
    moveCountEl.innerText = "0";
    matchActive = false;
    startBtn.innerText = "Initiate Battle";
});

simulateMoveBtn.addEventListener('click', () => {
    if (game.isGameOver()) return;
    const moves = game.moves();
    game.move(moves[Math.floor(Math.random() * moves.length)]);
    renderBoard(game.fen());
    updateStatus();
});

// Initialization
renderBoard(game.fen());
console.log("AIRENA Custom UI Engine Ready");
