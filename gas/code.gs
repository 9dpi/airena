const SPREADSHEET_ID = "1YL8Ii3nyi9ztpSga5R7G-VTDugvcBYnALmvT6DeLR4Q";
const SHEET_NAME = "Matches";
const SECRET_KEY = "AI_ARENA_2026";

/**
 * AI REGISTRY - Centralized AI Logic
 */
const AI_REGISTRY = {
  random: {
    name: "AI Random",
    decide: (state, moves) => moves[Math.floor(Math.random() * moves.length)]
  },
  greedy: {
    name: "AI Greedy",
    decide: (state, moves) => moves[0] // Just take the first available move
  }
};

/**
 * BATTLE ORCHESTRATOR
 */
function runBattle(config) {
  switch (config.game) {
    case "chess":
      return runChess(config);
    case "xiangqi":
      return runXiangqi(config);
    case "mini":
      return runMini(config);
    default:
      throw new Error("Unknown game: " + config.game);
  }
}

/**
 * GAME 1: CHESS ENGINE (MVP Simulation)
 * Note: For production, include chess.js library in Apps Script
 */
function runChess(config) {
  // Mocking Chess.js if not available
  const movesCount = Math.floor(Math.random() * 60) + 10;
  const start = Date.now();
  
  // Simulation logic...
  const winner = Math.random() > 0.5 ? config.aiA : config.aiB;
  
  return buildResult(config, {
    winner: winner,
    moves: movesCount,
    durationMs: Date.now() - start
  });
}

/**
 * GAME 2: XIANGQI (Simplified MVP)
 */
function runXiangqi(config) {
  let moves = Math.floor(Math.random() * 80) + 20;
  let winner = Math.random() > 0.5 ? config.aiA : config.aiB;

  return buildResult(config, {
    winner,
    moves,
    durationMs: 5000 + Math.random() * 3000
  });
}

/**
 * GAME 3: MINI GAME (Grid Battle)
 */
function runMini(config) {
  let scoreA = 0;
  let scoreB = 0;

  for (let i = 0; i < 25; i++) {
    Math.random() > 0.5 ? scoreA++ : scoreB++;
  }

  return buildResult(config, {
    winner: scoreA > scoreB ? config.aiA : config.aiB,
    moves: 25,
    durationMs: 2000
  });
}

/**
 * RESULT BUILDER (Normalization)
 */
function buildResult(config, data) {
  return {
    matchId: "MATCH_" + Date.now(),
    game: config.game,
    aiA: config.aiA,
    aiB: config.aiB,
    winner: data.winner,
    result: "completed",
    moves: data.moves,
    durationMs: data.durationMs,
    replayLink: ""
  };
}

/**
 * SHEET OPERATIONS
 */
function getMatchSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["match_id", "timestamp", "game", "ai_a", "ai_b", "winner", "result", "moves", "duration_ms", "replay_link"]);
  }
  return sheet;
}

function saveMatchResult(result) {
  const sheet = getMatchSheet();
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
    result.replayLink || ""
  ]);
}

/**
 * API ENDPOINT
 */
function doPost(e) {
  try {
    const config = JSON.parse(e.postData.contents);
    
    // Auth Check
    if (config.secret !== SECRET_KEY) {
      return jsonResponse({ error: "Unauthorized" });
    }

    const result = runBattle(config);
    saveMatchResult(result);

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
