# CleanView Ad Blocker

A lightweight, privacy-focused browser extension that blocks ads and trackers.

---

## 📦 What's Included

- **Exclusive Manga/Anime site protection** — Blocks shady networks like ExoClick, PropellerAds, PopAds, etc.
- **250+ blocking rules** — 100+ ad networks + 50 tracker domains
- **3-Layer Ad Killing** — CSS cosmetic filtering, active DOM scanning for "Sponsored Ads," and iframe src sniffing
- **YouTube Ad Annihilator** — Insta-clicks skip buttons and massively fast-forwards unskippable ads
- **Clickjack & Popunder Killer** — Detects invisible full-screen overlays that hijack clicks to open gambling/scam sites and neutralizes them
- **Toggle on/off** — pause protection without removing the extension
- **Counter** — tracks total requests blocked
- **Clean popup UI** — see your protection status at a glance

---

## 🚀 How to Install (Chrome / Edge / Brave)

1. Unzip this folder somewhere on your computer
2. Open your browser and go to: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
3. Turn on **Developer Mode** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Select the `ad-blocker-extension` folder
6. Done! The CleanView icon will appear in your toolbar.

> **Note:** Chrome may show a warning about developer mode extensions on startup. This is normal for extensions not installed from the Web Store — just click "Keep" or dismiss it.

---

## 🦊 How to Install (Firefox)

1. Open Firefox and go to: `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on..."**
3. Navigate to the extension folder and select the `manifest.json` file
4. Done!

> Note: Firefox temporary add-ons are removed when you close the browser. To install permanently, you'll need to submit to addons.mozilla.org (free).

---

## 🔧 How to Add More Blocked Domains

Open `rules/ads.json` or `rules/trackers.json` and add a new entry:

```json
{
  "id": 999,
  "priority": 1,
  "action": { "type": "block" },
  "condition": {
    "urlFilter": "||example-ad-network.com^",
    "resourceTypes": ["script", "image", "xmlhttprequest"]
  }
}
```

Make sure each rule has a **unique `id`** number, then reload the extension.

---

## 💡 Tips

- The counter in the popup shows total requests blocked across all sessions
- You can pause protection by toggling the switch in the popup
- The extension blocks network requests *before* they load — faster than hiding elements after page load

---

## 📋 Blocked Categories

| Category | Examples |
|---|---|
| Ad Networks | Google Ads, DoubleClick, AppNexus, Taboola, Outbrain, Criteo |
| Pirate Site Ads | ExoClick, PropellerAds, PopAds, Monetag, HilltopAds, AdMaven |
| Gambling Redirects | Stake, Roobet, 1xBet, BetWinner, Gamdom, Rollbit, DuelBits |
| Social Ads | Facebook Pixel, Twitter Ads, LinkedIn Ads, TikTok Pixel |
| Analytics | Google Analytics, Hotjar, Mixpanel, FullStory, Segment |
| Retargeting | AdRoll, Criteo, Bing Ads |
