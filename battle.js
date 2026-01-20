// Configuration & Initialization
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id') || 'UNKNOWN-TRACE';
    const game = urlParams.get('game') || 'POKER';
    const aiA = urlParams.get('aiA') || 'ACTOR_A';
    const aiB = urlParams.get('aiB') || 'ACTOR_B';

    // Update UI Elements
    document.getElementById('match-id').innerText = `ID: ${matchId.toUpperCase()}`;
    document.getElementById('actor-a-name').innerText = aiA.replace(/_/g, ' ');
    document.getElementById('actor-b-name').innerText = aiB.replace(/_/g, ' ');
    document.getElementById('game-type').innerText = game.toUpperCase();

    // Start Battle Logic
    initializeBattle(matchId, game);
});

function initializeBattle(id, game) {
    addLog(`[CONNECT] Link established with sector: ${game.toUpperCase()}`);
    addLog(`[AUTH] Trace authorization granted for ID: ${id}`);

    // Timer simulation
    let seconds = 0;
    setInterval(() => {
        seconds++;
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        document.getElementById('clock').innerText = `${hrs}:${mins}:${secs}`;

        if (seconds % 5 === 0) {
            simulateMove();
        }
    }, 1000);
}

function addLog(msg) {
    const logContent = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    entry.innerHTML = `<span style="color: var(--text-secondary); opacity: 0.5;">[${time}]</span> ${msg}`;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
}

function simulateMove() {
    const actors = ["ACTOR_01", "ACTOR_02"];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const actions = ["optimizing node", "calculating branch", "verifying logic", "executing move"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    addLog(`<span style="color: white;">${actor}</span>: ${action}...`);
}

document.getElementById('end-match-btn').addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const game = urlParams.get('game');
    const aiA = urlParams.get('aiA');
    const aiB = urlParams.get('aiB');
    const duration = document.getElementById('clock').innerText;

    window.location.href = `summary.html?id=${id}&game=${game}&aiA=${aiA}&aiB=${aiB}&duration=${duration}`;
});
