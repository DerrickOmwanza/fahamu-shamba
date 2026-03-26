/**
 * Multilingual Translation Manager
 * Supports: English, Kiswahili (Swahili), Dholuo (Luo)
 * Uses localStorage to remember user's language preference
 */

class TranslationManager {
  constructor() {
    this.storageKeys = ['fahamuLanguage', 'fahamuShamba_language', 'fahamu_language', 'fs_language'];
    this.currentLanguage = this.resolveStoredLanguage();
    this.translations = {};
    this.supportedLanguages = ['en', 'sw', 'luo'];
    this.languageNames = {
      en: '🇬🇧 English',
      sw: '🇰🇪 Kiswahili',
      luo: '🌍 Dholuo'
    };
  }

  normalizeLanguageCode(lang) {
    const normalized = String(lang || '').toLowerCase().trim();
    const aliases = {
      en: 'en',
      english: 'en',
      sw: 'sw',
      swahili: 'sw',
      kiswahili: 'sw',
      luo: 'luo',
      dholuo: 'luo'
    };
    return aliases[normalized] || 'en';
  }

  resolveStoredLanguage() {
    for (const key of this.storageKeys) {
      const value = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (value) {
        return this.normalizeLanguageCode(value);
      }
    }
    return 'en';
  }

  persistLanguage(lang) {
    const normalized = this.normalizeLanguageCode(lang);
    const legacyNames = {
      en: 'english',
      sw: 'swahili',
      luo: 'luo'
    };

    this.storageKeys.forEach((key) => {
      const storedValue = key === 'fahamuShamba_language' ? legacyNames[normalized] : normalized;
      localStorage.setItem(key, storedValue);
      sessionStorage.setItem(key, storedValue);
    });
  }

  /**
   * Load translation files from JSON
   */
  async loadTranslations() {
    try {
      for (const lang of this.supportedLanguages) {
        const response = await fetch(`/translations/${lang}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load ${lang}.json`);
        }
        this.translations[lang] = await response.json();
      }
      console.log('✅ Translations loaded successfully');
    } catch (error) {
      console.error('❌ Error loading translations:', error);
      // Fallback to English if loading fails
      this.currentLanguage = 'en';
    }
  }

  initLanguageSelects() {
    const selects = document.querySelectorAll('.language-select');
    selects.forEach((select) => {
      if (select.tagName === 'SELECT') {
        select.value = this.currentLanguage;
        select.addEventListener('change', (event) => {
          const chosen = event.target.value;
          this.setLanguage(chosen);
        });
      }
    });
  }

  updateLanguageSelects() {
    const selects = document.querySelectorAll('.language-select');
    selects.forEach((select) => {
      if (select.tagName === 'SELECT') {
        select.value = this.currentLanguage;
      }
    });
  }

  /**
   * Get translated text by key (supports nested keys like "hero.headline")
   */
  get(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return key if not found
      }
    }

    return value || key;
  }

  /**
   * Change language and update page
   */
  setLanguage(lang) {
    const normalized = this.normalizeLanguageCode(lang);
    if (!this.supportedLanguages.includes(normalized)) {
      console.error(`Unsupported language: ${lang}`);
      return;
    }

    this.currentLanguage = normalized;
    this.persistLanguage(normalized);
    this.updatePageContent();
    this.updateLanguageButtons();
    this.updateLanguageSelects();
    
    // Dispatch custom event for other parts of app to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: normalized } }));
  }

  /**
   * Update all elements with data-i18n attribute
   */
  updatePageContent() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      const translatedText = this.get(key);
      
      // If element has data-i18n-attr, update attribute instead of text
      const attrName = element.getAttribute('data-i18n-attr');
      if (attrName) {
        element.setAttribute(attrName, translatedText);
      } else {
        element.textContent = translatedText;
      }
    });

    // Update page direction if needed (for RTL languages in future)
    document.documentElement.lang = this.currentLanguage;
    
    // Once content is translated, make the body visible and remove loader
    document.body.classList.add('loaded');
    
    // Hide splash screen if present
    const loader = document.getElementById('page-loader') || document.getElementById('pageLoader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }

  /**
   * Update language button active states
   */
  updateLanguageButtons() {
    const buttons = document.querySelectorAll('.language-btn');
    buttons.forEach((btn) => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === this.currentLanguage) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages.map((lang) => ({
      code: lang,
      name: this.languageNames[lang]
    }));
  }
}

// Create global instance
const translator = new TranslationManager();
window.translator = translator;

/**
 * Initialize translations on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  await translator.loadTranslations();
  translator.updatePageContent();
  translator.updateLanguageButtons();
  translator.initLanguageSelects();
});

// Helper function for use in HTML
function changeLanguage(lang) {
  translator.setLanguage(lang);
}

function getCurrentLanguage() {
  return translator.getLanguage();
}

function setLanguage(lang) {
  translator.setLanguage(lang);
}

function translatePage(lang) {
  translator.updatePageContent(lang);
}

function initializeLanguage() {
  translator.updatePageContent();
  translator.updateLanguageButtons();
  translator.initLanguageSelects();
}
