// Content script - hides ad elements via CSS + actively removes stubborn ads
(function () {
  'use strict';

  // ── CSS Selectors for cosmetic ad hiding ──────────────────────────────
  // These cover Google ads, generic containers, native ad widgets,
  // manga/anime/streaming site patterns, popups, and YouTube overlays.
  const adSelectors = [
    // Google Ads
    'ins.adsbygoogle',
    '[id^="google_ads_"]',
    '[id^="div-gpt-ad"]',
    '[id*="AdSlot"]',
    '[class*="adsbygoogle"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="doubleclick"]',

    // Generic ad containers (class)
    '[class*="ad-container"]',
    '[class*="ad-wrapper"]',
    '[class*="ad-banner"]',
    '[class*="ad-box"]',
    '[class*="ad-slot"]',
    '[class*="ad-zone"]',
    '[class*="ad-block"]',
    '[class*="ad-frame"]',
    '[class*="ad-holder"]',
    '[class*="ad-inner"]',
    '[class*="ad-label"]',
    '[class*="ad-unit"]',
    '[class*="ad-widget"]',
    '[class*="ad_container"]',
    '[class*="ad_wrapper"]',
    '[class*="ad_banner"]',
    '[class*="ad_box"]',
    '[class*="ad_slot"]',
    '[class*="banner-ad"]',
    '.ads-container',
    '.ads-wrapper',
    '.ad-wrap',
    '.advert',
    '.advertisement',

    // Generic ad containers (id)
    '[id*="ad-container"]',
    '[id*="ad-banner"]',
    '[id*="banner-ad"]',
    '[id*="ad-box"]',
    '[id*="ad-slot"]',
    '[id*="ad-zone"]',
    'div[id^="ad_"]',
    'div[id^="ad-"]',

    // Taboola / Outbrain / RevContent
    '[id^="taboola-"]',
    '[class*="trc_related_container"]',
    '[id*="outbrain"]',
    '[class*="OUTBRAIN"]',
    '[id*="revcontent"]',
    '[class*="rc-widget"]',

    // Sponsored / promoted content
    '[class*="sponsored"]',
    '[class*="Sponsored"]',
    '[id*="sponsored"]',
    '[id*="Sponsored"]',
    '[class*="promoted"]',
    '[class*="Promoted"]',

    // Sidebar ads (manga, anime, streaming, pirate sites)
    '[class*="sidebar-ad"]',
    '[class*="ad-sidebar"]',
    '[id*="ad-side"]',
    '[class*="side_ad"]',
    '[class*="side-ad"]',
    '[class*="sidebar_ad"]',
    '.sidebar-ad',

    // Popup / overlay / interstitial ads
    '[class*="popup-ad"]',
    '[class*="popunder"]',
    '[class*="interstitial"]',
    '[id*="popup-ad"]',
    '[id*="popunder"]',
    '[class*="modal-ad"]',
    'div[class*="overlay-ad"]',

    // Sticky / floating ads
    '[class*="sticky-ad"]',
    '[class*="floating-ad"]',
    '[id*="sticky-ad"]',
    '[id*="floating-ad"]',
    '[class*="fixed-ad"]',

    // Common ad network specific patterns
    '[class*="wpac_"]',
    '[class*="pro-ad"]',
    '[id^="pro-ad-"]',
    'div[class^="ad_"]',
    '[data-ad-slot]',
    '[data-ad-unit]',
    '[data-ad]',
    '[data-adid]',
    '[data-ad-manager]',
    '[data-google-query-id]',
    '[data-ad-client]',

    // Iframes from ad networks
    'iframe[src*="ad"]',
    'iframe[src*="banner"]',
    'iframe[src*="pop"]',
    'iframe[data-aa]',
    'iframe[id^="aswift"]',
    'iframe[id^="google_ads"]',

    // Common manga/anime site ad patterns
    'a[href*="crazygames"]',
    'a[href*="crazygames"] img',
    '[class*="c-ad"]',
    '[class*="m-ad"]',
    '[class*="ads-"]',
    '[id*="ads-"]',
    'center > a[target="_blank"][rel*="nofollow"] > img',
    'div[style*="position: fixed"][style*="z-index"]',

    // Cookie / GDPR banners (annoyances)
    '#onetrust-consent-sdk',
    '.cc-window',
    '[class*="cookie-banner"]',
    '[class*="cookie-consent"]',
    '[id*="cookie-banner"]',
    '[id*="cookie-consent"]',
    '[class*="gdpr"]',

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
    '.ytd-ad-slot-renderer',
    '.ytp-ad-module',
    'ytd-merch-shelf-renderer',
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]'
  ];

  const styleId = 'cleanview-adblocker-style';
  let observer = null;

  // ── Popunder blocker: intercept window.open() calls ─────────────────
  // Pirate sites call window.open() on click events to spawn gambling tabs.
  // We override it to block known scam/gambling domains.
  const blockedPopunderDomains = [
    'stake.com', 'stake.us', 'roobet.com', 'gamdom.com', 'rollbit.com',
    'duelbits.com', 'bc.game', '1xbet.com', 'betwinner.com', '1win.com',
    'mostbet.com', 'melbet.com', 'pin-up.com', 'linebet.com', '22bet.com',
    'betway.com', 'parimatch.com', 'megapari.com', 'fairspin.io',
    'crazygames.com', 'clickadu.com', 'propellerads.com', 'hilltopads.net',
    'monetag.com', 'adsterra.com', 'juicyads.com', 'exoclick.com',
    'trafficjunky.net', 'popads.net', 'popcash.net', 'trafficstars.com'
  ];

  const originalWindowOpen = window.open;
  window.open = function(url, ...args) {
    if (url) {
      const urlStr = String(url).toLowerCase();
      for (let i = 0; i < blockedPopunderDomains.length; i++) {
        if (urlStr.includes(blockedPopunderDomains[i])) {
          return null; // Block it silently
        }
      }
    }
    return originalWindowOpen.call(window, url, ...args);
  };

  // ── Build one CSS rule from all selectors ────────────────────────────
  const cssRule = adSelectors.join(',') +
    ' { display: none !important; visibility: hidden !important;' +
    ' height: 0 !important; width: 0 !important;' +
    ' min-height: 0 !important; min-width: 0 !important;' +
    ' max-height: 0 !important; max-width: 0 !important;' +
    ' overflow: hidden !important; position: absolute !important;' +
    ' pointer-events: none !important; opacity: 0 !important; }';

  // ── YouTube-specific ad skipper ──────────────────────────────────────
  function skipYouTubeVideoAds() {
    // Auto-click skip buttons
    const skipBtn = document.querySelector(
      '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button,' +
      ' .ytp-ad-skip-button-container button'
    );
    if (skipBtn) {
      skipBtn.click();
      return;
    }

    // Fast-forward unskippable video ads
    const player = document.querySelector('.html5-video-player');
    if (player && player.classList.contains('ad-showing')) {
      const video = player.querySelector('video');
      if (video && video.duration && video.currentTime < video.duration - 0.3) {
        video.currentTime = video.duration;
      }
    }
  }

  // ── Active DOM scanner: removes ad elements that CSS alone can't kill ─
  // Some sites inject ads via JS after page load, or use inline styles that
  // override our CSS. This function finds and collapses them.
  function scanAndRemoveAds() {
    // 1. Kill hidden iframes from ad networks
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0, len = iframes.length; i < len; i++) {
      const src = iframes[i].src || '';
      if (
        src.includes('ad') || src.includes('banner') ||
        src.includes('pop') || src.includes('track') ||
        src.includes('syndication') || src.includes('doubleclick') ||
        src.includes('crazygames') || src.includes('juicyads') ||
        src.includes('exoclick') || src.includes('trafficjunky') ||
        src.includes('clickadu') || src.includes('propellerads') ||
        src.includes('hilltopads') || src.includes('adsterra') ||
        src.includes('monetag')
      ) {
        iframes[i].style.cssText = 'display:none!important;height:0!important;width:0!important;';
        iframes[i].src = 'about:blank';
      }
    }

    // 2. Remove elements whose text says "Sponsored Ads" / "Advertisement"
    const walkerFilter = { acceptNode: () => NodeFilter.FILTER_ACCEPT };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, walkerFilter);
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim().toLowerCase();
      if (
        text === 'sponsored ads' || text === 'sponsored ad' ||
        text === 'advertisement' || text === 'ads by' ||
        text === 'sponsored content' || text === 'ad'
      ) {
        // Walk up to find the container (max 5 levels) and hide the whole block
        let el = walker.currentNode.parentElement;
        for (let depth = 0; el && depth < 5; depth++) {
          // If this parent is big enough to be an ad container, hide it
          if (el.offsetHeight > 50 || el.children.length > 1) {
            el.style.cssText = 'display:none!important;height:0!important;width:0!important;overflow:hidden!important;';
            break;
          }
          el = el.parentElement;
        }
      }
    }

    // 3. YouTube-specific
    if (window.location.hostname.includes('youtube.com')) {
      skipYouTubeVideoAds();
    }

    // 4. Neutralize transparent clickjacking overlays (common on pirate sites)
    // These are invisible massive divs placed over content to trigger popunders.
    const allEls = document.querySelectorAll('div, a, section, span, iframe');
    for (let i = 0; i < allEls.length; i++) {
      const el = allEls[i];
      const style = window.getComputedStyle(el);
      const zIdx = parseInt(style.zIndex, 10) || 0;
      const opacity = parseFloat(style.opacity);

      // Detect: high z-index + invisible/near-invisible + covers most of screen
      if (zIdx > 999 && opacity < 0.15 && style.position !== 'static') {
        const rect = el.getBoundingClientRect();
        if (rect.width > window.innerWidth * 0.7 && rect.height > window.innerHeight * 0.7) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      }

      // Detect: position:fixed covering full viewport with no visible content
      if (style.position === 'fixed' && zIdx > 100) {
        const rect = el.getBoundingClientRect();
        if (rect.width > window.innerWidth * 0.9 && rect.height > window.innerHeight * 0.9 && opacity < 0.2) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      }
    }

    // 5. Strip onclick handlers from anchors pointing to gambling/scam sites
    const links = document.querySelectorAll('a[href]');
    for (let i = 0; i < links.length; i++) {
      const href = (links[i].href || '').toLowerCase();
      for (let j = 0; j < blockedPopunderDomains.length; j++) {
        if (href.includes(blockedPopunderDomains[j])) {
          links[i].removeAttribute('href');
          links[i].removeAttribute('onclick');
          links[i].removeAttribute('onmousedown');
          links[i].style.setProperty('pointer-events', 'none', 'important');
          links[i].style.setProperty('display', 'none', 'important');
          break;
        }
      }
    }
  }

  // ── Main lifecycle ───────────────────────────────────────────────────
  function enable() {
    // Inject CSS
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = cssRule;
      (document.head || document.documentElement).appendChild(styleEl);
    }

    // Run one immediate scan
    if (document.body) scanAndRemoveAds();

    // Observe DOM mutations (throttled) — catches dynamically injected ads
    if (!observer) {
      let scheduled = false;
      observer = new MutationObserver(() => {
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(() => {
            scanAndRemoveAds();
            scheduled = false;
          });
        }
      });
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        // Body not ready yet — wait for it
        const bodyWaiter = new MutationObserver(() => {
          if (document.body) {
            bodyWaiter.disconnect();
            observer.observe(document.body, { childList: true, subtree: true });
            scanAndRemoveAds();
          }
        });
        bodyWaiter.observe(document.documentElement, { childList: true });
      }
    }
  }

  function disable() {
    const styleEl = document.getElementById(styleId);
    if (styleEl) styleEl.remove();
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────
  chrome.storage.local.get(['enabled'], (result) => {
    if (result.enabled !== false) enable();
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.enabled) {
      changes.enabled.newValue !== false ? enable() : disable();
    }
  });
})();
