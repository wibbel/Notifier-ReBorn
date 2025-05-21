// background.js - v2.0

// Import constants.js using importScripts (since this is a service worker)
importScripts('constants.js');

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type !== 'newItem') return;
  
  const { service, url, productDetails } = msg;
  
  // Determine which service to use and call the appropriate handler
  if (service === 'ntfy') {
    handleNtfyWebhook(url, productDetails);
  } else if (service === 'discord') {
    handleDiscordWebhook(url, productDetails);
  } else {
    // For backward compatibility, detect service from URL
    if (url.includes('ntfy.sh')) {
      handleNtfyWebhook(url, productDetails);
    } else if (url.includes('discord.com/api/webhooks')) {
      handleDiscordWebhook(url, productDetails);
    } else {
      console.log('Unknown webhook service');
    }
  }
});

function handleNtfyWebhook(url, productDetails) {
  if (!productDetails) {
    console.error('Missing product details for NTFY webhook');
    return;
  }
  
  const { title, url: productUrl, image, queue } = productDetails;
  
  // Ensure URLs have proper protocol prefixes
  const formattedProductUrl = ensureHttpsPrefix(productUrl);
  const formattedImageUrl = image ? ensureHttpsPrefix(image) : undefined;
  
  // Create message body with queue information ABOVE the title
  const messageBody = queue ? `Queue: ${queue}\n${title}` : title;
  
  // Setup fetch options with headers approach for NTFY
  const opts = {
    method: 'POST',
    headers: {
      'Title': 'New Amazon Vine Product!',
      'Priority': '4',
      'Tags': 'vine,amazon',
      'Content-Type': 'text/plain'
    },
    body: messageBody  // The queue now appears above the title
  };
  
  // Add Click URL if available
  if (formattedProductUrl) {
    opts.headers['Click'] = formattedProductUrl;
  }
  
  // Add image attachment if available
  if (formattedImageUrl) {
    opts.headers['Attach'] = formattedImageUrl;
  }
  
  fetch(url, opts)
    .then(res => console.log('NTFY Webhook Status:', res.status))
    .catch(err => console.error('NTFY Webhook error:', err));
}

function handleDiscordWebhook(url, productDetails) {
  if (!productDetails) {
    console.error('Missing product details for Discord webhook');
    return;
  }
  
  const { title, url: productUrl, image, queue } = productDetails;
  
  // Queue color mapping - different colors for different queues
  const queueColors = {
    'RFY': 15105570,  // Yellow
    'AFA': 15548997,  // Red
    'AI': 5814783,    // Amazon orange (same as default)
    'Unknown': 5814783 // Default Amazon orange
  };
  
  // Select color based on queue, default to Amazon orange if queue not recognized
  const embedColor = queue && queueColors[queue] ? queueColors[queue] : 5814783;
  
  // Format queue with Markdown for Discord - make it bold and add emoji based on queue
  let queueEmoji = "📦"; // Default package emoji
  if (queue === "RFY") queueEmoji = "👑"; // Crown for Recommended For You
  if (queue === "AFA") queueEmoji = "🌟"; // Star for Available For All
  if (queue === "AI") queueEmoji = "➕";   // Plus for Additional Items
  
  // Build the formatted queue text that will appear in content - with emoji
  const formattedQueueText = queue ? `${queueEmoji} **Queue: ${queue}**` : "";
  
  // Build description - removed duplicate queue mention
  const description = "A new product is available on Amazon Vine!";
  
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Include queue info in main content but with formatting
      content: queue ? `${formattedQueueText}\n\n${title}` : title,
      embeds: [{
        title: title,
        url: productUrl,
        color: embedColor, // Color now varies based on queue
        description: description, // No duplicate queue mention
        thumbnail: image ? { url: image } : undefined,
        footer: {
          text: "Amazon Vine Notifier"
        },
        timestamp: new Date().toISOString()
      }]
    })
  };
  
  fetch(url, opts)
    .then(res => console.log('Discord Webhook Status:', res.status))
    .catch(err => console.error('Discord Webhook error:', err));
}

// Helper function to ensure URLs have https:// prefix
function ensureHttpsPrefix(url) {
  if (!url) return url;
  
  // Check if the URL already has a protocol prefix
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// prefix
  return 'https://' + url;
}
