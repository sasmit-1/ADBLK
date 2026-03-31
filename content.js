// Content script - hides common ad container elements via CSS
(function () {
  const adSelectors = [
    // Google ads
    'ins.adsbygoogle',
    '[id^="google_ads_"]',
    '[id^="div-gpt-ad"]',
    '[id*="AdSlot"]',
    '[class*="adsbygoogle"]',
    // Generic ad containers
    '[class*="ad-container"]',
    '[class*="ad-wrapper"]',
    '[class*="ad-banner"]',
    '[class*="banner-ad"]',
    '[id*="ad-container"]',
    '[id*="ad-banner"]',
    '[id*="banner-ad"]',
    // Taboola / Outbrain
    '[id^="taboola-"]',
    '[class*="trc_related_container"]',
    '[id*="outbrain"]',
    '[class*="OUTBRAIN"]',
    // Sponsored labels
    '[class*="sponsored-content"]',
    '[class*="SponsoredContent"]',
    // Ad slots
    '[data-ad-slot]',
    '[data-ad-unit]',
    '[data-google-query-id]',
    // YouTube UI Ads
    'ytd-action-companion-ad-renderer',
    'ytd-display-ad-renderer',
    'ytd-video-masthead-ad-advertiser-info-renderer',
    'ytd-video-masthead-ad-primary-video-renderer',
    'ytd-in-feed-ad-layout-renderer',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-promoted-sparkles-text-search-renderer',
    'ytd-promoted-video-renderer',
    'ytd-compact-promoted-video-renderer',
    '#masthead-ad',
    '#player-ads',
    '.ytp-ad-overlay-container',
    '.ytd-ad-slot-renderer'
  ];

  const styleId = 'cleanview-adblocker-style';
  let ytAdInterval = null;

  function skipYouTubeVideoAds() {
    if (!window.location.hostname.includes('youtube.com')) return;
    
    // 1. Auto-click visible 'Skip Ad' buttons
    const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
    if (skipBtn) {
      skipBtn.click();
    }
    
    // 2. Fast-forward unskippable video ads that are playing
    const adVideo = document.querySelector('.ytp-ad-player-overlay') ? document.querySelector('.html5-main-video') : document.querySelector('.ad-showing video');
    
    if (adVideo && adVideo.duration) {
      // It's an ad video, skip to the end so it vanishes instantly
      if (adVideo.currentTime < adVideo.duration - 0.5) {
        adVideo.playbackRate = 16.0;
        adVideo.currentTime = adVideo.duration - 0.1;
      }
    }
  }

  function updateStyle(enabled) {
    let styleEl = document.getElementById(styleId);
    if (enabled !== false) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = adSelectors.join(',') + ' { display: none !important; visibility: hidden !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }';
        (document.head || document.documentElement).appendChild(styleEl);
      }
      
      // Setup YouTube specific active ad skipper
      if (window.location.hostname.includes('youtube.com') && !ytAdInterval) {
        ytAdInterval = setInterval(skipYouTubeVideoAds, 300);
      }
    } else {
      if (styleEl) styleEl.remove();
      if (ytAdInterval) {
        clearInterval(ytAdInterval);
        ytAdInterval = null;
      }
    }
  }

  // Initialize
  chrome.storage.local.get(['enabled'], (result) => {
    updateStyle(result.enabled);
  });

  // Listen for changes from popup
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.enabled) {
      updateStyle(changes.enabled.newValue);
    }
  });
})();
