import { scrapeWordReference } from '../scrapers/wordreference.js';
import { MultiDictionaryScraper } from '../multi-scraper.js';

describe('Dictionary Scrapers Tests', () => {
  
  describe('WordReference Scraper', () => {
    test('should translate hello from English to Spanish', async () => {
      const result = await scrapeWordReference('hello', 'en', 'es');
      
      expect(result).toBeDefined();
      expect(result.inputWord).toBe('hello');
      expect(result.sections).toBeDefined();
      expect(Array.isArray(result.sections)).toBe(true);
      expect(result.sections.length).toBeGreaterThan(0);
    }, 10000);

    test('should handle non-existent words gracefully', async () => {
      const result = await scrapeWordReference('xyznonexistent', 'en', 'es');
      
      expect(result).toBeDefined();
      expect(result.inputWord).toBe('xyznonexistent');
      // Should return empty sections or error, but not crash
    }, 10000);

    test('should translate house from English to French', async () => {
      const result = await scrapeWordReference('house', 'en', 'fr');
      
      expect(result).toBeDefined();
      expect(result.inputWord).toBe('house');
      expect(result.sections).toBeDefined();
    }, 10000);
  });

  describe('Multi-Dictionary Scraper', () => {
    let scraper;

    beforeAll(() => {
      scraper = new MultiDictionaryScraper();
    });

    test('should return available dictionaries', () => {
      const dictionaries = scraper.getAvailableDictionaries();
      
      expect(dictionaries).toBeDefined();
      expect(dictionaries.wordreference).toBeDefined();
      expect(dictionaries.wordreference.name).toBe('WordReference');
      expect(Array.isArray(dictionaries.wordreference.languages)).toBe(true);
    });

    test('should check language pair support', () => {
      expect(scraper.isLanguagePairSupported('en', 'es')).toBe(true);
      expect(scraper.isLanguagePairSupported('en', 'xyz')).toBe(false);
      expect(scraper.isLanguagePairSupported('xyz', 'abc')).toBe(false);
    });

    test('should get compatible dictionaries for language pair', () => {
      const compatible = scraper.getCompatibleDictionaries('en', 'es');
      
      expect(Array.isArray(compatible)).toBe(true);
      expect(compatible.length).toBeGreaterThan(0);
      expect(compatible).toContain('wordreference');
    });

    test('should translate using specific dictionary', async () => {
      const result = await scraper.translate('hello', 'en', 'es', 'wordreference');
      
      expect(result).toBeDefined();
      expect(result.source).toBe('wordreference');
      expect(result.inputWord).toBe('hello');
      expect(result.timestamp).toBeDefined();
    }, 10000);

    test('should handle auto translation', async () => {
      const result = await scraper.translateAuto('beautiful', 'en', 'es');
      
      expect(result).toBeDefined();
      expect(result.inputWord).toBe('beautiful');
      expect(result.source).toBeDefined();
    }, 10000);

    test('should return stats', () => {
      const stats = scraper.getStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalDictionaries).toBe('number');
      expect(typeof stats.totalLanguages).toBe('number');
      expect(stats.dictionaries).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid language codes', async () => {
      const scraper = new MultiDictionaryScraper();
      
      await expect(
        scraper.translate('hello', 'invalid', 'es', 'wordreference')
      ).rejects.toThrow();
    });

    test('should handle invalid dictionary name', async () => {
      const scraper = new MultiDictionaryScraper();
      
      await expect(
        scraper.translate('hello', 'en', 'es', 'invalid-dictionary')
      ).rejects.toThrow();
    });
  });
});

// Helper function for integration tests
export async function runIntegrationTests() {
  console.log('🧪 Running Integration Tests...\n');

  const testCases = [
    { word: 'hello', from: 'en', to: 'es', expected: 'hola' },
    { word: 'house', from: 'en', to: 'fr', expected: 'maison' },
    { word: 'beautiful', from: 'en', to: 'de', expected: 'schön' },
  ];

  const scraper = new MultiDictionaryScraper();
  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.word} (${test.from} → ${test.to})`);
      const result = await scraper.translateAuto(test.word, test.from, test.to);
      
      if (result && !result.error && result.sections && result.sections.length > 0) {
        console.log(`✅ SUCCESS: Found ${result.sections.length} sections`);
        passed++;
      } else {
        console.log(`❌ FAILED: ${result.error || 'No translations found'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}
