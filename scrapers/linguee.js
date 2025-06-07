import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Linguee scraper - Extracts translations with real-world contexts
 * @param {string} word - Word to translate
 * @param {string} from - Source language (e.g., 'en')
 * @param {string} to - Target language (e.g., 'es')
 * @returns {Object} JSON object with translations and contexts
 */
export async function scrapeLinguee(word, from = 'en', to = 'es') {
    const url = buildLingueeURL(word, from, to);

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        return processLingueeHTML(data, word, from, to);
    } catch (error) {
        console.error(`Error scraping Linguee for "${word}":`, error.message);
        return {
            source: 'linguee',
            inputWord: word,
            fromLang: from,
            toLang: to,
            translations: [],
            error: error.message
        };
    }
}

function buildLingueeURL(word, from, to) {
    // Language name mapping for Linguee URLs
    const langNames = {
        'en': 'english',
        'es': 'spanish', 
        'fr': 'french',
        'de': 'german',
        'pt': 'portuguese',
        'it': 'italian'
    };

    const fromName = langNames[from] || from;
    const toName = langNames[to] || to;
    
    // Always use .com domain to avoid regional redirects
    return `https://www.linguee.com/${fromName}-${toName}/search?source=${fromName}&query=${encodeURIComponent(word)}`;
}

function processLingueeHTML(html, inputWord, fromLang, toLang) {
    const $ = cheerio.load(html);
    const result = {
        source: 'linguee',
        inputWord,
        fromLang,
        toLang,
        translations: []
    };

    // Extract translations using the correct Linguee structure
    $('.lemma').each((index, element) => {
        const $lemma = $(element);
        
        // Get source word from the main lemma link
        const sourceWord = $lemma.find('.dictLink').first().text().trim();
        
        if (!sourceWord) return;

        const translation = {
            from: sourceWord,
            fromType: extractWordType($lemma.find('.tag_wordtype').first().text()),
            translations: [],
            contexts: []
        };

        // Extract translations from the translation divs
        $lemma.find('.translation .dictLink').each((i, translationEl) => {
            const translatedWord = $(translationEl).text().trim();
            
            if (translatedWord && translatedWord !== sourceWord) {
                translation.translations.push({
                    text: translatedWord,
                    type: extractWordType($(translationEl).parent().find('.tag_wordtype').text()),
                    frequency: 'unknown',
                    verified: $(translationEl).closest('.translation').find('.icon_verified').length > 0
                });
            }
        });

        // Extract context examples
        $lemma.find('.example').each((i, exampleEl) => {
            const $example = $(exampleEl);
            const sourceText = $example.find('.tag_s').text().trim();
            const targetText = $example.find('.tag_t').text().trim();

            if (sourceText && targetText) {
                translation.contexts.push({
                    source: sourceText,
                    target: targetText,
                    verified: $example.find('.icon_verified').length > 0,
                    external: $example.find('.icon_external').length > 0
                });
            }
        });

        if (translation.translations.length > 0 || translation.contexts.length > 0) {
            result.translations.push(translation);
        }
    });

    return result;
}

function extractWordType(typeText) {
    if (!typeText) return '';

    const typeMap = {
        'noun': 'n',
        'verb': 'v',
        'adjective': 'adj',
        'adverb': 'adv',
        'preposition': 'prep',
        'conjunction': 'conj',
        'interjection': 'interj',
        'pronoun': 'pron',
        'article': 'art'
    };

    const normalizedType = typeText.toLowerCase().trim();
    return typeMap[normalizedType] || normalizedType;
}

function extractFrequency(element) {
    // Look for frequency indicators in Linguee's structure
    const $freq = element.find('.tag_c');
    if ($freq.length === 0) return 'unknown';

    const freqText = $freq.text().toLowerCase();
    if (freqText.includes('muy frecuente') || freqText.includes('uso muy frecuente')) return 'high';
    if (freqText.includes('frecuente')) return 'medium';
    if (freqText.includes('menos frecuente')) return 'low';

    return 'unknown';
}

// Helper function to validate supported language pairs
export function isLanguagePairSupported(from, to) {
    const supportedPairs = [
        'en-es', 'es-en', 'en-fr', 'fr-en', 'en-de', 'de-en',
        'en-pt', 'pt-en', 'en-it', 'it-en', 'fr-es', 'es-fr',
        'de-es', 'es-de', 'de-fr', 'fr-de'
    ];

    return supportedPairs.includes(`${from}-${to}`);
}
