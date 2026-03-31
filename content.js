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
  ];

  const style = document.createElement('style');
  style.textContent = adSelectors.join(',\n') + ' { display: none !important; visibility: hidden !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }';
  document.documentElement.appendChild(style);
})();
