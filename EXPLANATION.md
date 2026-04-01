# AdBlck Architecture & Feature Breakdown

This document breaks down how the AdBlck extension technically operates under the hood to provide network blocking, cosmetic hiding, and specialized YouTube ad skipping on Manifest V3.

---

## 1. The YouTube Ad Annihilator (`content.js`)
YouTube has continuously cracked down on traditional ad blockers by injecting ads directly into the main video stream. AdBlck handles this with a specialized active-skipping mechanism, built right into `content.js`, which runs natively on YouTube pages.

### Auto-Clicking the "Skip" button
Not every video ad can be skipped immediately, but when the standard "Skip Ad" button appears on the screen, the extension detects it and automatically executes a `.click()` event on the button DOM element (`.ytp-ad-skip-button`). This happens the exact millisecond the button is rendered, removing the need for manual interaction.

### The 16x Fast-Forward (For Unskippable Ads)
Some ads cannot be skipped with a button. Instead of blocking the network request (which YouTube now heavily penalizes by blocking the video player entirely), AdBlck uses a more aggressive but "compliant" approach:

1. It identifies the hidden ``<video>`` element that is playing the advertisement (`.html5-main-video` while an overlay is active).
2. It manipulates the video player API directly:
   ```javascript
   adVideo.playbackRate = 16.0; // The max speed allowed by HTML5 Video
   adVideo.currentTime = adVideo.duration - 0.1; // Jump to the very end
   ```
3. A 15-second unskippable ad finishes playing in roughly ~0.5 seconds, making it feel like a tiny glitch rather than a full ad.

## 2. Network-Level Blocking (`background.js` & `rules/*.json`)
Traditional ad blockers intercept every single network request made by your browser and evaluate it via a background script. However, Chrome's **Manifest V3** removes this capability.

Instead, AdBlck uses Chrome's new native built-in API called `DeclarativeNetRequest`. 

### How it works:
1. AdBlck packages two large definition files: `ads.json` and `trackers.json`.
2. These files contain thousands of "Rules" defining what URLs belong to ad networks (like `googleads.g.doubleclick.net`).
3. When the extension is installed, it hands this static list over to the Chrome browser engine itself.
4. When you visit a website, Chrome's internal engine checks network traffic against the list and silently drops the connections. **This is significantly faster** than older ad blockers because the matching happens natively in C++ inside Chrome, not in the extension's JavaScript wrapper.

## 3. Cosmetic Filtering (`content.js`)
Network blocking prevents the ad image or script from loading, but the website's HTML might still reserve a large blank white space where the ad was supposed to go.

To fix this, AdBlck uses **Cosmetic Filtering**:
1. It maintains a large list of hundreds of common HTML class names and IDs associated with ads (e.g., `[id^="taboola-"]`, `[class*="ad-container"]`).
2. When you load a page, `content.js` dynamically creates a custom CSS stylesheet and injects it into the page.
3. This custom stylesheet applies the rules:
   ```css
   { display: none !important; visibility: hidden !important; height: 0 !important; }
   ```
4. This ensures that any remaining empty banners, sponsored labels, or Outbrain related-content widgets are instantly collapsed and removed from the layout, leaving a clean webpage.
