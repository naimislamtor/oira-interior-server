// In-memory real-time log buffer (keeps last 50 events)
const liveLogs = [];

function addLiveLog(platform, eventType, senderId, userText, aiReply, status = "Success") {
  const logEntry = {
    id: Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    platform,
    eventType,
    senderId,
    userText,
    aiReply,
    status,
  };

  liveLogs.unshift(logEntry);

  // Keep only last 50 logs in memory
  if (liveLogs.length > 50) {
    liveLogs.pop();
  }

  console.log(`[REALTIME LOG] [${platform}] (${status}) User: "${userText}" -> AI: "${aiReply}"`);
  return logEntry;
}

function getLiveLogs() {
  return liveLogs;
}

function clearLiveLogs() {
  liveLogs.length = 0;
  return true;
}

module.exports = {
  addLiveLog,
  getLiveLogs,
  clearLiveLogs,
};
