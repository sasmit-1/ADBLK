// CleanView Content Script — Cosmetic ad hiding + DOM cleanup
// This runs in the ISOLATED world. The redirect_blocker.js handles
// MAIN world interception (window.open, location, click hijacks).
(function () {
  'use strict';

  // ── CSS Selectors for cosmetic ad hiding ──────────────────────────────
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
    '[class^="ad-container"]', '[class*=" ad-container"]',
    '[class^="ad-wrapper"]', '[class*=" ad-wrapper"]',
    '[class^="ad-banner"]', '[class*=" ad-banner"]',
    '[class^="ad-box"]', '[class*=" ad-box"]',
    '[class^="ad-slot"]', '[class*=" ad-slot"]',
    '[class^="ad-zone"]', '[class*=" ad-zone"]',
    '[class^="ad-block"]', '[class*=" ad-block"]',
    '[class^="ad-frame"]', '[class*=" ad-frame"]',
    '[class^="ad-holder"]', '[class*=" ad-holder"]',
    '[class^="ad-inner"]', '[class*=" ad-inner"]',
    '[class^="ad-label"]', '[class*=" ad-label"]',
    '[class^="ad-unit"]', '[class*=" ad-unit"]',
    '[class^="ad-widget"]', '[class*=" ad-widget"]',
    '[class^="ad_container"]', '[class*=" ad_container"]',
    '[class^="ad_wrapper"]', '[class*=" ad_wrapper"]',
    '[class^="ad_banner"]', '[class*=" ad_banner"]',
    '[class^="ad_box"]', '[class*=" ad_box"]',
    '[class^="ad_slot"]', '[class*=" ad_slot"]',
    '[class^="banner-ad"]', '[class*=" banner-ad"]',
    '.ads-container',
    '.ads-wrapper',
    '.ad-wrap',
    '.advert',
    '.advertisement',

    // Generic ad containers (id)
    '[id^="ad-container"]', '[id*="-ad-container"]',
    '[id^="ad-banner"]', '[id*="-ad-banner"]',
    '[id^="banner-ad"]', '[id*="-banner-ad"]',
    '[id^="ad-box"]', '[id*="-ad-box"]',
    '[id^="ad-slot"]', '[id*="-ad-slot"]',
    '[id^="ad-zone"]', '[id*="-ad-zone"]',
    'div[id^="ad_"]',
    'div[id^="ad-"]',

    // Taboola / Outbrain / RevContent / MGID
    '[id^="taboola-"]',
    '[class*="trc_related_container"]',
    '[id*="outbrain"]',
    '[class*="OUTBRAIN"]',
    '[id*="revcontent"]',
    '[class*="rc-widget"]',
    '[id*="mgid"]',
    '[class*="mgid"]',

    // Sponsored / promoted content
    '[class*="sponsored"]',
    '[class*="Sponsored"]',
    '[id*="sponsored"]',
    '[id*="Sponsored"]',
    '[class*="promoted"]',
    '[class*="Promoted"]',

    // Sidebar ads
    '[class^="sidebar-ad"]', '[class*=" sidebar-ad"]',
    '[class^="ad-sidebar"]', '[class*=" ad-sidebar"]',
    '[id^="ad-side"]', '[id*="-ad-side"]',
    '[class^="side_ad"]', '[class*=" side_ad"]',
    '[class^="side-ad"]', '[class*=" side-ad"]',
    '[class^="sidebar_ad"]', '[class*=" sidebar_ad"]',
    '.sidebar-ad',

    // Popup / overlay / interstitial ads
    '[class^="popup-ad"]', '[class*=" popup-ad"]',
    '[class*="popunder"]',
    '[class*="interstitial"]',
    '[id^="popup-ad"]', '[id*="-popup-ad"]',
    '[id*="popunder"]',
    '[class^="modal-ad"]', '[class*=" modal-ad"]',
    'div[class^="overlay-ad"]', 'div[class*=" overlay-ad"]',

    // Sticky / floating ads
    '[class^="sticky-ad"]', '[class*=" sticky-ad"]',
    '[class^="floating-ad"]', '[class*=" floating-ad"]',
    '[id^="sticky-ad"]', '[id*="-sticky-ad"]',
    '[id^="floating-ad"]', '[id*="-floating-ad"]',
    '[class^="fixed-ad"]', '[class*=" fixed-ad"]',

    // Common ad network patterns
    '[class*="wpac_"]',
    '[class^="pro-ad"]', '[class*=" pro-ad"]',
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
    'iframe[src*="googlesyndication"]',
    'iframe[src*="doubleclick"]',
    'iframe[data-aa]',
    'iframe[id^="aswift"]',
    'iframe[id^="google_ads"]',

    // Manga / anime / streaming site patterns
    'a[href*="crazygames"]',
    'a[href*="crazygames"] img',
    '[class^="c-ad"]', '[class*=" c-ad"]',
    '[class^="m-ad"]', '[class*=" m-ad"]',
    '[class^="ads-"]', '[class*=" ads-"]',
    '[id^="ads-"]', '[id*="-ads-"]',
    // NatoManga / MangaKakalot / similar patterns
    '.adbox', '.ad-box', '.ad_box',
    '.adv-banner', '.advbanner',
    '[class^="banner_ads"]', '[class*=" banner_ads"]',
    '[class^="banner-ads"]', '[class*=" banner-ads"]',
    '[class^="native-ad"]', '[class*=" native-ad"]',
    '.ads', '#ads',
    '.ad-space', '.adspace',
    '[class^="content-ad"]', '[class*=" content-ad"]',
    '[class^="reader-ad"]', '[class*=" reader-ad"]',
    '.chapter-ad', '.manga-ad',
    // Fullscreen / interstitial overlays common on manga sites
    'div[style*="position: fixed"][style*="z-index: 9999"]',
    'div[style*="position: fixed"][style*="z-index:9999"]',
    'div[style*="position:fixed"][style*="z-index: 9999"]',
    'div[style*="position:fixed"][style*="z-index:9999"]',
    // Generic external-link ad wrappers
    'center > a[target="_blank"][rel*="nofollow"] > img',

    // Fake download / notification / push popups (Monetag, PropellerAds, etc.)
    '[class*="push-notification"]',
    '[class*="push_notification"]',
    '[id*="push-notification"]',
    '[id*="push_notification"]',
    '[class*="notification-popup"]',
    '[class*="notification_popup"]',
    '[class*="notif-popup"]',
    '[class*="download-notification"]',
    '[class*="download-popup"]',
    '[class*="download-modal"]',
    '[class*="fake-notification"]',
    '[class*="browser-notification"]',
    '[class*="web-notification"]',
    '[class*="pn-notification"]',
    '[class*="pn_notification"]',
    '[id*="pn-notification"]',
    '[id*="pn_notification"]',
    // Monetag-specific patterns
    '[class*="monetag"]',
    '[id*="monetag"]',
    '[class*="mntg"]',
    '[id*="mntg"]',
    // PropellerAds-specific patterns  
    '[class*="propeller"]',
    '[id*="propeller"]',
    // Generic scam notification containers
    '[class*="notify-overlay"]',
    '[class*="overlay-notification"]',
    '[class*="prompt-overlay"]',
    '[class*="alert-overlay"]',
    // Common injected ad container IDs (random-looking)
    'div[id^="_"][style*="z-index"][style*="position: fixed"]',
    'div[id^="_"][style*="z-index"][style*="position:fixed"]',

    // Cookie / GDPR banners (annoyances)
    '#onetrust-consent-sdk',
    '.cc-window',
    '[class*="cookie-banner"]',
    '[class*="cookie-consent"]',
    '[id*="cookie-banner"]',
    '[id*="cookie-consent"]',
    '[class*="gdpr"]',

    // Anti-adblock walls
    '[class*="adblock-notice"]',
    '[class*="adblock-modal"]',
    '[id*="adblock-notice"]',
    '[id*="adblock-modal"]',
    '[class*="adb-overlay"]',
    '[id*="adb-overlay"]',
    '[class*="ad-blocker-detected"]',
    '[id*="ad-blocker-detected"]',

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
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
    '#related ytd-promoted-video-renderer',
    '#movie_player .ytp-ad-player-overlay',
    '.ytp-ad-text',
    '.ytp-ad-image',
    '.ytp-ad-feedback-dialog-container',
    'ytd-banner-promo-renderer',
    '#banner-shape .ytd-statement-banner-renderer'
  ];

  const styleId = 'cleanview-adblocker-style';
  let observer = null;
  let ytAdInterval = null;

  // ── Build CSS rule ───────────────────────────────────────────────────
  const cssRule = adSelectors.join(',') +
    ' { display: none !important; visibility: hidden !important;' +
    ' height: 0 !important; width: 0 !important;' +
    ' min-height: 0 !important; min-width: 0 !important;' +
    ' max-height: 0 !important; max-width: 0 !important;' +
    ' overflow: hidden !important; position: absolute !important;' +
    ' pointer-events: none !important; opacity: 0 !important; }';

  // ── Known ad-network iframe domains (for targeted iframe kill) ──────
  const adIframeDomains = [
    'googlesyndication', 'doubleclick', 'crazygames', 'juicyads',
    'exoclick', 'trafficjunky', 'clickadu', 'propellerads',
    'hilltopads', 'adsterra', 'monetag', 'popads', 'popcash',
    'trafficstars', 'adcash', 'admaven', 'ad-maven', 'galaksion',
    'onclicka', 'richads', 'realsrv', 'adskeeper', 'bidvertiser',
    'adspyglass', 'mgid', 'revcontent', 'taboola', 'outbrain'
  ];

  // ── YouTube-specific ad skipper ─────────────────────────────────────
  function skipYouTubeVideoAds() {
    // Click skip buttons (all known variants)
    const skipBtn = document.querySelector(
      '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button,' +
      ' .ytp-ad-skip-button-container button,' +
      ' button.ytp-ad-skip-button-modern,' +
      ' .ytp-ad-skip-button-slot button'
    );
    if (skipBtn) {
      skipBtn.click();
      return;
    }

    // Fast-forward unskippable video ads
    const player = document.querySelector('.html5-video-player');
    if (player && player.classList.contains('ad-showing')) {
      const video = player.querySelector('video');
      if (video && video.duration && isFinite(video.duration)) {
        // Mute ad and speed it up to end as fast as possible
        video.muted = true;
        video.playbackRate = 16;
        if (video.currentTime < video.duration - 0.1) {
          video.currentTime = video.duration;
        }
      }
    }
  }

  // ── Targeted iframe remover ─────────────────────────────────────────
  function killAdIframes() {
    // Kill iframes from known ad networks
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0, len = iframes.length; i < len; i++) {
      const iframe = iframes[i];
      const src = (iframe.src || '').toLowerCase();
      
      // Block known ad network iframes
      for (let j = 0; j < adIframeDomains.length; j++) {
        if (src && src.includes(adIframeDomains[j])) {
          nukeElement(iframe);
          break;
        }
      }

      // Block cross-origin iframes that don't belong to the current site
      // These are commonly used for ad injection and popunder scripts
      if (src && !src.startsWith('about:') && !src.startsWith('javascript:')) {
        try {
          const iframeHost = new URL(src).hostname.toLowerCase();
          const pageHost = location.hostname.toLowerCase();
          // If different domain and not a known legitimate service
          if (iframeHost !== pageHost && 
              !iframeHost.includes('google.com') &&
              !iframeHost.includes('youtube.com') &&
              !iframeHost.includes('recaptcha.net') &&
              !iframeHost.includes('gstatic.com') &&
              !iframeHost.includes('cloudflare.com') &&
              !iframeHost.includes('disqus.com') &&
              !iframeHost.includes('facebook.com') &&
              !iframeHost.includes('twitter.com')) {
            // Check if it looks like an ad iframe (small, hidden, or overlay)
            const rect = iframe.getBoundingClientRect();
            const style = window.getComputedStyle(iframe);
            const isHidden = rect.width <= 1 || rect.height <= 1 ||
                             style.display === 'none' || style.visibility === 'hidden';
            const isOverlay = parseInt(style.zIndex, 10) > 100;
            if (isHidden || isOverlay) {
              nukeElement(iframe);
            }
          }
        } catch (e) { /* invalid URL */ }
      }

      // Block iframes with no src or blob: src (used to inject ad content)
      if (!src || src === '' || src.startsWith('blob:')) {
        const rect = iframe.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const style = window.getComputedStyle(iframe);
          const zIdx = parseInt(style.zIndex, 10) || 0;
          if (zIdx > 100 || style.position === 'fixed' || style.position === 'absolute') {
            nukeElement(iframe);
          }
        }
      }
    }
  }

  // Helper to completely remove an element
  function nukeElement(el) {
    el.style.cssText = 'display:none!important;height:0!important;width:0!important;pointer-events:none!important;visibility:hidden!important;position:absolute!important;';
    if (el.tagName === 'IFRAME') {
      try { el.src = 'about:blank'; } catch (e) {}
    }
  }

  // ── Invisible overlay remover ───────────────────────────────────────
  function killInvisibleOverlays() {
    const candidates = document.querySelectorAll(
      'div[style*="position: fixed"], div[style*="position:fixed"],' +
      'div[style*="position: absolute"][style*="z-index"],' +
      'a[style*="position: fixed"], a[style*="position:fixed"]'
    );
    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      const style = window.getComputedStyle(el);
      const zIdx = parseInt(style.zIndex, 10) || 0;
      const opacity = parseFloat(style.opacity);
      if (zIdx > 500 && opacity < 0.15 && style.position !== 'static') {
        const rect = el.getBoundingClientRect();
        if (rect.width > window.innerWidth * 0.6 && rect.height > window.innerHeight * 0.6) {
          nukeElement(el);
        }
      }
    }
  }

  // ── Fake popup / notification / download ad killer ──────────────────
  // Ad networks like Monetag, PropellerAds inject fake popups that look like
  // system notifications ("Download is ready", "You have a new message", etc.)
  // These are high-z-index fixed-position divs with a dark backdrop.
  const SCAM_POPUP_TEXTS = [
    'download is ready', 'tap to proceed', 'click to continue',
    'your download', 'file is ready', 'download file',
    'update is ready', 'update available', 'update required',
    'virus detected', 'scan your', 'your device',
    'you have been selected', 'congratulations', 'you won',
    'claim your', 'spin the wheel', 'lucky visitor',
    'your phone', 'battery is low', 'connection is not private',
    'install vpn', 'hotspot shield', 'your pc',
    'new message', 'unread messages', 'notification',
    'allow notification', 'subscribe to notifications',
    'click allow', 'press allow',
    'win a', 'free iphone', 'gift card',
    'dating', 'singles in your', 'meet singles',
  ];

  function killFakePopups() {
    // Strategy 1: Find fixed/absolute overlays with high z-index that contain scam text
    const fixedEls = document.querySelectorAll(
      'div[style*="position: fixed"], div[style*="position:fixed"],' +
      'div[style*="z-index"]'
    );

    for (let i = 0; i < fixedEls.length; i++) {
      const el = fixedEls[i];
      try {
        const style = window.getComputedStyle(el);
        const zIdx = parseInt(style.zIndex, 10) || 0;
        
        // Only check high z-index elements (ad popups use z-index > 1000 typically)
        if (zIdx < 100) continue;
        if (style.position !== 'fixed' && style.position !== 'absolute') continue;
        
        const text = (el.textContent || '').toLowerCase().trim();
        if (!text || text.length > 5000) continue; // Skip empty or huge elements

        // Check if the text matches known scam popup patterns
        for (let j = 0; j < SCAM_POPUP_TEXTS.length; j++) {
          if (text.includes(SCAM_POPUP_TEXTS[j])) {
            nukeElement(el);
            break;
          }
        }
      } catch (e) { /* getComputedStyle can fail */ }
    }

    // Strategy 2: Kill dark backdrop overlays (semi-transparent full-screen divs)
    // These are the dark backgrounds behind popup ads
    const allFixed = document.querySelectorAll(
      'div[style*="position: fixed"], div[style*="position:fixed"]'
    );
    for (let i = 0; i < allFixed.length; i++) {
      const el = allFixed[i];
      try {
        const style = window.getComputedStyle(el);
        const zIdx = parseInt(style.zIndex, 10) || 0;
        if (zIdx < 100) continue;
        
        const rect = el.getBoundingClientRect();
        const coversScreen = rect.width >= window.innerWidth * 0.9 && 
                             rect.height >= window.innerHeight * 0.9;
        
        if (coversScreen) {
          const bgColor = style.backgroundColor;
          // Check for dark/semi-transparent backgrounds (rgba with alpha)
          if (bgColor.includes('rgba') && !bgColor.includes(', 0)') && !bgColor.includes(',0)')) {
            // This is a backdrop overlay
            nukeElement(el);
          }
          // Also check for solid dark backgrounds
          if (bgColor === 'rgb(0, 0, 0)' || bgColor === 'rgba(0, 0, 0, 1)') {
            const opacity = parseFloat(style.opacity);
            if (opacity < 1) {
              nukeElement(el);
            }
          }
        }
      } catch (e) {}
    }

    // Strategy 3: Find elements with suspicious class/id patterns not caught by CSS
    const suspiciousEls = document.querySelectorAll(
      '[class*="overlay"][style*="z-index"],' +
      '[class*="modal"][style*="z-index"],' +
      '[class*="popup"][style*="z-index"],' +
      '[class*="dialog"][style*="z-index"]'
    );
    for (let i = 0; i < suspiciousEls.length; i++) {
      const el = suspiciousEls[i];
      try {
        const style = window.getComputedStyle(el);
        const zIdx = parseInt(style.zIndex, 10) || 0;
        if (zIdx < 1000) continue;
        
        const text = (el.textContent || '').toLowerCase();
        for (let j = 0; j < SCAM_POPUP_TEXTS.length; j++) {
          if (text.includes(SCAM_POPUP_TEXTS[j])) {
            nukeElement(el);
            // Also try to kill the parent if it's a wrapper
            if (el.parentElement && el.parentElement !== document.body) {
              const parentStyle = window.getComputedStyle(el.parentElement);
              if (parentStyle.position === 'fixed' || parentStyle.position === 'absolute') {
                nukeElement(el.parentElement);
              }
            }
            break;
          }
        }
      } catch (e) {}
    }
  }

  // ── Main scan function ──────────────────────────────────────────────
  function scanAndRemoveAds() {
    // 1. Kill ad iframes
    killAdIframes();

    // 2. Kill invisible overlays
    killInvisibleOverlays();

    // 3. Kill fake download/notification popups
    killFakePopups();

    // 4. YouTube-specific
    if (location.hostname.includes('youtube.com')) {
      skipYouTubeVideoAds();
    }
  }

  // ── Main lifecycle ──────────────────────────────────────────────────
  function enable() {
    // Inject CSS
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = cssRule;
      (document.head || document.documentElement).appendChild(styleEl);
    }

    // Run immediate scan
    if (document.body) scanAndRemoveAds();

    // Observe DOM mutations (throttled via rAF)
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

    // YouTube: also poll every 500ms since YT uses SPA navigation
    if (location.hostname.includes('youtube.com') && !ytAdInterval) {
      ytAdInterval = setInterval(skipYouTubeVideoAds, 500);
    }
  }

  function disable() {
    const styleEl = document.getElementById(styleId);
    if (styleEl) styleEl.remove();
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (ytAdInterval) {
      clearInterval(ytAdInterval);
      ytAdInterval = null;
    }
  }

  // ── Init ────────────────────────────────────────────────────────────
  chrome.storage.local.get(['enabled'], (result) => {
    if (result.enabled !== false) enable();
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.enabled) {
      changes.enabled.newValue !== false ? enable() : disable();
    }
  });
})();
