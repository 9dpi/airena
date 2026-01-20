const SPREADSHEET_ID = "1YL8Ii3nyi9ztpSga5R7G-VTDugvcBYnALmvT6DeLR4Q";
const SHEET_NAME = "Matches";
const SECRET_KEY = "AI_ARENA_2026"; // Basic security

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
    new Date(),                // timestamp
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

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Basic authorization check
    if (data.secret !== SECRET_KEY) {
      return jsonResponse({ status: "error", message: "Unauthorized access" });
    }

    const result = {
      matchId: data.matchId || "MATCH_" + Date.now(),
      game: data.game || "chess",
      aiA: data.aiA,
      aiB: data.aiB,
      winner: data.winner,
      result: data.result || "win",
      moves: data.moves || 0,
      durationMs: data.durationMs || 0,
      replayLink: data.replayLink || ""
    };

    saveMatchResult(result);

    return jsonResponse({
      status: "ok",
      saved: true,
      matchId: result.matchId
    });

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.message
    });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function testSave() {
  saveMatchResult({
    matchId: "TEST_" + Date.now(),
    game: "chess",
    aiA: "AI Alpha",
    aiB: "AI Beta",
    winner: "AI Alpha",
    result: "win",
    moves: 42,
    durationMs: 9800,
    replayLink: "https://drive.google.com/..."
  });
}
