// Updated content.js with queue-specific filter logic

// content.js - v2.0

// Import constants (this works because Chrome extensions can import other scripts in their manifest)
// The actual import will be handled through the manifest.json file

chrome.storage.local.get([
    "enabled", "ntfyEnabled", "ntfyUrl", "discordEnabled", "discordUrl",
    "minInterval", "maxInterval", 
    "minIntervalRFY", "maxIntervalRFY",
    "minIntervalAFA", "maxIntervalAFA",
    "minIntervalAI", "maxIntervalAI",
    "filter", "isRegexFilter", 
    "filterRFY", "isRegexFilterRFY",
    "filterAFA", "isRegexFilterAFA",
    "filterAI", "isRegexFilterAI",
    "knownItems"
  ], data => {
    // Use imported constants
    const DEFAULT_NTFY_URL = VINE_CONSTANTS.DEFAULT_NTFY_URL;
    const DEFAULT_DISCORD_URL = VINE_CONSTANTS.DEFAULT_DISCORD_URL;
    const DEFAULT_MIN_INTERVAL = VINE_CONSTANTS.DEFAULT_MIN_INTERVAL;
    const DEFAULT_MAX_INTERVAL = VINE_CONSTANTS.DEFAULT_MAX_INTERVAL;
    const QUEUE_IDENTIFIERS = VINE_CONSTANTS.QUEUE_IDENTIFIERS;
  
    // Exit if extension is disabled
    if (data.enabled === false) return;
    
    // Detect current queue from URL
    let currentQueue = 'Unknown';
    const urlParams = new URLSearchParams(window.location.search);
    const queueParam = urlParams.get('queue');
    
    if (queueParam && QUEUE_IDENTIFIERS[queueParam]) {
      currentQueue = QUEUE_IDENTIFIERS[queueParam];
    }
    
    console.log(`Current queue detected: ${currentQueue}`);
    
    // Select the appropriate refresh interval based on queue
    let minSec, maxSec;
    
    // Choose queue-specific refresh intervals if available
    if (currentQueue === 'RFY') {
      minSec = Number(data.minIntervalRFY) || Number(data.minInterval) || DEFAULT_MIN_INTERVAL;
      maxSec = Number(data.maxIntervalRFY) || Number(data.maxInterval) || DEFAULT_MAX_INTERVAL;
    } else if (currentQueue === 'AFA') {
      minSec = Number(data.minIntervalAFA) || Number(data.minInterval) || DEFAULT_MIN_INTERVAL;
      maxSec = Number(data.maxIntervalAFA) || Number(data.maxInterval) || DEFAULT_MAX_INTERVAL;
    } else if (currentQueue === 'AI') {
      minSec = Number(data.minIntervalAI) || Number(data.minInterval) || DEFAULT_MIN_INTERVAL;
      maxSec = Number(data.maxIntervalAI) || Number(data.maxInterval) || DEFAULT_MAX_INTERVAL;
    } else {
      // Fallback to main intervals for unknown queues
      minSec = Number(data.minInterval) || DEFAULT_MIN_INTERVAL;
      maxSec = Number(data.maxInterval) || DEFAULT_MAX_INTERVAL;
    }
    
    // Validate intervals
    if (minSec < 1) minSec = 1;
    if (maxSec < minSec) maxSec = minSec;
  
    // Check if at least one webhook is enabled and has a URL
    const hasNtfy = data.ntfyEnabled && (data.ntfyUrl || DEFAULT_NTFY_URL);
    const hasDiscord = data.discordEnabled && (data.discordUrl || DEFAULT_DISCORD_URL);
    
    // If webhook services are enabled, scan for products and send notifications
    if (hasNtfy || hasDiscord) {
      // Get the appropriate filter text based on the current queue
      let filterText = '';
      let isRegexFilter = false;
      
      // Select queue-specific filter if available, otherwise fall back to global filter
      if (currentQueue === 'RFY' && data.filterRFY) {
        filterText = data.filterRFY;
        isRegexFilter = data.isRegexFilterRFY === true;
        console.log('Using RFY-specific filter');
      } else if (currentQueue === 'AFA' && data.filterAFA) {
        filterText = data.filterAFA;
        isRegexFilter = data.isRegexFilterAFA === true;
        console.log('Using AFA-specific filter');
      } else if (currentQueue === 'AI' && data.filterAI) {
        filterText = data.filterAI;
        isRegexFilter = data.isRegexFilterAI === true;
        console.log('Using AI-specific filter');
      } else {
        // Fall back to global filter
        filterText = data.filter || '';
        isRegexFilter = data.isRegexFilter === true;
        console.log('Using global filter (no queue-specific filter found)');
      }
      
      const knownSet = new Set(data.knownItems || []);
      
      // Prepare filter - either regex or simple string search
      let filterMatcher;
      if (isRegexFilter && filterText) {
        try {
          // Create case-insensitive regex
          filterMatcher = new RegExp(filterText, 'i');
          console.log(`Using regex filter: ${filterMatcher}`);
        } catch (e) {
          console.error(`Invalid regex pattern: ${filterText}. Error: ${e.message}`);
          // Fallback to simple string matching if regex is invalid
          filterMatcher = (title) => title.toLowerCase().includes(filterText.toLowerCase());
        }
      } else if (filterText) {
        // Simple case-insensitive string matching for backward compatibility
        const lowerFilter = filterText.toLowerCase();
        filterMatcher = (title) => title.toLowerCase().includes(lowerFilter);
      } else {
        // No filter - match everything
        filterMatcher = () => true;
      }
      
      document.querySelectorAll('#vvp-items-grid .vvp-item-tile').forEach(tile => {
        let title = '';
        let productUrl = '';
        let imageUrl = '';
        
        // Get product title
        const el = tile.querySelector('.a-truncate-full');
        title = el?.textContent.trim() || tile.querySelector('a')?.textContent.trim() || '';
        
        // Get product URL
        const linkElement = tile.querySelector('a[href]');
        if (linkElement) {
          productUrl = linkElement.href;
          if (productUrl && !productUrl.startsWith('http')) {
            productUrl = new URL(productUrl, window.location.origin).href;
          }
        }
        
        // Get product image (optional)
        const imgElement = tile.querySelector('img');
        if (imgElement && imgElement.src) {
          imageUrl = imgElement.src;
        }
        
        if (!title || knownSet.has(title)) return;
        knownSet.add(title);
        
        // Apply filter - now using either regex or simple matching
        const isMatch = typeof filterMatcher === 'function' 
          ? filterMatcher(title)
          : filterMatcher.test(title);
          
        if (filterText && !isMatch) return;
    
        // Prepare product details with queue information
        const productDetails = {
          title,
          url: productUrl,
          image: imageUrl,
          queue: currentQueue
        };
        
        // Send to NTFY if enabled
        if (hasNtfy) {
          chrome.runtime.sendMessage({
            type: 'newItem',
            service: 'ntfy',
            url: data.ntfyUrl || DEFAULT_NTFY_URL, 
            productDetails
          });
        }
        
        // Send to Discord if enabled
        if (hasDiscord) {
          chrome.runtime.sendMessage({
            type: 'newItem',
            service: 'discord',
            url: data.discordUrl || DEFAULT_DISCORD_URL,
            productDetails
          });
        }
        
        console.log('New item:', title, productUrl, 'Queue:', currentQueue);
      });
    
      chrome.storage.local.set({ knownItems: Array.from(knownSet) });
      console.log('Product scanning complete.');
    } else {
      console.log('No webhooks enabled - refresh only mode.');
    }
    
    // Always refresh the page on the configured interval
    const delay = minSec + Math.random() * (maxSec - minSec);
    console.log(`Refreshing in ${delay.toFixed(1)}s (Queue: ${currentQueue})`);
    setTimeout(() => location.reload(), delay * 1000);
  });
