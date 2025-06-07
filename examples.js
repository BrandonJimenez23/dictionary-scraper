// Multi-Dictionary Scraper - Usage Examples
import { MultiDictionaryScraper } from './multi-scraper.js';

const scraper = new MultiDictionaryScraper();

console.log('🌍 Multi-Dictionary Scraper - Usage Examples\n');

// Show available dictionaries
console.log('📚 Available dictionaries:');
console.log(JSON.stringify(scraper.getAvailableDictionaries(), null, 2));

console.log('\n' + '='.repeat(50) + '\n');

// Test specific dictionary translation with new API format
console.log('🔍 Specific dictionary translation (WordReference):');
try {
  const specificResult = await scraper.translate('wordreference', 'fish', 'en', 'fr');
  console.log(JSON.stringify(specificResult, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test multiple dictionaries
console.log('📖 Multiple dictionary translation (all available dictionaries):');
try {
  const multipleResult = await scraper.translateMultiple('house', 'en', 'es');
  console.log(JSON.stringify(multipleResult, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test auto translation (best dictionary)
console.log('🎯 Auto translation (best dictionary):');
try {
  const autoResult = await scraper.translateAuto('beautiful', 'en', 'fr');
  console.log(JSON.stringify(autoResult, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test language pair support
console.log('✅ Language pair support verification:');
const testPairs = [
  ['en', 'es'],
  ['fr', 'de'], 
  ['ja', 'ko'],
  ['en', 'xyz']
];

testPairs.forEach(([from, to]) => {
  const compatible = scraper.getCompatibleDictionaries(from, to);
  const supported = scraper.isLanguagePairSupported(from, to);
  console.log(`${from} → ${to}: ${supported ? '✅' : '❌'} (${compatible.length} dictionaries: ${compatible.join(', ')})`);
});

console.log('\n' + '='.repeat(50) + '\n');

// Show module statistics
console.log('📊 Module statistics:');
console.log(JSON.stringify(scraper.getStats(), null, 2));
