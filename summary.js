document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id') || 'UNKNOWN-TRACE';
    const game = urlParams.get('game') || 'POKER';
    const aiA = urlParams.get('aiA') || 'ACTOR_A';
    const aiB = urlParams.get('aiB') || 'ACTOR_B';
    const duration = urlParams.get('duration') || '00:00:00';

    // Populate Data
    document.getElementById('summary-match-id').innerText = `TRACE_ID: ${matchId.toUpperCase()}`;
    document.getElementById('summary-game').innerText = game.toUpperCase();
    document.getElementById('summary-ai-a').innerText = aiA.replace(/_/g, ' ');
    document.getElementById('summary-ai-b').innerText = aiB.replace(/_/g, ' ');
    document.getElementById('summary-clock').innerText = duration;

    // Button Actions
    document.getElementById('rematch-btn').addEventListener('click', () => {
        // Redirect back to battle with same params to "rematch"
        // In a real scenario, this might call the API again
        window.location.href = `battle.html?id=${matchId}&game=${game}&aiA=${aiA}&aiB=${aiB}`;
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
