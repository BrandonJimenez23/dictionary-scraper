// Multi-Dictionary Scraper - Usage Examples with Direct Functions
// NEW API: No class instantiation required!

import { 
  translate,
  translateWithWordReference,
  translateWithLinguee,
  translateWith,
  getAvailableDictionaries,
  getSupportedLanguages,
  checkLanguageSupport,
  normalizeLanguageCode
} from './index.js';

console.log('🌍 Multi-Dictionary Scraper - Direct Function Examples\n');

// Show available dictionaries
console.log('📚 Available dictionaries:');
console.log(JSON.stringify(getAvailableDictionaries(), null, 2));

console.log('\n📋 Supported languages:');
console.log(getSupportedLanguages().slice(0, 10), '... and more');

console.log('\n' + '='.repeat(60) + '\n');

// Test language code normalization (supports both short and long codes)
console.log('🔄 Language code normalization examples:');
console.log('normalize("english"):', normalizeLanguageCode("english"));
console.log('normalize("spanish"):', normalizeLanguageCode("spanish"));
console.log('normalize("en"):', normalizeLanguageCode("en"));
console.log('normalize("es"):', normalizeLanguageCode("es"));

console.log('\n' + '='.repeat(60) + '\n');

// Check language support
console.log('✅ Language pair support check:');
const support = checkLanguageSupport('english', 'spanish');
console.log('English to Spanish:', JSON.stringify(support, null, 2));

console.log('\n' + '='.repeat(60) + '\n');

// Test WordReference with long language codes
console.log('🔍 WordReference translation (using long language codes):');
try {
  const wrResult = await translateWithWordReference('hello', 'english', 'spanish');
  console.log(JSON.stringify(wrResult, null, 2));
} catch (error) {
  console.error('WordReference Error:', error.message);
}

console.log('\n' + '='.repeat(60) + '\n');

// Test specific dictionary with short function
console.log('📖 Using translateWith function (short syntax):');
try {
  const specificResult = await translateWith('wr', 'fish', 'en', 'fr');
  console.log(JSON.stringify(specificResult, null, 2));
} catch (error) {
  console.error('Specific dictionary error:', error.message);
}

console.log('\n' + '='.repeat(60) + '\n');

// Test multiple dictionaries with fallback
console.log('🌐 Multi-dictionary translation with CORS handling:');
try {
  const multiResult = await translate('house', 'en', 'es');
  console.log(JSON.stringify(multiResult, null, 2));
} catch (error) {
  console.error('Multi-dictionary error:', error.message);
}

console.log('\n' + '='.repeat(60) + '\n');

// Test CORS-safe translation (simulates frontend usage)
console.log('🌐 CORS-safe frontend example:');
try {
  const corsResult = await translate('computer', 'english', 'french');
  console.log('Frontend-safe result keys:', Object.keys(corsResult));
  console.log('Available dictionaries in result:', Object.keys(corsResult.dictionaries));
} catch (error) {
  console.error('CORS handling error:', error.message);
}

console.log('\n' + '='.repeat(60) + '\n');

// Test language pair support verification
console.log('✅ Language pair support verification:');
const testPairs = [
  ['en', 'es'],
  ['fr', 'de'], 
  ['english', 'korean'],
  ['en', 'xyz']
];

testPairs.forEach(([from, to]) => {
  const support = checkLanguageSupport(from, to);
  console.log(`${from} → ${to}: ${support.supported ? '✅' : '❌'} (${support.supported ? support.supportedBy.length : 0} dictionaries: ${support.supportedBy || []})`);
  if (support.error) {
    console.log(`  Error: ${support.error}`);
  }
});

console.log('\n' + '='.repeat(60) + '\n');

// Show module statistics
console.log('📊 Module statistics:');
const stats = {
  totalLanguages: getSupportedLanguages().length,
  availableDictionaries: Object.keys(getAvailableDictionaries()).length,
  sampleLanguages: getSupportedLanguages().slice(0, 5),
  dictionaryFeatures: Object.entries(getAvailableDictionaries()).map(([key, dict]) => ({
    name: dict.name,
    languages: dict.languages.length,
    features: dict.features.length
  }))
};
console.log(JSON.stringify(stats, null, 2));
