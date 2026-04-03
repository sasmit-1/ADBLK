// CleanView Anti-Redirect Engine — MAIN WORLD injection
// This script runs in the page's JS context so overrides actually work.
// Unlike content scripts (isolated world), this can intercept the page's
// own calls to window.open(), location changes, and click hijacks.
(function () {
  'use strict';

  // ── Current page's own domain (for same-site checks) ────────────────
  const OWN_HOSTNAME = location.hostname.toLowerCase();

  // Extract the registrable domain (e.g. "www.natomanga.com" → "natomanga.com")
  function getBaseDomain(hostname) {
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    return parts.slice(-2).join('.');
  }
  const OWN_BASE = getBaseDomain(OWN_HOSTNAME);

  // Domains that should always be allowed to open (legitimate services)
  const ALLOWLISTED_DOMAINS = new Set([
    'google.com', 'youtube.com', 'github.com', 'twitter.com', 'x.com',
    'facebook.com', 'instagram.com', 'reddit.com', 'wikipedia.org',
    'discord.com', 'discord.gg', 'twitch.tv', 'linkedin.com',
    'apple.com', 'microsoft.com', 'mozilla.org', 'paypal.com',
    'stripe.com', 'cloudflare.com', 'stackoverflow.com',
    OWN_BASE // always allow same-site
  ]);

  // ── Known malicious / scam / gambling / NSFW redirect domains ────────
  const BLOCKED_DOMAINS = [
    // Gambling & betting
    'stake.com', 'stake.us', 'roobet.com', 'gamdom.com', 'rollbit.com',
    'duelbits.com', 'bc.game', '1xbet.com', 'betwinner.com', '1win.com',
    'mostbet.com', 'melbet.com', 'pin-up.com', 'linebet.com', '22bet.com',
    'betway.com', 'parimatch.com', 'megapari.com', 'fairspin.io',
    '1xslots.com', 'vulkanvegas.com', 'bitstarz.com', 'mbitcasino.com',
    'cloudbet.com', 'thunderpick.io', 'metaspins.com', 'sportsbet.io',

    // Ad networks / popunder services
    'crazygames.com', 'clickadu.com', 'propellerads.com', 'hilltopads.net',
    'monetag.com', 'adsterra.com', 'juicyads.com', 'exoclick.com',
    'trafficjunky.net', 'popads.net', 'popcash.net', 'trafficstars.com',
    'adcash.com', 'admaven.com', 'ad-maven.com', 'galaksion.com',
    'onclicka.com', 'onclickads.net', 'clickaine.com', 'richads.com',
    'a-ads.com', 'popmyads.com', 'revenuehits.com', 'revcontent.com',
    'adspyglass.com', 'bidvertiser.com', 'adskeeper.com', 'adskeeper.co.uk',
    'adtelligent.com', 'betteradsplayer.com', 'noqreport.com',
    'tsyndicate.com', 'marphezis.com', 'go.oclasrv.com',
    'syndication.realsrv.com', 'adf.ly', 'shorte.st', 'sh.st',

    // Scam / phishing / NSFW redirect hubs
    'trfrm.com', 'adrunnr.com', 'adserverplus.com', 'offerimage.com',
    'bannersbroker.com', 'track.wg-aff.com', 'blfrm.com',
    'go.nordlocker.com', 'hyperlinksecure.com', 'shrinkme.io',
    'ouo.io', 'ouo.press', 'za.gl', 'adfoc.us', 'bc.vc',
    'r.srvtrck.com', 'dynamicadx.com', 'clkmon.com', 'vfrm.net',
    'contentabc.com', 'plugrush.com', 'trafficforce.com',
    'pornvertising.com', 'adsrt.com', 'acint.net', 'wifestest.com',
    'awempire.com', 'livejasmin.com', 'chaturbate.com', 'stripchat.com',
    'cam4.com', 'bongacams.com', 'camsoda.com', 'xhamsterlive.com',
    
    // Redirect / cloaking intermediaries
    'dfrm.site', 'newstrk.com', 'pushwhy.com', 'ppom.me',
    'ntv.io', 'mypushz.com', 'push-news.org', 'yekuzab.com',
    'realsrv.com', 'whos.amung.us', 'cpasmarter.com',
  ];

  const blockedSet = new Set(BLOCKED_DOMAINS);

  /**
   * Check if a URL points to an explicitly blocked domain.
   */
  function isBlockedURL(urlStr) {
    if (!urlStr) return false;
    try {
      let normalized = String(urlStr).trim();
      if (normalized.startsWith('//')) normalized = 'https:' + normalized;
      if (!normalized.startsWith('http')) return false;

      const hostname = new URL(normalized).hostname.toLowerCase();
      if (blockedSet.has(hostname)) return true;
      const parts = hostname.split('.');
      for (let i = 1; i < parts.length - 1; i++) {
        if (blockedSet.has(parts.slice(i).join('.'))) return true;
      }
    } catch (e) { /* invalid URL */ }
    return false;
  }

  /**
   * Check if a URL is to a different site than the current page.
   * Used to detect popunder behavior (opening unrelated sites on click).
   */
  function isCrossSiteURL(urlStr) {
    if (!urlStr) return false;
    try {
      let normalized = String(urlStr).trim();
      if (normalized.startsWith('//')) normalized = 'https:' + normalized;
      if (!normalized.startsWith('http')) return false;

      const targetHost = new URL(normalized).hostname.toLowerCase();
      const targetBase = getBaseDomain(targetHost);
      
      // Same site → not cross-site
      if (targetBase === OWN_BASE) return false;
      
      // Allowlisted sites → not suspicious
      if (ALLOWLISTED_DOMAINS.has(targetBase)) return false;
      
      return true;
    } catch (e) { /* invalid URL */ }
    return false;
  }

  // ── Popunder detection state ─────────────────────────────────────────
  // Track whether we're in a user-initiated click. Popunder scripts call
  // window.open() INSIDE a click handler to get past Chrome's popup blocker.
  // If window.open is called during a click and targets a different domain,
  // it's almost certainly a popunder.
  let isInClickHandler = false;
  let lastClickTarget = null;

  // ── 1. Override window.open() ────────────────────────────────────────
  const _origOpen = window.open;
  window.open = function (url, target, features) {
    // Always block explicitly blacklisted domains
    if (isBlockedURL(url)) {
      return null;
    }

    // POPUNDER DETECTION: If window.open() is called during a click event
    // and the URL goes to a completely different site, it's a popunder.
    // This catches affiliate popunders (e.g. amazon.in affiliate links on 
    // manga sites) without needing to block every possible domain.
    if (isInClickHandler && url) {
      if (isCrossSiteURL(url)) {
        // Check: did the user actually click on a link TO this URL?
        // If yes, it's intentional. If no, it's a popunder.
        let intentional = false;
        if (lastClickTarget) {
          let el = lastClickTarget;
          for (let depth = 0; el && depth < 10; depth++) {
            if (el.tagName === 'A' && el.href) {
              try {
                const linkBase = getBaseDomain(new URL(el.href).hostname.toLowerCase());
                const openBase = getBaseDomain(new URL(String(url)).hostname.toLowerCase());
                if (linkBase === openBase) {
                  intentional = true;
                  break;
                }
              } catch (e) { /* ignore */ }
            }
            el = el.parentElement;
          }
        }
        if (!intentional) {
          return null; // Block the popunder
        }
      }
    }

    return _origOpen.call(window, url, target, features);
  };

  // Prevent detection of override
  try {
    Object.defineProperty(window.open, 'toString', {
      value: function () { return 'function open() { [native code] }'; },
      configurable: true
    });
  } catch (e) {}

  // ── 2. Protect location from malicious assignments ───────────────────
  const _origAssign = Location.prototype.assign;
  const _origReplace = Location.prototype.replace;

  Location.prototype.assign = function (url) {
    if (isBlockedURL(url)) return;
    return _origAssign.call(this, url);
  };

  Location.prototype.replace = function (url) {
    if (isBlockedURL(url)) return;
    return _origReplace.call(this, url);
  };

  // ── 3. Neutralize beforeunload/unload abuse ──────────────────────────
  window.addEventListener('beforeunload', function (e) {
    e.stopImmediatePropagation();
  }, true);

  let _beforeunload = null;
  Object.defineProperty(window, 'onbeforeunload', {
    get() { return _beforeunload; },
    set() { _beforeunload = null; },
    configurable: true
  });

  // ── Save original timer functions BEFORE click handlers use them ─────
  const _origSetTimeout = window.setTimeout;
  const _origSetInterval = window.setInterval;

  // ── 4. Click hijack interception ─────────────────────────────────────
  // We listen in the CAPTURE phase to run before the page's own handlers.
  // Two purposes: (a) block clicks on hidden overlays / blocked links,
  // and (b) set the isInClickHandler flag so window.open() knows a click 
  // is happening.
  document.addEventListener('click', function (e) {
    const target = e.target;
    
    // Set flag for popunder detection in window.open override
    isInClickHandler = true;
    lastClickTarget = target;
    // Clear flag after the event finishes propagating
    _origSetTimeout.call(window, function () {
      isInClickHandler = false;
      lastClickTarget = null;
    }, 0);

    // Block clicks on links to blocked domains
    let el = target;
    for (let depth = 0; el && depth < 10; depth++) {
      if (el.tagName === 'A' && el.href && isBlockedURL(el.href)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      el = el.parentElement;
    }

    // Detect transparent overlay clicks
    if (target && target.nodeType === 1) {
      const tagName = target.tagName;
      if (tagName !== 'A' && tagName !== 'BUTTON' &&
          tagName !== 'INPUT' && tagName !== 'SELECT' &&
          tagName !== 'TEXTAREA' && tagName !== 'VIDEO') {
        try {
          const style = window.getComputedStyle(target);
          const opacity = parseFloat(style.opacity);
          const zIndex = parseInt(style.zIndex, 10) || 0;

          if (opacity < 0.1 && zIndex > 100 && style.position !== 'static') {
            const rect = target.getBoundingClientRect();
            if (rect.width > window.innerWidth * 0.5 && rect.height > window.innerHeight * 0.5) {
              e.preventDefault();
              e.stopImmediatePropagation();
              target.style.setProperty('display', 'none', 'important');
              target.style.setProperty('pointer-events', 'none', 'important');
              return;
            }
          }
        } catch (ex) { /* getComputedStyle can fail on some nodes */ }
      }
    }
  }, true);

  // ── 5. Block mousedown-based redirect triggers ───────────────────────
  document.addEventListener('mousedown', function (e) {
    // Also set click flag for mousedown-triggered popunders
    isInClickHandler = true;
    lastClickTarget = e.target;
    _origSetTimeout.call(window, function () {
      isInClickHandler = false;
      lastClickTarget = null;
    }, 0);

    let el = e.target;
    for (let depth = 0; el && depth < 10; depth++) {
      if (el.tagName === 'A' && el.href && isBlockedURL(el.href)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      el = el.parentElement;
    }
  }, true);

  // ── 6. Prevent setTimeout/setInterval redirect chains ────────────────

  window.setTimeout = function (fn, delay, ...args) {
    if (typeof fn === 'string') {
      const lower = fn.toLowerCase();
      for (const domain of BLOCKED_DOMAINS) {
        if (lower.includes(domain)) return 0;
      }
    }
    return _origSetTimeout.call(window, fn, delay, ...args);
  };

  window.setInterval = function (fn, delay, ...args) {
    if (typeof fn === 'string') {
      const lower = fn.toLowerCase();
      for (const domain of BLOCKED_DOMAINS) {
        if (lower.includes(domain)) return 0;
      }
    }
    return _origSetInterval.call(window, fn, delay, ...args);
  };

  // ── 7. Block dynamic script/iframe injection from ad networks ────────
  // IMPORTANT: check nodeType === 1 (ELEMENT_NODE) before accessing tagName,
  // because text nodes, comments, and document fragments don't have tagName.
  const _origAppendChild = Element.prototype.appendChild;
  const _origInsertBefore = Element.prototype.insertBefore;

  Element.prototype.appendChild = function (child) {
    // Only check element nodes — text nodes, comments, etc. pass through
    if (child && child.nodeType === 1) {
      const tag = child.tagName;
      if (tag === 'SCRIPT' && child.src && isBlockedURL(child.src)) {
        return child;
      }
      if (tag === 'IFRAME' && child.src && isBlockedURL(child.src)) {
        return child;
      }
    }
    return _origAppendChild.call(this, child);
  };

  Element.prototype.insertBefore = function (newNode, refNode) {
    if (newNode && newNode.nodeType === 1) {
      const tag = newNode.tagName;
      if (tag === 'SCRIPT' && newNode.src && isBlockedURL(newNode.src)) {
        return newNode;
      }
      if (tag === 'IFRAME' && newNode.src && isBlockedURL(newNode.src)) {
        return newNode;
      }
    }
    return _origInsertBefore.call(this, newNode, refNode);
  };

  // ── 8. Remove existing invisible overlay anchors ─────────────────────
  // Run once DOM is ready to nuke any pre-existing invisible clickjack overlays
  function removeOverlayAnchors() {
    // Find full-screen or near-full-screen invisible anchors
    const anchors = document.querySelectorAll('a[target="_blank"]');
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i];
      try {
        const style = window.getComputedStyle(a);
        const rect = a.getBoundingClientRect();
        const opacity = parseFloat(style.opacity);
        
        // Large, invisible/transparent anchor = clickjack overlay
        if (rect.width > window.innerWidth * 0.5 && 
            rect.height > window.innerHeight * 0.3 &&
            (opacity < 0.1 || style.zIndex > 999)) {
          a.style.setProperty('display', 'none', 'important');
          a.style.setProperty('pointer-events', 'none', 'important');
          a.removeAttribute('href');
        }
      } catch (ex) { /* ignore */ }
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeOverlayAnchors);
  } else {
    _origSetTimeout.call(window, removeOverlayAnchors, 100);
  }
  // Also run again after a delay to catch late-injected overlays
  _origSetTimeout.call(window, removeOverlayAnchors, 2000);
  _origSetTimeout.call(window, removeOverlayAnchors, 5000);

  // Prevent fingerprinting of overrides
  const overriddenFns = [
    window.open, window.setTimeout, window.setInterval,
    Element.prototype.appendChild, Element.prototype.insertBefore,
    Location.prototype.assign, Location.prototype.replace
  ];
  for (const fn of overriddenFns) {
    try {
      Object.defineProperty(fn, 'toString', {
        value: function () { return 'function ' + (fn.name || '') + '() { [native code] }'; },
        writable: false, configurable: true
      });
    } catch (e) { /* some can't be redefined */ }
  }
})();
