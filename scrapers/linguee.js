import axios from 'axios';
import * as cheerio from 'cheerio';
import { LanguageValidator, RequestHandler } from '../utils/common.js';

/**
 * Linguee scraper - Extracts translations with real-world contexts
 * @param {string} word - Word to translate
 * @param {string} from - Source language (e.g., 'en')
 * @param {string} to - Target language (e.g., 'es')
 * @returns {Object} JSON object with translations and contexts
 */
export async function scrapeLinguee(word, from = 'en', to = 'es') {
    // Validate and normalize language codes
    const validation = LanguageValidator.validatePair(from, to);
    if (validation.error) {
        return {
            source: 'linguee',
            inputWord: word,
            fromLang: from,
            toLang: to,
            translations: [],
            error: validation.error,
            timestamp: new Date().toISOString()
        };
    }

    const normalizedFrom = validation.from;
    const normalizedTo = validation.to;

    // Try multiple language code formats (Linguee uses long names)
    const fromAlternatives = LanguageValidator.getAlternatives(from);
    const toAlternatives = LanguageValidator.getAlternatives(to);
    
    let lastError = null;

    // Try different combinations of language codes
    for (const fromCode of fromAlternatives) {
        for (const toCode of toAlternatives) {
            try {
                const url = buildLingueeURL(word, fromCode, toCode);
                
                const html = await RequestHandler.makeRequest(url);
                const result = processLingueeHTML(html, word, normalizedFrom, normalizedTo);
                
                // Check if we got valid results
                if (result.translations && result.translations.length > 0) {
                    return {
                        ...result,
                        languagePair: `${fromCode}-${toCode}`,
                        normalizedFrom,
                        normalizedTo,
                        url: url // Include the successful URL for debugging
                    };
                }
            } catch (error) {
                lastError = error;
                console.warn(`Linguee failed with ${fromCode}-${toCode}:`, error.message);
                continue;
            }
        }
    }

    // If all attempts failed, return error result
    return {
        source: 'linguee',
        inputWord: word,
        fromLang: normalizedFrom,
        toLang: normalizedTo,
        translations: [],
        error: lastError?.message || `No translations found for "${word}" from ${validation.fromName} to ${validation.toName}`,
        attemptedLanguagePairs: fromAlternatives.flatMap(f => toAlternatives.map(t => `${f}-${t}`)),
        timestamp: new Date().toISOString()
    };
}

function buildLingueeURL(word, from, to) {
    // Language name mapping for Linguee URLs
    const langNames = {
        'en': 'english',
        'es': 'spanish', 
        'fr': 'french',
        'de': 'german',
        'pt': 'portuguese',
        'it': 'italian',
        'ru': 'russian',
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

    // Buscar dentro del div dictionary o usar toda la página como fallback
    const $dictionary = $('#dictionary').length > 0 ? $('#dictionary') : $('body');

    // Procesar tanto .lemma.featured como .lemma elementos principales
    $dictionary.find('.lemma').each((_, element) => {
        const $lemma = $(element);

        const sourceWord = $lemma.find('.tag_lemma .dictLink').first().text().trim();
        if (!sourceWord) return;

        // Extraer URL de audio - buscar el elemento audio o el atributo onclick
        let audioUrl = null;
        const $audioElement = $lemma.find('audio source[type="audio/mpeg"]');
        if ($audioElement.length > 0) {
            audioUrl = $audioElement.attr('src');
        } else {
            // Buscar en el onclick del elemento audio
            const $audioLink = $lemma.find('.audio[onclick]');
            if ($audioLink.length > 0) {
                const onclickContent = $audioLink.attr('onclick');
                const match = onclickContent.match(/playSound\([^,]+,\s*"([^"]+)"/);
                if (match) {
                    audioUrl = match[1];
                }
            }
        }

        // Extraer tipo de palabra directamente sin mapeo
        const wordType = $lemma.find('.tag_wordtype').first().text().trim();

        const translation = {
            from: sourceWord,
            fromType: wordType,
            audio: audioUrl ? (audioUrl.startsWith('http') ? audioUrl : `https://www.linguee.com${audioUrl}`) : null,
            translations: [],
            contexts: []
        };

        // Buscar traducciones en los elementos .translation
        $lemma.find('.translation').each((i, tEl) => {
            const $t = $(tEl);
            const $transLink = $t.find('.tag_trans .dictLink');
            const translatedText = $transLink.text().trim();

            if (translatedText && translatedText !== sourceWord) {
                // Extraer tipo de la traducción directamente
                const transType = $t.find('.tag_type').text().trim();
                
                translation.translations.push({
                    text: translatedText,
                    type: transType,
                    frequency: extractFrequency($t),
                    verified: $t.find('.icon_verified').length > 0
                });
            }
        });

        // Buscar ejemplos/contextos
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

    // Si no hay resultados, intentar con un algoritmo de fallback más simple
    if (result.translations.length === 0) {
        console.log('No se encontraron traducciones con el algoritmo principal, intentando fallback...');
        return tryFallbackProcessing($, inputWord, fromLang, toLang);
    }

    return result;
}



function tryFallbackProcessing($, inputWord, fromLang, toLang) {
    const result = {
        source: 'linguee',
        inputWord,
        fromLang,
        toLang,
        translations: []
    };

    // Intentar buscar cualquier elemento con .dictLink que contenga traducciones
    $('.dictLink').each((_, linkEl) => {
        const $link = $(linkEl);
        const text = $link.text().trim();
        
        if (text && text.toLowerCase().includes(inputWord.toLowerCase())) {
            // Encontrar el contenedor parent más cercano que pueda tener traducciones
            const $container = $link.closest('.lemma, .translation_group, .meaninggroup');
            
            if ($container.length > 0) {
                const translation = {
                    from: text,
                    fromType: 'unknown',
                    audio: null,
                    translations: [],
                    contexts: []
                };

                // Buscar traducciones relacionadas
                $container.find('.dictLink').each((_, tLink) => {
                    const $tLink = $(tLink);
                    const tText = $tLink.text().trim();
                    
                    if (tText && tText !== text) {
                        translation.translations.push({
                            text: tText,
                            type: 'unknown',
                            frequency: 'unknown',
                            verified: false
                        });
                    }
                });

                if (translation.translations.length > 0) {
                    result.translations.push(translation);
                }
            }
        }
    });

    return result;
}

function extractWordType(typeText) {
    if (!typeText) return '';
    
    // Usar directamente el texto sin mapeo, solo limpiar
    return typeText.toLowerCase().trim();
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
        'de-es', 'es-de', 'de-fr', 'fr-de', 'en-ru', 'ru-en',
    ];

    return supportedPairs.includes(`${from}-${to}`);
}
