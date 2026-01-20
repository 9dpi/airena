// Configuration
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxtZhI8T_CKc78vSRo8VytvDZ3DFnebYJQnuLT1MtsG3XFKpFLq18sNpaU2vibDwVnX/exec";
const SECRET_KEY = "AI_ARENA_2026";

// DOM Elements
const startBtn = document.getElementById('start-btn');
const gasStatusEl = document.getElementById('gas-status');
const gameSelector = document.getElementById('game-selector');
const aiASelector = document.getElementById('ai-a-selector');
const aiBSelector = document.getElementById('ai-b-selector');
const latencyEl = document.getElementById('latency');

let matchActive = false;

/**
 * 📡 BATTLE INITIATION
 */
async function startMatch() {
    if (matchActive) return;

    const game = gameSelector.value;
    const aiA = aiASelector.value;
    const aiB = aiBSelector.value;

    console.log(`Starting ${game} match: ${aiA} vs ${aiB}`);

    matchActive = true;
    startBtn.innerText = "Initializing Combat...";
    startBtn.style.opacity = "0.7";
    startBtn.style.cursor = "not-allowed";
    gasStatusEl.innerText = "Connecting to Neural Grid...";

    // Simulated Backend Latency
    const startPing = Date.now();

    try {
        const payload = {
            action: "start",
            secret: SECRET_KEY,
            game: game,
            aiA: aiA,
            aiB: aiB
        };

        // If it's poker, we might not have a renderer yet, so we'll show an alert or placeholder
        if (game === 'poker') {
            setTimeout(() => {
                gasStatusEl.innerText = "Poker Engine Online 🎲";
                startBtn.innerText = "Match Live";
                latencyEl.innerText = (Date.now() - startPing) + "ms";
                alert(`Starting Poker Match!\nSide White: ${aiA}\nSide Black: ${aiB}\n\nNote: Poker visualization is coming soon in the next update!`);
                matchActive = false;
                startBtn.innerText = "Start Match";
                startBtn.style.opacity = "1";
                startBtn.style.cursor = "pointer";
            }, 1500);
            return;
        }

        // For existing games like chess, we could redirect to a battle page or render here.
        // For now, let's just simulate the start successfully.
        const response = await fetch(GAS_WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (res.error) throw new Error(res.error);

        gasStatusEl.innerText = "Match Synchronized ✅";
        startBtn.innerText = "Match Live ⚔️";
        latencyEl.innerText = (Date.now() - startPing) + "ms";

        console.log("Match ID:", res.matchId);

        // In a real app, we might redirect: window.location.href = `battle.html?id=${res.matchId}`;
        alert(`Match Started!\nGame: ${game}\nMatch ID: ${res.matchId}\nCheck console for details.`);

    } catch (err) {
        console.error("Match Error:", err);
        gasStatusEl.innerText = "Engine Error ❌";
        startBtn.innerText = "Retry Initiation";
        startBtn.style.opacity = "1";
        startBtn.style.cursor = "pointer";
        matchActive = false;
    }
}

// Event Listeners
startBtn.addEventListener('click', startMatch);

// Dynamic UI effects
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', () => {
        // Add a small flash effect to the card when selection changes
        const card = select.closest('.setup-card');
        card.style.borderColor = 'var(--primary-blue)';
        setTimeout(() => {
            card.style.borderColor = 'var(--glass-border)';
        }, 300);
    });
});

// Periodic Latency Simulation
setInterval(() => {
    const base = 20;
    const jitter = Math.floor(Math.random() * 15);
    latencyEl.innerText = (base + jitter) + "ms";
}, 3000);

console.log("AIRENA Portal Loaded - Ready for Deployment");
