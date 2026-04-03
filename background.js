// CleanView Background Service Worker
// Handles: rule management, stats tracking, badge updates, redirect detection

// ── Configuration ─────────────────────────────────────────────────────
const ALL_RULESETS = ['ruleset_ads', 'ruleset_trackers', 'ruleset_redirects'];

// ── Initialize on install ─────────────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.get(['enabled', 'totalBlocked', 'sessionBlocked'], (result) => {
    const defaults = {};
    if (result.enabled === undefined) defaults.enabled = true;
    if (result.totalBlocked === undefined) defaults.totalBlocked = 0;
    if (result.sessionBlocked === undefined) defaults.sessionBlocked = 0;
    if (Object.keys(defaults).length > 0) {
      chrome.storage.local.set(defaults);
    }
  });

  // Set initial badge
  updateBadge(true);
});

// ── Badge management ──────────────────────────────────────────────────
function updateBadge(enabled) {
  if (enabled) {
    chrome.action.setBadgeBackgroundColor({ color: '#22d3a5' });
    chrome.action.setBadgeText({ text: 'ON' });
  } else {
    chrome.action.setBadgeBackgroundColor({ color: '#ff5470' });
    chrome.action.setBadgeText({ text: 'OFF' });
  }
}

// ── Track blocked requests ────────────────────────────────────────────
// Use getMatchedRules() polling since onRuleMatchedDebug only works
// with DevTools open and requires declarativeNetRequestFeedback.
let lastMatchedCount = 0;

async function pollMatchedRules() {
  try {
    const result = await chrome.declarativeNetRequest.getMatchedRules();
    const currentCount = result.rulesMatchedInfo ? result.rulesMatchedInfo.length : 0;
    
    if (currentCount > lastMatchedCount) {
      const newBlocks = currentCount - lastMatchedCount;
      lastMatchedCount = currentCount;
      
      chrome.storage.local.get(['totalBlocked', 'sessionBlocked'], (data) => {
        chrome.storage.local.set({
          totalBlocked: (data.totalBlocked || 0) + newBlocks,
          sessionBlocked: (data.sessionBlocked || 0) + newBlocks
        });
      });
    }
  } catch (e) {
    // getMatchedRules may fail silently in some contexts, ignore
  }
}

// Poll every 2 seconds for new matched rules
setInterval(pollMatchedRules, 2000);

// Also try onRuleMatchedDebug if available (works when DevTools is open)
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(() => {
    chrome.storage.local.get(['totalBlocked', 'sessionBlocked'], (data) => {
      chrome.storage.local.set({
        totalBlocked: (data.totalBlocked || 0) + 1,
        sessionBlocked: (data.sessionBlocked || 0) + 1
      });
    });
  });
}

// ── Redirect detection via webNavigation ──────────────────────────────
// This catches navigations that slip past declarativeNetRequest rules
// (e.g. new redirect domains we haven't catalogued yet, or JS-triggered
// navigations the network layer can't see).
const SUSPICIOUS_REDIRECT_PATTERNS = [
  /\b(stake|roobet|gamdom|rollbit|duelbits|1xbet|betwinner|mostbet|melbet)\b/i,
  /\b(pin-?up|linebet|22bet|betway|parimatch|megapari|fairspin)\b/i,
  /\b(vulkanvegas|bitstarz|mbitcasino|cloudbet|thunderpick|sportsbet)\b/i,
  /\b(clickadu|propellerads|hilltopads|monetag|adsterra|juicyads|exoclick)\b/i,
  /\b(trafficjunky|popads|popcash|trafficstars|adcash|admaven)\b/i,
  /\b(chaturbate|stripchat|cam4|bongacams|camsoda|xhamsterlive|livejasmin)\b/i,
  /\b(pornvertising|awempire|plugrush|contentabc|trafficforce)\b/i,
  /\b(adf\.ly|shorte\.st|ouo\.(io|press)|shrinkme|adfoc\.us)\b/i,
  /\b(realsrv|oclasrv|tsyndicate|marphezis|pushwhy|cpasmarter)\b/i,
];

// Track tab origins for cross-domain redirect detection
const tabOrigins = new Map();

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only care about top-level navigations
  if (details.frameId !== 0) return;
  
  const url = details.url;
  
  // Check against suspicious patterns
  for (const pattern of SUSPICIOUS_REDIRECT_PATTERNS) {
    if (pattern.test(url)) {
      // Redirect to our blocked page instead
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(url)
      });
      
      // Count as blocked
      chrome.storage.local.get(['totalBlocked', 'sessionBlocked'], (data) => {
        chrome.storage.local.set({
          totalBlocked: (data.totalBlocked || 0) + 1,
          sessionBlocked: (data.sessionBlocked || 0) + 1
        });
      });
      return;
    }
  }

  // Track the origin for this tab
  try {
    const origin = new URL(url).hostname;
    tabOrigins.set(details.tabId, origin);
  } catch (e) { /* invalid URL */ }
});

// Clean up tab tracking
chrome.tabs.onRemoved.addListener((tabId) => {
  tabOrigins.delete(tabId);
});

// ── Message handling ──────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['totalBlocked', 'sessionBlocked', 'enabled'], (result) => {
      // Count total rules across all rulesets
      chrome.declarativeNetRequest.getEnabledRulesets().then((enabledSets) => {
        sendResponse({
          totalBlocked: result.totalBlocked || 0,
          sessionBlocked: result.sessionBlocked || 0,
          enabled: result.enabled !== false,
          activeRulesets: enabledSets.length,
          rulesetNames: enabledSets
        });
      }).catch(() => {
        sendResponse({
          totalBlocked: result.totalBlocked || 0,
          sessionBlocked: result.sessionBlocked || 0,
          enabled: result.enabled !== false,
          activeRulesets: ALL_RULESETS.length,
          rulesetNames: ALL_RULESETS
        });
      });
    });
    return true; // async response
  }

  if (message.type === 'TOGGLE_ENABLED') {
    const enabled = message.enabled;
    chrome.storage.local.set({ enabled });

    if (enabled) {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ALL_RULESETS,
        disableRulesetIds: []
      });
    } else {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: [],
        disableRulesetIds: ALL_RULESETS
      });
    }

    updateBadge(enabled);
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'RESET_STATS') {
    chrome.storage.local.set({ totalBlocked: 0, sessionBlocked: 0 });
    sendResponse({ success: true });
    return true;
  }
});

// ── Keep badge in sync with state ─────────────────────────────────────
chrome.storage.local.get(['enabled'], (result) => {
  updateBadge(result.enabled !== false);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.enabled) {
    updateBadge(changes.enabled.newValue !== false);
  }
});
