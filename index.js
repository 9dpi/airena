// Configuration
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxtZhI8T_CKc78vSRo8VytvDZ3DFnebYJQnuLT1MtsG3XFKpFLq18sNpaU2vibDwVnX/exec";
const SECRET_KEY = "AI_ARENA_2026";

// Unicode Pieces Mapping
const PIECES = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
};

let currentMatchId = null;
let matchActive = false;

// DOM Elements
const moveCountEl = document.getElementById('move-count');
const evalScoreEl = document.getElementById('eval-score');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const historyList = document.getElementById('match-history');
const gameSelector = document.getElementById('game-selector');
const aiASelector = document.getElementById('ai-a-selector');
const aiBSelector = document.getElementById('ai-b-selector');
const gasStatusEl = document.getElementById('gas-status');

/**
 * 🎨 CUSTOM RENDER ENGINE
 */
function renderBoard(fen) {
    const boardEl = document.getElementById("board");
    boardEl.innerHTML = "";
    if (!fen) return;

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
    div.className = "square " + ((x + y) % 2 === 0 ? "white" : "black");
    div.textContent = piece;
    return div;
}

/**
 * 📡 REAL BACKEND AI COMMUNICATION (TURN-BASED)
 */
async function startBattle() {
    if (matchActive) return;

    matchActive = true;
    startBtn.innerText = "Initializing Backend...";
    gasStatusEl.innerText = "Creating match... 🚀";

    const payload = {
        action: "start",
        secret: SECRET_KEY,
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

        currentMatchId = res.matchId;
        renderBoard(res.fen);
        moveCountEl.innerText = "0";
        startBtn.innerText = "Battle Live ⚔️";

        // Start the turn loop
        nextTurn();

    } catch (err) {
        console.error("Initiation Error:", err);
        gasStatusEl.innerText = "Init Failed ❌";
        matchActive = false;
        startBtn.innerText = "Initiate Battle";
        alert("Backend Error: " + err.message);
    }
}

async function nextTurn() {
    if (!matchActive || !currentMatchId) return;

    gasStatusEl.innerText = "AI Thinking... 🧠";

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "move",
                secret: SECRET_KEY,
                matchId: currentMatchId
            })
        });
        const res = await response.json();

        if (res.error) throw new Error(res.error);

        // Update UI
        renderBoard(res.fen);
        if (res.moves !== undefined) {
            moveCountEl.innerText = res.moves;
        }

        // Check if game ended
        if (res.gameOver) {
            matchActive = false;
            startBtn.innerText = "Initiate Battle";
            gasStatusEl.innerText = "Match Finished ✅";
            addToHistory(res);
            alert(`Match Over!\nWinner: ${res.winner}\nResult: ${res.result}`);
        } else {
            // Wait a bit then ask for next move (Polling)
            setTimeout(nextTurn, 800);
        }

    } catch (err) {
        console.error("Turn Error:", err);
        gasStatusEl.innerText = "Sync Lost ❌";
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
        <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">${match.game.toUpperCase()} • ${match.moves} moves • Final</div>
    `;
    historyList.prepend(item);
}

// Event Listeners
startBtn.addEventListener('click', startBattle);

resetBtn.addEventListener('click', () => {
    matchActive = false;
    currentMatchId = null;
    startBtn.innerText = "Initiate Battle";
    gasStatusEl.innerText = "Ready 🟢";
    renderBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    moveCountEl.innerText = "0";
});

// Initialization
renderBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
console.log("AIRENA Real-Backend AI Ready (v0.13.4 Compatible)");
