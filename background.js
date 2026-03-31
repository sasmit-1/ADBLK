// Background service worker for CleanView Ad Blocker

// Initialize state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['enabled', 'totalBlocked'], (result) => {
    if (result.enabled === undefined) {
      chrome.storage.local.set({ enabled: true });
    }
    if (result.totalBlocked === undefined) {
      chrome.storage.local.set({ totalBlocked: 0 });
    }
  });
});

let blockedCount = 0;

// Track blocked requests and update badge
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
  blockedCount++;
  chrome.storage.local.get(['totalBlocked'], (result) => {
    const total = (result.totalBlocked || 0) + 1;
    chrome.storage.local.set({ totalBlocked: total });
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['totalBlocked', 'enabled'], (result) => {
      sendResponse({
        totalBlocked: result.totalBlocked || 0,
        enabled: result.enabled !== false
      });
    });
    return true;
  }

  if (message.type === 'TOGGLE_ENABLED') {
    const enabled = message.enabled;
    chrome.storage.local.set({ enabled });

    const rulesetIds = ['ruleset_ads', 'ruleset_trackers'];
    if (enabled) {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: rulesetIds,
        disableRulesetIds: []
      });
    } else {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: [],
        disableRulesetIds: rulesetIds
      });
    }
    sendResponse({ success: true });
    return true;
  }
});
