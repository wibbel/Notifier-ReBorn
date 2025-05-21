# Amazon Vine Auto-Refresh Notifier ReBorn v2.0

**Automatic page refresh & webhook alerts for Amazon Vine products**

This Chrome extension reloads the Amazon Vine page at random intervals and sends notifications to either Discord and/or NTFY 
whenever new products appear. 

## V2.0 New Behavior:

* Main Extension Enabled, No Webhooks Enabled:
- The page will still refresh according to the time settings.
- No product scanning or notifications will be sent.
- Console will log "No webhooks enabled - refresh only mode"
- Each queue can have independent refresh rates.
- New products will not be remembered as 'seen'.


* Main Extension Enabled, At Least One Webhook Enabled:
- The page will refresh according to the time settings.
- Products will be scanned and notifications sent through enabled webhooks.
- Console will log "Product scanning complete" after processing.
- Only products matching the filters (when active) will be notified,
- New products will be marked as 'seen' even when not notified.


* Main Extension Disabled:
- No refreshing, no product scanning (exits immediately)

* Filtering:
- Filter products to report. Title contains filter string to match.
- Optionally use regex strings. Real-trime regex validation on entry.
- New products are marked 'seen' even if not matching filter.
- Global filter affects all queues if set.
- Individual queue filter supersedes global filter if set.

## Features

* 🔄 **Auto Refresh**: Random interval between configured minimum and maximum (in seconds). Independent queue rates possible.
* 📋 **Product Detection**: New items are detected on the page; duplicates are avoided via local storage.
* ☑️ **Enable/Disable**: Toggle refresh monitoring on/off in the popup.
* 🔍 **Filter**: Optional regex or keyword filter to report only matching product names. Global or queue specific.
* 🌐 **Webhook Support**: Send NTFY and/or Discord notifications individually enabled or disabled.



## Installation

1. Clone the repo or download ZIP:

   ```bash
   git clone https://github.com/your-user/vine-notifier.git
   ```
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extension folder.
5. The Vine Notifier icon appears in the toolbar.



## Configuration

1. Click the Vine Notifier toolbar icon.
2. In the popup, set:

   * **Enabled**: Turn monitoring / refreshing on or off.
   * **NTFY Enabled**: Turn sending NTFY WebHook on or off.
   * **NTFY URL**: Add your NTFY URL (or use the default)
   * **Discord Enabled**: Turn sending Discord WebHook on or off.
   * **Discord URL**: Add your Discord URL (or use the default)
   * **Default Min/Max Interval**: Seconds between reloads.
   * **Queue Specific Min/Max Interval**: Seconds between reloads. Queue specific and replaces default.
   * **Global Filter**: Optional regex or keyword to match product names. Checkbox to enable regex.
   * **Queue Specific Filters**: Optional regex or keyword to match product names. Queue specific. Checkbox to enable regex.

3. Click **Save**. 	Invalid Regex will prevent saving and show error message.

## Default values

Default values for Urls and other settings is in `constants.js`. You should enter your own URL values for NTFY and Discord.

```
  // Webhook URLs
  DEFAULT_NTFY_URL: 'https://ntfy.sh/ADD_YOUR_TOPIC',
  DEFAULT_DISCORD_URL: 'https://discord.com/api/webhooks/YOUR_DISCORD_WEBHOOK',
  
  // Default refresh intervals (in seconds)
  DEFAULT_MIN_INTERVAL: 10,
  DEFAULT_MAX_INTERVAL: 20,
  
  // Queue identifiers and mapping
  QUEUE_IDENTIFIERS: {
    'potluck': 'RFY',     // Recommended For You
    'last_chance': 'AFA', // Available For All
    'encore': 'AI'        // Additional Items
  }
```

## How It Works

* **Content Script** (`content.js`) loads settings from `chrome.storage.local`.
* It scans `#vvp-items-grid .vvp-item-tile` for new product titles not yet seen.
* New items trigger a message to the **Background** script.
* **Background Script** (`background.js`) sends a request to the webhooks when enabled.
* The page is reloaded after a random delay within the interval range.

- Added real-time regex validation as the user types
- Added visual feedback (green/red border) when regex is valid/invalid
- Added validation before saving settings to prevent invalid regex
- Updated the storage operations to include the new isRegexFilter setting


* More Powerful Filtering: Users can now use regex patterns like:

```
Camera|Headphone - Match products containing either "Camera" OR "Headphone"
^(Camera|Phone) - Match products that start with "Camera" or "Phone"
\d{3,} - Match products containing 3 or more consecutive digits
\bHome\b - Match products containing the exact word "Home" (not "Homeware")
```

* Case Insensitivity: All filtering is now case-insensitive by default

In regex mode, this is handled with the 'i' flag
In simple string mode, this is handled with .toLowerCase() comparisons


* Backward Compatibility: Users who don't want to use regex can still use simple filters
* Error Handling: If a user enters an invalid regex pattern:

- The UI provides immediate feedback
-  The settings won't save until fixed
- If somehow an invalid pattern gets through, the code gracefully falls back to string matching


## File Structure

```
├── manifest.json        # Chrome Manifest V3
├── constants.js         # User defined defaults such as default url values etc
├── content.js           # Scans Amazon Vine & sends messages
├── background.js        # Executes webhook requests
├── popup.html           # Settings UIr
└── popup.js             # Popup logic & i18n loader
```


## License

Based on Vine Notifier
This project is licensed under **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

* **Attribution**: You must give appropriate credit.
* **NonCommercial**: You may not use the material for commercial purposes.
* **No additional restrictions**: You may not apply legal or technological measures that legally restrict others from doing anything the license permits.

For details: [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)
