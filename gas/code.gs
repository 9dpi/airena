const SPREADSHEET_ID = "1YL8Ii3nyi9ztpSga5R7G-VTDugvcBYnALmvT6DeLR4Q";
const SHEET_NAME = "Matches";
const SECRET_KEY = "AI_ARENA_2026";
const CACHE = CacheService.getScriptCache();

/**
 * AI REGISTRY - Backend Intelligence
 */
const AI_REGISTRY = {
  random: {
    decide: (fen, moves) => moves[Math.floor(Math.random() * moves.length)]
  },
  greedy: {
    decide: (fen, moves) => moves[0]
  }
};

/**
 * BACKEND GAME LOGIC
 */
function startMatch(config) {
  const matchId = "MATCH_" + Date.now();
  
  const initialState = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    turn: "w",
    aiA: config.aiA,
    aiB: config.aiB,
    game: config.game,
    startTime: Date.now(),
    movesCount: 0
  };

  CACHE.put(matchId, JSON.stringify(initialState), 600); // 10 minutes cache

  return {
    matchId,
    action: "start",
    fen: initialState.fen,
    gameOver: false
  };
}

function nextMove(matchId) {
  const raw = CACHE.get(matchId);
  if (!raw) return { error: "Match expired or not found" };

  const state = JSON.parse(raw);
  
  // Initialize Chess engine
  let game;
  try {
    // Note: If you have chess.js as a .gs file in your project, use:
    // const game = new Chess(state.fen); // Version 0.13.4 uses 'Chess' constructor
    game = new Chess(state.fen);
  } catch(e) {
    return { error: "Chess.js logic not found in Apps Script. Please copy the chess.js code into a new .gs file." };
  }

  const moves = game.moves();
  
  if (game.game_over() || moves.length === 0) {
    const result = finishAndSave(matchId, state, game);
    return result;
  }

  const currentAI = game.turn() === "w" ? state.aiA : state.aiB;
  const move = AI_REGISTRY[currentAI].decide(game.fen(), moves);
  game.move(move);

  const updatedState = {
    ...state,
    fen: game.fen(),
    turn: game.turn(),
    movesCount: state.movesCount + 1
  };

  CACHE.put(matchId, JSON.stringify(updatedState), 600);

  return {
    matchId,
    fen: updatedState.fen,
    gameOver: game.game_over(),
    turn: updatedState.turn,
    lastMove: move,
    moves: updatedState.movesCount
  };
}

function finishAndSave(matchId, state, game) {
  const winner = game.in_checkmate() ? (game.turn() === 'w' ? state.aiB : state.aiA) : "Draw";
  
  const finalResult = {
    matchId: matchId,
    game: state.game,
    aiA: state.aiA,
    aiB: state.aiB,
    winner: winner,
    result: winner === "Draw" ? "draw" : "win",
    moves: state.movesCount,
    durationMs: Date.now() - state.startTime
  };

  saveToSheet(finalResult);
  CACHE.remove(matchId);

  return {
    ...finalResult,
    fen: game.fen(),
    gameOver: true
  };
}

/**
 * SHEET OPERATIONS
 */
function saveToSheet(result) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["match_id", "timestamp", "game", "ai_a", "ai_b", "winner", "result", "moves", "duration_ms", "replay_link"]);
  }
  sheet.appendRow([
    result.matchId,
    new Date(),
    result.game,
    result.aiA,
    result.aiB,
    result.winner,
    result.result,
    result.moves,
    result.durationMs,
    ""
  ]);
}

/**
 * API ENDPOINT
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.secret !== SECRET_KEY) {
      return jsonResponse({ error: "Unauthorized" });
    }

    if (data.action === "start") {
      return jsonResponse(startMatch(data));
    }

    if (data.action === "move") {
      return jsonResponse(nextMove(data.matchId));
    }

    return jsonResponse({ error: "Unknown action" });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
