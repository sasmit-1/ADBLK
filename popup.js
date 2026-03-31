const toggle = document.getElementById('mainToggle');
const toggleLabel = document.getElementById('toggleLabel');
const statusCard = document.getElementById('statusCard');
const statusText = document.getElementById('statusText');
const adsCount = document.getElementById('adsCount');
const resetBtn = document.getElementById('resetBtn');
const pillAds = document.getElementById('pillAds');
const pillTrackers = document.getElementById('pillTrackers');
const pillCosmeticAds = document.getElementById('pillCosmeticAds');

function updateUI(enabled, totalBlocked) {
  toggle.checked = enabled;
  toggleLabel.textContent = enabled ? 'ON' : 'OFF';

  if (enabled) {
    statusCard.classList.remove('off');
    statusText.innerHTML = 'Protection is <span>active</span>';
    document.body.classList.remove('disabled');
    [pillAds, pillTrackers, pillCosmeticAds].forEach(p => {
      p.classList.add('active');
      p.classList.remove('inactive');
    });
  } else {
    statusCard.classList.add('off');
    statusText.innerHTML = 'Protection is <span>paused</span>';
    document.body.classList.add('disabled');
    [pillAds, pillTrackers, pillCosmeticAds].forEach(p => {
      p.classList.remove('active');
      p.classList.add('inactive');
    });
  }

  adsCount.textContent = totalBlocked > 0
    ? totalBlocked.toLocaleString()
    : '0';
}

// Load initial state
chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
  if (response) {
    updateUI(response.enabled, response.totalBlocked);
  }
});

// Toggle handler
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED', enabled }, () => {
    chrome.storage.local.get(['totalBlocked'], (result) => {
      updateUI(enabled, result.totalBlocked || 0);
    });
  });
});

// Reset counter
resetBtn.addEventListener('click', () => {
  chrome.storage.local.set({ totalBlocked: 0 }, () => {
    adsCount.textContent = '0';
    adsCount.style.transform = 'scale(1.2)';
    setTimeout(() => { adsCount.style.transform = 'scale(1)'; }, 200);
  });
});
