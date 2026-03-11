/**
 * Language Synchronization System
 * Handles language preference across the app with backend persistence
 * Works with language-utils.js for translation
 */

// Constants
const STORAGE_KEY = 'fahamuShamba_language';
const SUPPORTED_LANGUAGES = ['english', 'swahili', 'luo'];
const DEFAULT_LANGUAGE = 'english';

/**
 * Save language preference to localStorage and update user in backend
 * @param {string} language - Language code (english, swahili, luo)
 * @param {boolean} syncWithBackend - Whether to sync with backend
 */
async function saveLanguagePreference(language, syncWithBackend = true) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    console.warn(`Invalid language: ${language}`);
    return false;
  }

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, language);
  
  // Apply immediately
  if (typeof setLanguage === 'function') {
    setLanguage(language);
  }

  // Sync with backend if user is logged in
  if (syncWithBackend) {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        const userData = JSON.parse(user);
        await updateUserLanguagePreference(userData.id, language, token);
      }
    } catch (error) {
      console.error('Failed to sync language with backend:', error);
      // Still succeed locally even if backend fails
    }
  }

  return true;
}

/**
 * Load language preference from localStorage (or default)
 * @returns {string} Language code
 */
function loadLanguagePreference() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
    return stored;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Set language from user object (usually after login)
 * @param {object} user - User object from backend
 */
function applyUserLanguagePreference(user) {
  if (user && user.preferred_language && SUPPORTED_LANGUAGES.includes(user.preferred_language)) {
    // Save and apply language
    localStorage.setItem(STORAGE_KEY, user.preferred_language);
    
    // Apply translation
    if (typeof setLanguage === 'function') {
      setLanguage(user.preferred_language);
    }
    
    console.log(`Applied user language preference: ${user.preferred_language}`);
    return user.preferred_language;
  }
  
  // Fall back to stored or default
  return loadLanguagePreference();
}

/**
 * Update user's language preference in backend
 * @param {number} userId - User ID
 * @param {string} language - Language code
 * @param {string} token - JWT token
 */
async function updateUserLanguagePreference(userId, language, token) {
  try {
    const response = await fetch('/api/auth/update-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        preferred_language: language
      })
    });

    if (!response.ok) {
      console.warn('Failed to update language preference on backend');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating language preference:', error);
    return false;
  }
}

/**
 * Initialize language system on page load
 * Should be called after language-utils.js is loaded
 */
function initializeLanguageSync() {
  // Load saved language preference
  const savedLanguage = loadLanguagePreference();
  
  // Apply language if function is available
  if (typeof setLanguage === 'function') {
    setLanguage(savedLanguage);
  }
  
  // Check if user is logged in and has a different language preference
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.preferred_language && user.preferred_language !== savedLanguage) {
        applyUserLanguagePreference(user);
      }
    }
  } catch (error) {
    console.warn('Could not check user language preference:', error);
  }

  console.log(`Language system initialized with: ${savedLanguage}`);
}

/**
 * Handle language change from UI elements
 * @param {string} language - Language code
 */
function handleLanguageChange(language) {
  saveLanguagePreference(language, true);
  
  // Dispatch event for any listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language } 
    }));
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLanguageSync);
} else {
  // DOM is already loaded
  initializeLanguageSync();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveLanguagePreference,
    loadLanguagePreference,
    applyUserLanguagePreference,
    updateUserLanguagePreference,
    initializeLanguageSync,
    handleLanguageChange,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
  };
}
