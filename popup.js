const toggle = document.getElementById('mainToggle');
const toggleLabel = document.getElementById('toggleLabel');
const statusCard = document.getElementById('statusCard');
const statusText = document.getElementById('statusText');
const statusDetail = document.getElementById('statusDetail');
const adsCount = document.getElementById('adsCount');
const ruleCount = document.getElementById('ruleCount');
const resetBtn = document.getElementById('resetBtn');
const pillAds = document.getElementById('pillAds');
const pillTrackers = document.getElementById('pillTrackers');
const pillCosmeticAds = document.getElementById('pillCosmeticAds');
const pillRedirects = document.getElementById('pillRedirects');
const allPills = [pillAds, pillTrackers, pillCosmeticAds, pillRedirects];

function updateUI(enabled, totalBlocked, activeRulesets) {
  toggle.checked = enabled;
  toggleLabel.textContent = enabled ? 'ON' : 'OFF';

  if (enabled) {
    statusCard.classList.remove('off');
    statusText.innerHTML = 'Protection is <span>active</span>';
    statusDetail.textContent = (activeRulesets || 3) + ' protection layers running';
    document.body.classList.remove('disabled');
    allPills.forEach(p => {
      if (p === pillRedirects) {
        p.classList.add('redirect');
      }
      p.classList.add('active');
      p.classList.remove('inactive');
    });
  } else {
    statusCard.classList.add('off');
    statusText.innerHTML = 'Protection is <span>paused</span>';
    statusDetail.textContent = 'All protection layers disabled';
    document.body.classList.add('disabled');
    allPills.forEach(p => {
      p.classList.remove('active', 'redirect');
      p.classList.add('inactive');
    });
  }

  // Animated counter update
  const target = totalBlocked || 0;
  adsCount.textContent = target.toLocaleString();

  // Update rule count
  ruleCount.textContent = activeRulesets || 3;
}

// Load initial state
chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
  if (chrome.runtime.lastError) {
    // Fallback if background isn't ready
    updateUI(true, 0, 3);
    return;
  }
  if (response) {
    updateUI(response.enabled, response.totalBlocked, response.activeRulesets);
  }
});

// Toggle handler
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED', enabled }, () => {
    if (chrome.runtime.lastError) return;
    chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
      if (response) {
        updateUI(response.enabled, response.totalBlocked, response.activeRulesets);
      }
    });
  });
});

// Reset counter
resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'RESET_STATS' }, () => {
    adsCount.textContent = '0';
    adsCount.style.transform = 'scale(1.2)';
    adsCount.style.color = '#22d3a5';
    setTimeout(() => {
      adsCount.style.transform = 'scale(1)';
      adsCount.style.color = '';
    }, 300);
  });
});
