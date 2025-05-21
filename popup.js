// popup.js - v2.0 - Updated with regex filter support

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const statusMsg = document.getElementById('statusMsg');
  
  // Global and queue-specific filter inputs
  const filterInput = document.getElementById('filter');
  const filterRFYInput = document.getElementById('filterRFY');
  const filterAFAInput = document.getElementById('filterAFA');
  const filterAIInput = document.getElementById('filterAI');
  
  // Global and queue-specific regex checkboxes
  const regexCheckbox = document.getElementById('isRegexFilter');
  const regexRFYCheckbox = document.getElementById('isRegexFilterRFY');
  const regexAFACheckbox = document.getElementById('isRegexFilterAFA');
  const regexAICheckbox = document.getElementById('isRegexFilterAI');
  
  // Use imported constants
  const DEFAULT_NTFY_URL = VINE_CONSTANTS.DEFAULT_NTFY_URL;
  const DEFAULT_DISCORD_URL = VINE_CONSTANTS.DEFAULT_DISCORD_URL;
  const DEFAULT_MIN_INTERVAL = VINE_CONSTANTS.DEFAULT_MIN_INTERVAL;
  const DEFAULT_MAX_INTERVAL = VINE_CONSTANTS.DEFAULT_MAX_INTERVAL;
  
  // Helper function to show status message
  function showStatus(message, isError = false) {
    statusMsg.textContent = message;
    statusMsg.style.color = isError ? '#d32f2f' : '#4caf50';
    setTimeout(() => { statusMsg.textContent = ''; }, 2000);
  }

  // Load saved settings
  chrome.storage.local.get([
    'enabled', 'ntfyEnabled', 'ntfyUrl', 'discordEnabled', 'discordUrl',
    'minInterval', 'maxInterval', 
    'minIntervalRFY', 'maxIntervalRFY',
    'minIntervalAFA', 'maxIntervalAFA',
    'minIntervalAI', 'maxIntervalAI',
    'filter', 'isRegexFilter',
    'filterRFY', 'isRegexFilterRFY',
    'filterAFA', 'isRegexFilterAFA',
    'filterAI', 'isRegexFilterAI'
  ], data => {
    // Master switch
    document.getElementById('enabledSwitch').checked = data.enabled !== false;
    
    // NTFY settings
    document.getElementById('ntfyEnabled').checked = data.ntfyEnabled === true;
    document.getElementById('ntfyUrl').value = data.ntfyUrl || DEFAULT_NTFY_URL;
    
    // Discord settings
    document.getElementById('discordEnabled').checked = data.discordEnabled === true;
    document.getElementById('discordUrl').value = data.discordUrl || DEFAULT_DISCORD_URL;
    
    // Default refresh time settings
    document.getElementById('minInterval').value = data.minInterval || DEFAULT_MIN_INTERVAL;
    document.getElementById('maxInterval').value = data.maxInterval || DEFAULT_MAX_INTERVAL;
    
    // Queue-specific refresh settings
    // RFY queue
    if (data.minIntervalRFY !== undefined) document.getElementById('minIntervalRFY').value = data.minIntervalRFY;
    if (data.maxIntervalRFY !== undefined) document.getElementById('maxIntervalRFY').value = data.maxIntervalRFY;
    
    // AFA queue
    if (data.minIntervalAFA !== undefined) document.getElementById('minIntervalAFA').value = data.minIntervalAFA;
    if (data.maxIntervalAFA !== undefined) document.getElementById('maxIntervalAFA').value = data.maxIntervalAFA;
    
    // AI queue
    if (data.minIntervalAI !== undefined) document.getElementById('minIntervalAI').value = data.minIntervalAI;
    if (data.maxIntervalAI !== undefined) document.getElementById('maxIntervalAI').value = data.maxIntervalAI;
    
    // Global filter settings
    document.getElementById('filter').value = data.filter || '';
    document.getElementById('isRegexFilter').checked = data.isRegexFilter === true;
    
    // Queue-specific filter settings
    document.getElementById('filterRFY').value = data.filterRFY || '';
    document.getElementById('isRegexFilterRFY').checked = data.isRegexFilterRFY === true;
    
    document.getElementById('filterAFA').value = data.filterAFA || '';
    document.getElementById('isRegexFilterAFA').checked = data.isRegexFilterAFA === true;
    
    document.getElementById('filterAI').value = data.filterAI || '';
    document.getElementById('isRegexFilterAI').checked = data.isRegexFilterAI === true;
  });

  // Helper function to validate regex pattern
  function validateRegexInput(input, checkbox) {
    if (!checkbox.checked || !input.value) {
      input.style.borderColor = '';
      return true;
    }
    
    try {
      new RegExp(input.value);
      input.style.borderColor = '#4caf50';
      return true;
    } catch (e) {
      input.style.borderColor = '#d32f2f';
      return false;
    }
  }
  
  // Add event listeners for real-time regex validation
  // Global filter
  filterInput.addEventListener('input', () => validateRegexInput(filterInput, regexCheckbox));
  regexCheckbox.addEventListener('change', () => validateRegexInput(filterInput, regexCheckbox));
  
  // RFY filter
  filterRFYInput.addEventListener('input', () => validateRegexInput(filterRFYInput, regexRFYCheckbox));
  regexRFYCheckbox.addEventListener('change', () => validateRegexInput(filterRFYInput, regexRFYCheckbox));
  
  // AFA filter
  filterAFAInput.addEventListener('input', () => validateRegexInput(filterAFAInput, regexAFACheckbox));
  regexAFACheckbox.addEventListener('change', () => validateRegexInput(filterAFAInput, regexAFACheckbox));
  
  // AI filter
  filterAIInput.addEventListener('input', () => validateRegexInput(filterAIInput, regexAICheckbox));
  regexAICheckbox.addEventListener('change', () => validateRegexInput(filterAIInput, regexAICheckbox));

  // Save settings handler
  form.addEventListener('submit', e => {
    e.preventDefault();
    
    // Get values from form
    const isEnabled = document.getElementById('enabledSwitch').checked;
    const ntfyEnabled = document.getElementById('ntfyEnabled').checked;
    const ntfyUrl = document.getElementById('ntfyUrl').value.trim() || DEFAULT_NTFY_URL;
    const discordEnabled = document.getElementById('discordEnabled').checked;
    const discordUrl = document.getElementById('discordUrl').value.trim() || DEFAULT_DISCORD_URL;
    
    // Default refresh intervals
    const minI = parseInt(document.getElementById('minInterval').value, 10) || DEFAULT_MIN_INTERVAL;
    const maxI = parseInt(document.getElementById('maxInterval').value, 10) || DEFAULT_MAX_INTERVAL;
    
    // Queue-specific refresh intervals
    const minIRFY = document.getElementById('minIntervalRFY').value ? parseInt(document.getElementById('minIntervalRFY').value, 10) : null;
    const maxIRFY = document.getElementById('maxIntervalRFY').value ? parseInt(document.getElementById('maxIntervalRFY').value, 10) : null;
    const minIAFA = document.getElementById('minIntervalAFA').value ? parseInt(document.getElementById('minIntervalAFA').value, 10) : null;
    const maxIAFA = document.getElementById('maxIntervalAFA').value ? parseInt(document.getElementById('maxIntervalAFA').value, 10) : null;
    const minIAI = document.getElementById('minIntervalAI').value ? parseInt(document.getElementById('minIntervalAI').value, 10) : null;
    const maxIAI = document.getElementById('maxIntervalAI').value ? parseInt(document.getElementById('maxIntervalAI').value, 10) : null;
    
    // Global filter settings
    const filter = document.getElementById('filter').value.trim();
    const isRegexFilter = document.getElementById('isRegexFilter').checked;
    
    // Queue-specific filter settings
    const filterRFY = document.getElementById('filterRFY').value.trim();
    const isRegexFilterRFY = document.getElementById('isRegexFilterRFY').checked;
    
    const filterAFA = document.getElementById('filterAFA').value.trim();
    const isRegexFilterAFA = document.getElementById('isRegexFilterAFA').checked;
    
    const filterAI = document.getElementById('filterAI').value.trim();
    const isRegexFilterAI = document.getElementById('isRegexFilterAI').checked;

    // Validate all regex patterns if enabled
    let hasError = false;
    
    // Validate global filter regex
    if (isRegexFilter && filter) {
      try {
        new RegExp(filter);
      } catch (e) {
        showStatus(`Invalid global regex pattern: ${e.message}`, true);
        hasError = true;
      }
    }
    
    // Validate RFY filter regex
    if (isRegexFilterRFY && filterRFY) {
      try {
        new RegExp(filterRFY);
      } catch (e) {
        showStatus(`Invalid RFY regex pattern: ${e.message}`, true);
        hasError = true;
      }
    }
    
    // Validate AFA filter regex
    if (isRegexFilterAFA && filterAFA) {
      try {
        new RegExp(filterAFA);
      } catch (e) {
        showStatus(`Invalid AFA regex pattern: ${e.message}`, true);
        hasError = true;
      }
    }
    
    // Validate AI filter regex
    if (isRegexFilterAI && filterAI) {
      try {
        new RegExp(filterAI);
      } catch (e) {
        showStatus(`Invalid AI regex pattern: ${e.message}`, true);
        hasError = true;
      }
    }
    
    if (hasError) {
      return;
    }

    // Basic validation for default intervals
    if (minI < 1 || maxI < 1) {
      showStatus('Please enter valid default refresh intervals', true);
      return;
    }
    
    // Validation for queue-specific intervals if they are set
    if ((minIRFY !== null && minIRFY < 1) || (maxIRFY !== null && maxIRFY < 1) ||
        (minIAFA !== null && minIAFA < 1) || (maxIAFA !== null && maxIAFA < 1) ||
        (minIAI !== null && minIAI < 1) || (maxIAI !== null && maxIAI < 1)) {
      showStatus('Queue refresh intervals must be 1 second or more', true);
      return;
    }

    // Save all settings
    chrome.storage.local.set({
      enabled: isEnabled,
      ntfyEnabled: ntfyEnabled,
      ntfyUrl: ntfyUrl,
      discordEnabled: discordEnabled,
      discordUrl: discordUrl,
      minInterval: minI,
      maxInterval: maxI,
      minIntervalRFY: minIRFY,
      maxIntervalRFY: maxIRFY,
      minIntervalAFA: minIAFA,
      maxIntervalAFA: maxIAFA,
      minIntervalAI: minIAI,
      maxIntervalAI: maxIAI,
      // Global filter settings
      filter: filter,
      isRegexFilter: isRegexFilter,
      // Queue-specific filter settings
      filterRFY: filterRFY,
      isRegexFilterRFY: isRegexFilterRFY,
      filterAFA: filterAFA,
      isRegexFilterAFA: isRegexFilterAFA,
      filterAI: filterAI,
      isRegexFilterAI: isRegexFilterAI,
      // Clear old settings that we don't use anymore
      fromTime: null,
      toTime: null,
      webhookURL: null,
      httpMethod: null,
      postBody: null,
      language: null
    }, () => {
      showStatus('Settings saved successfully');
    });
  });
});
