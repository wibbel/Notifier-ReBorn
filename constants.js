
// constants.js - Central location for all extension constants v2.0

const VINE_CONSTANTS = {
  // Webhook URLs
  DEFAULT_NTFY_URL: 'https://ntfy.sh/ADD_YOUR_TOPIC',
  DEFAULT_DISCORD_URL: 'https://discord.com/api/webhooks/YOUR_DISCORD_WEBHOOK',
  
  // Default refresh intervals (in seconds)
  DEFAULT_MIN_INTERVAL: 10,
  DEFAULT_MAX_INTERVAL: 20,
  
  // Queue identifiers and mapping
  QUEUE_IDENTIFIERS: {
    'potluck': 'RFY',    // Recommended For You
    'last_chance': 'AFA', // Available For All
    'encore': 'AI'        // Additional Items
  }
};