/**
 * Multilingual Translation Manager
 * Supports: English, Kiswahili (Swahili), Dholuo (Luo)
 * Uses localStorage to remember user's language preference
 */

class TranslationManager {
  constructor() {
    this.currentLanguage = localStorage.getItem('fahamuLanguage') || 'en';
    this.translations = {};
    this.supportedLanguages = ['en', 'sw', 'luo'];
    this.languageNames = {
      en: '🇬🇧 English',
      sw: '🇰🇪 Kiswahili',
      luo: '🌍 Dholuo'
    };
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
    if (!this.supportedLanguages.includes(lang)) {
      console.error(`Unsupported language: ${lang}`);
      return;
    }

    this.currentLanguage = lang;
    localStorage.setItem('fahamuLanguage', lang);
    this.updatePageContent();
    this.updateLanguageButtons();
    
    // Dispatch custom event for other parts of app to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
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

/**
 * Initialize translations on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  await translator.loadTranslations();
  translator.updatePageContent();
  translator.updateLanguageButtons();
});

// Helper function for use in HTML
function changeLanguage(lang) {
  translator.setLanguage(lang);
}
