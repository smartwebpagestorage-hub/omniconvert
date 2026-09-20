/**
 * OmniConvert Studio - Ads & Monetization Configuration
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 * 
 * Instructions:
 * 1. When you get approved by Google AdSense, set `adsenseClientId` (e.g. 'ca-pub-1234567890123456').
 * 2. If using Adsterra, paste your banner scripts into the slots below.
 * 3. `enableDownloadTimer` controls the 3-second monetization interstitial before files download.
 */

const ADS_CONFIG = {
  // Master toggle: Set to true to show ads on web, false to hide
  enabled: true,

  // Only show ads when accessed via HTTP/HTTPS (online web hosting), hide in local desktop file:/// mode
  onlineOnly: true,

  // Download Timer Modal settings (Highest CTR / Earning opportunity)
  downloadTimer: {
    enabled: true,
    seconds: 3, // 3 seconds countdown
    autoDownload: true, // Automatically start download after countdown ends
    allowSkip: true // Allow user to click 'Download Now' immediately
  },

  // Google AdSense Configuration
  adsense: {
    enabled: true, // Google AdSense active
    clientId: "ca-pub-4356289331524516", // Official AdSense Publisher ID
    slots: {
      topBanner: "1234567890",
      sidebar: "2345678901",
      downloadModal: "3456789012",
      bottomSticky: "4567890123"
    }
  },

  // Adsterra / Direct Monetization Configuration (Works instantly without approval)
  adsterra: {
    enabled: false, // Set to true if you want to use Adsterra banner scripts
    bannerHtml: `<!-- Adsterra Ad Code Goes Here -->`
  }
};

// Initialize Ads Controller
(function() {
  function isOnlineHost() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
  }

  function shouldShowAds() {
    if (!ADS_CONFIG.enabled) return false;
    if (ADS_CONFIG.onlineOnly && !isOnlineHost()) return false;
    return true;
  }

  // Load Google AdSense Script if enabled and not already loaded in head
  if (shouldShowAds() && ADS_CONFIG.adsense.enabled && ADS_CONFIG.adsense.clientId.startsWith('ca-pub-')) {
    if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.adsense.clientId}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }

  window.ADS_CONFIG = ADS_CONFIG;
  window.shouldShowAds = shouldShowAds;
})();
