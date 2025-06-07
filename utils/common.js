// Utilidades comunes para todos los scrapers
export class LanguageCodes {
    static codes = {
        // ISO 639-1 codes with long forms
        'en': { name: 'English', native: 'English', long: 'english' },
        'es': { name: 'Spanish', native: 'Español', long: 'spanish' },
        'fr': { name: 'French', native: 'Français', long: 'french' },
        'de': { name: 'German', native: 'Deutsch', long: 'german' },
        'it': { name: 'Italian', native: 'Italiano', long: 'italian' },
        'pt': { name: 'Portuguese', native: 'Português', long: 'portuguese' },
        'ru': { name: 'Russian', native: 'Русский', long: 'russian' },
        'ar': { name: 'Arabic', native: 'العربية', long: 'arabic' },
        'zh': { name: 'Chinese', native: '中文', long: 'chinese' },
        'ja': { name: 'Japanese', native: '日本語', long: 'japanese' },
        'ko': { name: 'Korean', native: '한국어', long: 'korean' },
        'nl': { name: 'Dutch', native: 'Nederlands', long: 'dutch' },
        'pl': { name: 'Polish', native: 'Polski', long: 'polish' },
        'sv': { name: 'Swedish', native: 'Svenska', long: 'swedish' },
        'no': { name: 'Norwegian', native: 'Norsk', long: 'norwegian' },
        'da': { name: 'Danish', native: 'Dansk', long: 'danish' },
        'fi': { name: 'Finnish', native: 'Suomi', long: 'finnish' },
        'cs': { name: 'Czech', native: 'Čeština', long: 'czech' },
        'ro': { name: 'Romanian', native: 'Română', long: 'romanian' },
        'tr': { name: 'Turkish', native: 'Türkçe', long: 'turkish' },
        'he': { name: 'Hebrew', native: 'עברית', long: 'hebrew' },
        'hi': { name: 'Hindi', native: 'हिन्दी', long: 'hindi' },
        'th': { name: 'Thai', native: 'ไทย', long: 'thai' },
        'vi': { name: 'Vietnamese', native: 'Tiếng Việt', long: 'vietnamese' },
        'el': { name: 'Greek', native: 'Ελληνικά', long: 'greek' },
        'hu': { name: 'Hungarian', native: 'Magyar', long: 'hungarian' },
        'bg': { name: 'Bulgarian', native: 'Български', long: 'bulgarian' },
        'hr': { name: 'Croatian', native: 'Hrvatski', long: 'croatian' },
        'sk': { name: 'Slovak', native: 'Slovenčina', long: 'slovak' },
        'sl': { name: 'Slovenian', native: 'Slovenščina', long: 'slovenian' },
        'et': { name: 'Estonian', native: 'Eesti', long: 'estonian' },
        'lv': { name: 'Latvian', native: 'Latviešu', long: 'latvian' },
        'lt': { name: 'Lithuanian', native: 'Lietuvių', long: 'lithuanian' },
        'mt': { name: 'Maltese', native: 'Malti', long: 'maltese' }
    };

    /**
     * Normalizes language code to short form (ISO 639-1)
     * @param {string} code - Language code (short or long form)
     * @returns {string|null} Normalized short code or null if not found
     */
    static normalize(code) {
        const lowerCode = code.toLowerCase();
        
        // Check if it's already a short code
        if (this.codes[lowerCode]) {
            return lowerCode;
        }
        
        // Check if it's a long form
        for (const [shortCode, data] of Object.entries(this.codes)) {
            if (data.long === lowerCode || data.name.toLowerCase() === lowerCode) {
                return shortCode;
            }
        }
        
        return null;
    }

    static getName(code) {
        return this.codes[code]?.name || code;
    }

    static getNativeName(code) {
        return this.codes[code]?.native || code;
    }

    static getAllCodes() {
        return Object.keys(this.codes);
    }

    static isSupported(code) {
        return this.codes.hasOwnProperty(code);
    }
}

export class AudioExtractor {
    /**
     * Extrae enlaces de audio de diferentes fuentes
     * @param {string} html - HTML del sitio
     * @param {string} source - Fuente del sitio ('wordreference', 'cambridge', etc.)
     * @returns {Array<string>} Array de URLs de audio
     */
    static extractAudioLinks(html, source) {
        switch (source) {
            case 'wordreference':
                return this.extractWordReferenceAudio(html);
            case 'cambridge':
                return this.extractCambridgeAudio(html);
            default:
                return [];
        }
    }

    static extractWordReferenceAudio(html) {
        const audioLinks = [];

        // Patrón para archivos de audio en JavaScript
        const audioPattern = /var\s+audioFiles\s*=\s*({[^}]+})/g;
        const match = audioPattern.exec(html);

        if (match) {
            try {
                const audioObj = eval(`(${match[1]})`);
                for (const [key, value] of Object.entries(audioObj)) {
                    if (typeof value === 'string' && value.startsWith('/')) {
                        audioLinks.push(`https://www.wordreference.com${value}`);
                    }
                }
            } catch (error) {
                console.warn('Error parsing audio object:', error);
            }
        }

        // Patrón alternativo para enlaces directos
        const directPattern = /\/audio\/[^"'\s]+\.mp3/g;
        let directMatch;
        while ((directMatch = directPattern.exec(html)) !== null) {
            const fullUrl = `https://www.wordreference.com${directMatch[0]}`;
            if (!audioLinks.includes(fullUrl)) {
                audioLinks.push(fullUrl);
            }
        }

        return audioLinks;
    }

    static extractCambridgeAudio(html) {
        const audioLinks = [];
        const pattern = /data-src-mp3="([^"]+)"/g;
        let match;

        while ((match = pattern.exec(html)) !== null) {
            audioLinks.push(match[1]);
        }

        return audioLinks;
    }
}

export class TextProcessor {
    /**
     * Limpia y normaliza texto extraído de HTML
     * @param {string} text - Texto a limpiar
     * @returns {string} Texto limpio
     */
    static cleanText(text) {
        if (!text) return '';

        return text
            .replace(/\s+/g, ' ')           // Múltiples espacios a uno solo
            .replace(/^\s+|\s+$/g, '')      // Eliminar espacios al inicio y final
            .replace(/[^\w\s\u00C0-\u017F\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0590-\u05FF\u0600-\u06FF]/g, '') // Mantener solo caracteres válidos
            .trim();
    }

    /**
     * Extrae tipos gramaticales comunes
     * @param {string} text - Texto que contiene el tipo
     * @returns {string} Tipo gramatical normalizado
     */
    static extractGrammaticalType(text) {
        if (!text) return '';

        const typeMap = {
            'noun': 'n',
            'verb': 'v',
            'adjective': 'adj',
            'adverb': 'adv',
            'preposition': 'prep',
            'conjunction': 'conj',
            'interjection': 'interj',
            'pronoun': 'pron',
            'article': 'art',
            'masculine': 'm',
            'feminine': 'f',
            'neuter': 'nt',
            'plural': 'pl',
            'singular': 'sg',
            'invariable': 'inv'
        };

        const normalized = text.toLowerCase().trim();

        // Buscar coincidencias exactas
        if (typeMap[normalized]) {
            return typeMap[normalized];
        }

        // Buscar coincidencias parciales
        for (const [key, value] of Object.entries(typeMap)) {
            if (normalized.includes(key)) {
                return value;
            }
        }

        return normalized;
    }

    /**
     * Divide texto en oraciones
     * @param {string} text - Texto a dividir
     * @returns {Array<string>} Array de oraciones
     */
    static splitIntoSentences(text) {
        if (!text) return [];

        return text
            .split(/[.!?]+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0);
    }
}

export class RateLimiter {
    constructor(requestsPerSecond = 1) {
        this.requestsPerSecond = requestsPerSecond;
        this.lastRequestTime = 0;
        this.queue = [];
        this.processing = false;
    }

    /**
     * Ejecuta una función con rate limiting
     * @param {Function} fn - Función a ejecutar
     * @returns {Promise} Resultado de la función
     */
    async execute(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            const minInterval = 1000 / this.requestsPerSecond;

            if (timeSinceLastRequest < minInterval) {
                await new Promise(resolve =>
                    setTimeout(resolve, minInterval - timeSinceLastRequest)
                );
            }

            const { fn, resolve, reject } = this.queue.shift();

            try {
                const result = await fn();
                resolve(result);
            } catch (error) {
                reject(error);
            }

            this.lastRequestTime = Date.now();
        }

        this.processing = false;
    }
}

export class ErrorHandler {
    /**
     * Maneja errores comunes de scraping
     * @param {Error} error - Error a manejar
     * @param {string} source - Fuente del error
     * @param {string} word - Palabra que se estaba procesando
     * @returns {Object} Objeto de error estandarizado
     */
    static handleScrapingError(error, source, word) {
        let errorType = 'unknown';
        let userMessage = 'Error desconocido';

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorType = 'network';
            userMessage = 'Error de conexión de red';
        } else if (error.response?.status === 404) {
            errorType = 'not-found';
            userMessage = 'Palabra no encontrada';
        } else if (error.response?.status === 429) {
            errorType = 'rate-limit';
            userMessage = 'Demasiadas solicitudes, intenta más tarde';
        } else if (error.response?.status >= 500) {
            errorType = 'server-error';
            userMessage = 'Error del servidor';
        } else if (error.message.includes('timeout')) {
            errorType = 'timeout';
            userMessage = 'Tiempo de espera agotado';
        }

        return {
            type: errorType,
            message: userMessage,
            originalError: error.message,
            source: source,
            word: word,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * HTTP Request utilities - Clean requests with robust CORS fallback
 */
export class RequestHandler {
    // Multiple CORS proxies for better reliability
    static CORS_PROXIES = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/',
        'https://api.codetabs.com/v1/proxy?quest='
    ];

    /**
     * Makes a simple HTTP request without headers, with CORS fallback for browsers
     * @param {string} url - Target URL
     * @param {Object} options - Request options (optional)
     * @returns {Promise<string>} Response HTML
     */
    static async makeRequest(url, options = {}) {
        const config = {
            timeout: options.timeout || 10000,
            ...options
        };

        // Check if running in browser environment
        if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
            // Browser environment - try CORS proxy for Linguee only
            if (url.includes('linguee.com')) {
                return await this.makeRequestWithCorsProxy(url, config);
            }
        }

        // Node.js environment or non-Linguee URLs - direct request
        const axios = await import('axios');
        const response = await axios.default.get(url, config);
        return response.data;
    }

    /**
     * Makes request through CORS proxy for browser environment with multiple fallbacks
     * @param {string} url - Target URL
     * @param {Object} config - Request config
     * @returns {Promise<string>} Response HTML
     */
    static async makeRequestWithCorsProxy(url, config) {
        const errors = [];
        
        // Try each CORS proxy
        for (const proxy of this.CORS_PROXIES) {
            try {
                const proxyUrl = proxy + encodeURIComponent(url);
                const axios = await import('axios');
                
                const response = await axios.default.get(proxyUrl, {
                    timeout: config.timeout || 15000,
                    headers: {
                        'Accept': 'application/json, text/plain, */*'
                    }
                });
                
                // Handle different proxy response formats
                let content = null;
                if (response.data && typeof response.data === 'object') {
                    // allorigins.win format
                    content = response.data.contents || response.data.data;
                } else if (typeof response.data === 'string') {
                    // Direct string response
                    content = response.data;
                }
                
                if (content) {
                    return content;
                }
                
                throw new Error('Invalid proxy response format');
            } catch (error) {
                errors.push(`${proxy}: ${error.message}`);
                continue;
            }
        }
        
        // If all proxies fail, throw error with details
        throw new Error(`All CORS proxies failed. Errors: ${errors.join('; ')}. Try running in Node.js environment for direct access.`);
    }
}

/**
 * Language validation and fallback utilities
 */
export class LanguageValidator {
    /**
     * Validates and normalizes language pair with fallbacks
     * @param {string} from - Source language
     * @param {string} to - Target language
     * @returns {Object} Normalized language pair or error
     */
    static validatePair(from, to) {
        const fromNormalized = LanguageCodes.normalize(from);
        const toNormalized = LanguageCodes.normalize(to);

        if (!fromNormalized) {
            return { 
                error: `Unsupported source language: ${from}. Try using ISO codes like 'en', 'es', 'fr'` 
            };
        }

        if (!toNormalized) {
            return { 
                error: `Unsupported target language: ${to}. Try using ISO codes like 'en', 'es', 'fr'` 
            };
        }

        return {
            from: fromNormalized,
            to: toNormalized,
            fromName: LanguageCodes.getName(fromNormalized),
            toName: LanguageCodes.getName(toNormalized)
        };
    }

    /**
     * Gets alternative language codes to try if first attempt fails
     * @param {string} code - Language code
     * @returns {Array<string>} Alternative codes to try
     */
    static getAlternatives(code) {
        const alternatives = [];
        const normalized = LanguageCodes.normalize(code);
        
        if (normalized) {
            alternatives.push(normalized);
            const data = LanguageCodes.codes[normalized];
            if (data.long) alternatives.push(data.long);
        }
        
        return [...new Set(alternatives)];
    }
}
