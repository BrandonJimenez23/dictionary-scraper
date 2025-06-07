// Multi-Dictionary Scraper TypeScript Definitions
// Direct function exports - no class instantiation required

export interface TranslationMeaning {
  word: string;
  pos: string;
  sense: string;
}

export interface TranslationWord {
  word: string;
  pos: string;
}

export interface TranslationExample {
  phrase: string;
  translations: string[];
}

export interface Translation {
  word: TranslationWord;
  definition: string;
  meanings: TranslationMeaning[];
  examples: TranslationExample[];
}

export interface TranslationSection {
  title: string;
  translations: Translation[];
}

export interface DictionaryResult {
  inputWord: string;
  sections: TranslationSection[];
  audioLinks: string[];
  source?: string;
  timestamp?: string;
  error?: string;
  fromLang?: string;
  toLang?: string;
}

export interface MultiDictionaryResult {
  inputWord: string;
  fromLang: string;
  toLang: string;
  fromName: string;
  toName: string;
  dictionaries: Record<string, DictionaryResult | { error: string }>;
  timestamp: string;
}

export interface DictionaryInfo {
  name: string;
  languages: string[];
  features: string[];
  priority: number;
}

export interface LanguageSupport {
  supported: boolean;
  supportedBy: string[];
  normalizedFrom: string;
  normalizedTo: string;
  error?: string;
}

export interface TranslateOptions {
  timeout?: number;
  retries?: number;
}

// Direct function exports - no class instantiation needed

/**
 * Translates a word using WordReference dictionary
 * @param word Word to translate
 * @param from Source language (supports both 'en' and 'english' formats)
 * @param to Target language (supports both 'es' and 'spanish' formats)
 * @returns Promise with translation result
 */
export function translateWithWordReference(word: string, from: string, to: string): Promise<DictionaryResult>;

/**
 * Translates a word using Linguee dictionary
 * @param word Word to translate
 * @param from Source language (supports both 'en' and 'english' formats)
 * @param to Target language (supports both 'es' and 'spanish' formats)
 * @returns Promise with translation result
 */
export function translateWithLinguee(word: string, from: string, to: string): Promise<DictionaryResult>;

/**
 * Translates a word using a specific dictionary
 * @param dictionary Dictionary to use ('wordreference', 'wr', 'linguee', 'lg')
 * @param word Word to translate
 * @param from Source language
 * @param to Target language
 * @returns Promise with translation result
 */
export function translateWith(dictionary: string, word: string, from: string, to: string): Promise<DictionaryResult>;

/**
 * Translates a word using multiple dictionaries with fallback
 * @param word Word to translate
 * @param from Source language
 * @param to Target language
 * @param options Optional configuration
 * @returns Promise with combined results from multiple dictionaries
 */
export function translate(word: string, from: string, to: string, options?: TranslateOptions): Promise<MultiDictionaryResult>;

/**
 * Gets information about available dictionaries
 * @returns Dictionary information object
 */
export function getAvailableDictionaries(): Record<string, DictionaryInfo>;

/**
 * Gets supported language codes
 * @returns Array of supported language codes
 */
export function getSupportedLanguages(): string[];

/**
 * Normalizes language code (supports both short and long forms)
 * @param code Language code to normalize
 * @returns Normalized short code or null if not supported
 */
export function normalizeLanguageCode(code: string): string | null;

/**
 * Checks if a language pair is supported by any dictionary
 * @param from Source language
 * @param to Target language
 * @returns Support information
 */
export function checkLanguageSupport(from: string, to: string): LanguageSupport;

/**
 * Legacy main function for backward compatibility
 */
export function main(): Promise<void>;

export interface ModuleStats {
  totalDictionaries: number;
  totalLanguages: number;
  approximatePairs: number;
  dictionaries: Record<string, DictionaryInfo>;
}

export declare class MultiDictionaryScraper {
  constructor();
  
  /**
   * Gets the list of available dictionaries
   */
  getAvailableDictionaries(): Record<string, DictionaryInfo>;
  
  /**
   * Translates a word using a specific dictionary
   * @param dictionaryKey - Dictionary identifier ('wordreference' or 'linguee')
   * @param word - Word to translate
   * @param from - Source language code
   * @param to - Target language code
   */
  translate(dictionaryKey: string, word: string, from: string, to: string): Promise<DictionaryResult>;
  
  /**
   * Translates a word using multiple dictionaries
   * @param word - Word to translate
   * @param from - Source language
   * @param to - Target language
   * @param dictionaries - List of dictionaries to use
   */
  translateMultiple(word: string, from: string, to: string, dictionaries?: string[]): Promise<MultiDictionaryResult>;
  
  /**
   * Translates a word using the best available dictionary
   * @param word - Word to translate
   * @param from - Source language
   * @param to - Target language
   */
  translateAuto(word: string, from: string, to: string): Promise<DictionaryResult>;
  
  /**
   * Gets compatible dictionaries for a language pair
   * @param from - Source language
   * @param to - Target language
   */
  getCompatibleDictionaries(from: string, to: string): string[];
  
  /**
   * Checks if a language pair is supported
   * @param from - Source language
   * @param to - Target language
   */
  isLanguagePairSupported(from: string, to: string): boolean;
  
  /**
   * Gets comprehensive module statistics
   */
  getModuleStats(): ModuleStats;
}

export declare const scraper: MultiDictionaryScraper;

export declare function scrapeWordReference(word: string, from?: string, to?: string): Promise<DictionaryResult>;
export declare function scrapeLinguee(word: string, from?: string, to?: string): Promise<DictionaryResult>;
