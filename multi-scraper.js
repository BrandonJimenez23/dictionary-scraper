// Main class for the multi-dictionary module
import { scrapeWordReference } from './scrapers/wordreference.js';
import { scrapeLinguee, isLanguagePairSupported as isLingueeSupported } from './scrapers/linguee.js';

export class MultiDictionaryScraper {
  constructor() {
    this.dictionaries = {
      wordreference: {
        name: 'WordReference',
        scraper: this.wrapWordReference.bind(this),
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'zh', 'ja', 'ko', 'nl', 'sv', 'no', 'da', 'pl', 'cs', 'ro', 'tr', 'he', 'hi', 'th', 'vi'],
        features: ['audio', 'pronunciation', 'examples', 'grammatical-types'],
        priority: 1
      },
      linguee: {
        name: 'Linguee',
        scraper: scrapeLinguee,
        languages: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'sv', 'da', 'fi', 'el', 'hu', 'sl', 'lv', 'lt', 'et', 'mt', 'sk', 'bg', 'ro', 'hr', 'cs'],
        features: ['contexts', 'frequency', 'verified-translations'],
        priority: 2,
        validator: isLingueeSupported
      }
    };
  }

  /**
   * Wrapper for WordReference - returns original format for direct calls
   * @param {string} word - Word to translate
   * @param {string} from - Source language
   * @param {string} to - Target language
   * @returns {Object} WordReference result in original format
   */
  async wrapWordReference(word, from, to) {
    // For direct WordReference calls, return the original format
    return await scrapeWordReference(word, from, to);
  }

  /**
   * Gets the list of available dictionaries
   * @returns {Object} Information about available dictionaries
   */
  getAvailableDictionaries() {
    const result = {};
    for (const [key, dict] of Object.entries(this.dictionaries)) {
      result[key] = {
        name: dict.name,
        languages: dict.languages,
        features: dict.features,
        priority: dict.priority
      };
    }
    return result;
  }

  /**
   * Translates a word using a specific dictionary
   * @param {string} dictionaryKey - Dictionary identifier ('wordreference' or 'linguee')
   * @param {string} word - Word to translate
   * @param {string} from - Source language code
   * @param {string} to - Target language code
   * @returns {Promise<Object>} Translation result in standardized format
   */
  async translate(dictionaryKey, word, from, to) {
    if (!this.dictionaries[dictionaryKey]) {
      throw new Error(`Dictionary "${dictionaryKey}" not available. Available: ${Object.keys(this.dictionaries).join(', ')}`);
    }

    const dict = this.dictionaries[dictionaryKey];
    
    // Validate language support
    if (dict.validator && !dict.validator(from, to)) {
      throw new Error(`Language pair ${from}-${to} not supported by ${dict.name}`);
    }

    if (!dict.languages.includes(from) || !dict.languages.includes(to)) {
      throw new Error(`Language pair ${from}-${to} not supported by ${dict.name}`);
    }

    try {
      const result = await dict.scraper(word, from, to);
      return {
        ...result,
        source: dictionaryKey,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: dictionaryKey,
        inputWord: word,
        fromLang: from,
        toLang: to,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Translates a word using multiple dictionaries
   * @param {string} word - Word to translate
   * @param {string} from - Source language
   * @param {string} to - Target language
   * @param {Array<string>} dictionaries - List of dictionaries to use
   * @returns {Promise<Object>} Results from multiple dictionaries
   */
  async translateMultiple(word, from, to, dictionaries = null) {
    if (!dictionaries) {
      dictionaries = this.getCompatibleDictionaries(from, to);
    }

    const results = {};
    const promises = dictionaries.map(async (dict) => {
      try {
        const result = await this.translate(dict, word, from, to);
        results[dict] = result;
      } catch (error) {
        results[dict] = {
          source: dict,
          inputWord: word,
          fromLang: from,
          toLang: to,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    });

    await Promise.all(promises);
    
    return {
      inputWord: word,
      fromLang: from,
      toLang: to,
      results: results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Automatically translates using the best available dictionary
   * @param {string} word - Word to translate
   * @param {string} from - Source language
   * @param {string} to - Target language
   * @returns {Promise<Object>} Result from the best available translation
   */
  async translateAuto(word, from, to) {
    const compatibleDicts = this.getCompatibleDictionaries(from, to);
    
    if (compatibleDicts.length === 0) {
      throw new Error(`No compatible dictionaries found for ${from}-${to}`);
    }

    // Try in priority order
    for (const dictName of compatibleDicts) {
      try {
        const result = await this.translate(dictName, word, from, to);
        if (!result.error) {
          return result;
        }
      } catch (error) {
        console.warn(`Failed to translate with ${dictName}:`, error.message);
      }
    }

    throw new Error(`All dictionaries failed to translate "${word}" from ${from} to ${to}`);
  }

  /**
   * Gets dictionaries compatible with a language pair
   * @param {string} from - Source language
   * @param {string} to - Target language
   * @returns {Array<string>} List of compatible dictionaries ordered by priority
   */
  getCompatibleDictionaries(from, to) {
    const compatible = [];
    
    for (const [key, dict] of Object.entries(this.dictionaries)) {
      const isLanguageSupported = dict.languages.includes(from) && dict.languages.includes(to);
      const isValidatorPassed = !dict.validator || dict.validator(from, to);
      
      if (isLanguageSupported && isValidatorPassed) {
        compatible.push({ name: key, priority: dict.priority });
      }
    }

    // Sort by priority (lower number = higher priority)
    return compatible
      .sort((a, b) => a.priority - b.priority)
      .map(item => item.name);
  }

  /**
   * Checks if a language pair is supported by at least one dictionary
   * @param {string} from - Source language
   * @param {string} to - Target language
   * @returns {boolean} True if supported
   */
  isLanguagePairSupported(from, to) {
    return this.getCompatibleDictionaries(from, to).length > 0;
  }

  /**
   * Gets usage and availability statistics
   * @returns {Object} Module statistics
   */
  getStats() {
    const totalLanguages = new Set();
    let totalPairs = 0;

    for (const dict of Object.values(this.dictionaries)) {
      dict.languages.forEach(lang => totalLanguages.add(lang));
      totalPairs += dict.languages.length * (dict.languages.length - 1); // Combinations without repetition
    }

    return {
      totalDictionaries: Object.keys(this.dictionaries).length,
      totalLanguages: totalLanguages.size,
      approximatePairs: totalPairs,
      dictionaries: this.getAvailableDictionaries()
    };
  }
}

// Export default instance for easy usage
export const scraper = new MultiDictionaryScraper();

// Export individual functions for backward compatibility
export { scrapeWordReference } from './scrapers/wordreference.js';
export { scrapeLinguee } from './scrapers/linguee.js';
