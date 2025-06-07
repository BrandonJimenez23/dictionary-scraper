// Utilidades comunes para todos los scrapers
export class LanguageCodes {
    static codes = {
        'en': { name: 'English', native: 'English' },
        'es': { name: 'Spanish', native: 'Español' },
        'fr': { name: 'French', native: 'Français' },
        'de': { name: 'German', native: 'Deutsch' },
        'it': { name: 'Italian', native: 'Italiano' },
        'pt': { name: 'Portuguese', native: 'Português' },
        'ru': { name: 'Russian', native: 'Русский' },
        'ar': { name: 'Arabic', native: 'العربية' },
        'zh': { name: 'Chinese', native: '中文' },
        'ja': { name: 'Japanese', native: '日本語' },
        'ko': { name: 'Korean', native: '한국어' },
        'nl': { name: 'Dutch', native: 'Nederlands' },
        'pl': { name: 'Polish', native: 'Polski' },
        'sv': { name: 'Swedish', native: 'Svenska' },
        'no': { name: 'Norwegian', native: 'Norsk' },
        'da': { name: 'Danish', native: 'Dansk' },
        'fi': { name: 'Finnish', native: 'Suomi' },
        'cs': { name: 'Czech', native: 'Čeština' },
        'ro': { name: 'Romanian', native: 'Română' },
        'tr': { name: 'Turkish', native: 'Türkçe' },
        'he': { name: 'Hebrew', native: 'עברית' },
        'hi': { name: 'Hindi', native: 'हिन्दी' },
        'th': { name: 'Thai', native: 'ไทย' },
        'vi': { name: 'Vietnamese', native: 'Tiếng Việt' },
        'el': { name: 'Greek', native: 'Ελληνικά' },
        'hu': { name: 'Hungarian', native: 'Magyar' },
        'bg': { name: 'Bulgarian', native: 'Български' },
        'hr': { name: 'Croatian', native: 'Hrvatski' },
        'sk': { name: 'Slovak', native: 'Slovenčina' },
        'sl': { name: 'Slovenian', native: 'Slovenščina' },
        'et': { name: 'Estonian', native: 'Eesti' },
        'lv': { name: 'Latvian', native: 'Latviešu' },
        'lt': { name: 'Lithuanian', native: 'Lietuvių' },
        'mt': { name: 'Maltese', native: 'Malti' }
    };

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
