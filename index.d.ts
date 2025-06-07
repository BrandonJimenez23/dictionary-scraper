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
}

export interface MultiDictionaryResult {
  inputWord: string;
  fromLang: string;
  toLang: string;
  results: Record<string, DictionaryResult>;
  timestamp: string;
}

export interface DictionaryInfo {
  name: string;
  languages: string[];
  features: string[];
  priority: number;
}

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
