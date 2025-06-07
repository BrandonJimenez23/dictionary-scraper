// Multi-Dictionary Scraper - Direct Function Exports
// No class instantiation required - import and use functions directly

import { scrapeWordReference } from './scrapers/wordreference.js';
import { scrapeLinguee, isLanguagePairSupported as isLingueeSupported } from './scrapers/linguee.js';
import { LanguageCodes, LanguageValidator, RequestHandler } from './utils/common.js';

// Dictionary metadata
const DICTIONARIES = {
    wordreference: {
        name: 'WordReference',
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'zh', 'ja', 'ko', 'nl', 'sv', 'no', 'da', 'pl', 'cs', 'ro', 'tr', 'he', 'hi', 'th', 'vi'],
        features: ['audio', 'pronunciation', 'examples', 'grammatical-types'],
        priority: 1
    },
    linguee: {
        name: 'Linguee',
        languages: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'sv', 'da', 'fi', 'el', 'hu', 'sl', 'lv', 'lt', 'et', 'mt', 'sk', 'bg', 'ro', 'hr', 'cs'],
        features: ['contexts', 'frequency', 'verified-translations'],
        priority: 2
    }
};

/**
 * Translates a word using WordReference dictionary
 * Supports both short ('en', 'es') and long ('english', 'spanish') language codes
 * Includes CORS handling for frontend use
 * 
 * @param {string} word - Word to translate
 * @param {string} from - Source language (e.g., 'en', 'english')
 * @param {string} to - Target language (e.g., 'es', 'spanish')
 * @returns {Promise<Object>} Translation result
 */
export async function translateWithWordReference(word, from, to) {
    const validation = LanguageValidator.validatePair(from, to);
    if (validation.error) {
        throw new Error(validation.error);
    }

    try {
        const result = await scrapeWordReference(word, validation.from, validation.to);
        return {
            ...result,
            source: 'wordreference',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            source: 'wordreference',
            inputWord: word,
            fromLang: validation.from,
            toLang: validation.to,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Translates a word using Linguee dictionary
 * Supports both short ('en', 'es') and long ('english', 'spanish') language codes
 * Includes CORS handling for frontend use
 * 
 * @param {string} word - Word to translate
 * @param {string} from - Source language (e.g., 'en', 'english')
 * @param {string} to - Target language (e.g., 'es', 'spanish')
 * @returns {Promise<Object>} Translation result
 */
export async function translateWithLinguee(word, from, to) {
    const validation = LanguageValidator.validatePair(from, to);
    if (validation.error) {
        throw new Error(validation.error);
    }

    // Check if language pair is supported by Linguee
    if (!isLingueeSupported(validation.from, validation.to)) {
        throw new Error(`Language pair ${validation.from}-${validation.to} not supported by Linguee`);
    }

    try {
        const result = await scrapeLinguee(word, validation.from, validation.to);
        return {
            ...result,
            source: 'linguee',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            source: 'linguee',
            inputWord: word,
            fromLang: validation.from,
            toLang: validation.to,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Translates a word using a specific dictionary
 * 
 * @param {string} dictionary - Dictionary to use ('wordreference' or 'linguee')
 * @param {string} word - Word to translate
 * @param {string} from - Source language
 * @param {string} to - Target language
 * @returns {Promise<Object>} Translation result
 */
export async function translateWith(dictionary, word, from, to) {
    switch (dictionary.toLowerCase()) {
        case 'wordreference':
        case 'wr':
            return await translateWithWordReference(word, from, to);
        case 'linguee':
        case 'lg':
            return await translateWithLinguee(word, from, to);
        default:
            throw new Error(`Dictionary "${dictionary}" not supported. Available: wordreference, linguee`);
    }
}

/**
 * Translates a word using multiple dictionaries with fallback
 * Returns results from all available dictionaries for the language pair
 * 
 * @param {string} word - Word to translate
 * @param {string} from - Source language
 * @param {string} to - Target language
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Combined results from multiple dictionaries
 */
export async function translate(word, from, to, options = {}) {
    const validation = LanguageValidator.validatePair(from, to);
    if (validation.error) {
        throw new Error(validation.error);
    }

    const results = {
        inputWord: word,
        fromLang: validation.from,
        toLang: validation.to,
        fromName: validation.fromName,
        toName: validation.toName,
        dictionaries: {},
        timestamp: new Date().toISOString()
    };

    const promises = [];

    // Try WordReference
    if (DICTIONARIES.wordreference.languages.includes(validation.from) && 
        DICTIONARIES.wordreference.languages.includes(validation.to)) {
        promises.push(
            translateWithWordReference(word, validation.from, validation.to)
                .then(result => ({ dictionary: 'wordreference', result }))
                .catch(error => ({ dictionary: 'wordreference', error: error.message }))
        );
    }

    // Try Linguee
    if (isLingueeSupported(validation.from, validation.to)) {
        promises.push(
            translateWithLinguee(word, validation.from, validation.to)
                .then(result => ({ dictionary: 'linguee', result }))
                .catch(error => ({ dictionary: 'linguee', error: error.message }))
        );
    }

    if (promises.length === 0) {
        throw new Error(`No dictionaries support the language pair ${validation.from}-${validation.to}`);
    }

    const responses = await Promise.allSettled(promises);
    
    responses.forEach(response => {
        if (response.status === 'fulfilled') {
            const { dictionary, result, error } = response.value;
            results.dictionaries[dictionary] = error ? { error } : result;
        }
    });

    return results;
}

/**
 * Gets information about available dictionaries
 * @returns {Object} Dictionary information
 */
export function getAvailableDictionaries() {
    return Object.entries(DICTIONARIES).reduce((acc, [key, dict]) => {
        acc[key] = {
            name: dict.name,
            languages: dict.languages,
            features: dict.features,
            priority: dict.priority
        };
        return acc;
    }, {});
}

/**
 * Gets supported language codes
 * @returns {Array<string>} Array of supported language codes
 */
export function getSupportedLanguages() {
    return LanguageCodes.getAllCodes();
}

/**
 * Normalizes language code (supports both short and long forms)
 * @param {string} code - Language code to normalize
 * @returns {string|null} Normalized short code or null if not supported
 */
export function normalizeLanguageCode(code) {
    return LanguageCodes.normalize(code);
}

/**
 * Checks if a language pair is supported by any dictionary
 * @param {string} from - Source language
 * @param {string} to - Target language
 * @returns {Object} Support information
 */
export function checkLanguageSupport(from, to) {
    const validation = LanguageValidator.validatePair(from, to);
    if (validation.error) {
        return { supported: false, error: validation.error };
    }

    const supportedBy = [];
    
    if (DICTIONARIES.wordreference.languages.includes(validation.from) && 
        DICTIONARIES.wordreference.languages.includes(validation.to)) {
        supportedBy.push('wordreference');
    }

    if (isLingueeSupported(validation.from, validation.to)) {
        supportedBy.push('linguee');
    }

    return {
        supported: supportedBy.length > 0,
        supportedBy,
        normalizedFrom: validation.from,
        normalizedTo: validation.to
    };
}
