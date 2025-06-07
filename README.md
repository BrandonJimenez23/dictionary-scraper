# Multi-Dictionary Scraper

[![npm version](https://badge.fury.io/js/multi-dictionary-scraper.svg)](https://badge.fury.io/js/multi-dictionary-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful npm module for scraping translations from multiple online dictionaries with a unified API. **Now with direct function exports - no class instantiation required!** Supports **WordReference** and **Linguee** with automatic CORS handling for seamless frontend integration.

## 🌟 Key Features (v1.1.0)

- **🚀 Direct Function Exports**: No more class instantiation - import and use functions directly!
- **🌐 CORS Support**: Works seamlessly in React, Vue, Angular and other frontend frameworks  
- **🔄 Flexible Language Codes**: Supports both short (`'en'`) and long (`'english'`) language codes with automatic normalization
- **🛡️ Automatic Fallback**: Multiple CORS proxy strategies for maximum compatibility
- **📱 Frontend Ready**: Designed specifically for modern web applications
- **🔧 TypeScript Support**: Full TypeScript definitions included
- **⚡ Performance Optimized**: Smart caching and error handling

## 📦 Installation

```bash
npm install multi-dictionary-scraper
```

## 🚀 Quick Start (New Function-Based API)

### Simple Translation (No Class Needed!)

```javascript
import { translate } from 'multi-dictionary-scraper';

// Multi-dictionary translation with automatic fallback
const result = await translate('hello', 'english', 'spanish');
console.log(result);

// Works with short codes too!
const result2 = await translate('hello', 'en', 'es');
```

### Specific Dictionary Translation

```javascript
import { 
  translateWithWordReference, 
  translateWithLinguee,
  translateWith 
} from 'multi-dictionary-scraper';

// WordReference translation
const wrResult = await translateWithWordReference('running', 'en', 'ru');

// Linguee translation  
const lgResult = await translateWithLinguee('beautiful', 'en', 'es');

// Generic function with dictionary selection
const specificResult = await translateWith('wr', 'fish', 'en', 'fr');
```

### Language Code Normalization

```javascript
import { normalizeLanguageCode, checkLanguageSupport } from 'multi-dictionary-scraper';

// Supports both formats
console.log(normalizeLanguageCode('english')); // 'en'
console.log(normalizeLanguageCode('spanish')); // 'es' 
console.log(normalizeLanguageCode('en'));      // 'en'

// Check language pair support
const support = checkLanguageSupport('english', 'spanish');
console.log(support.supported);    // true
console.log(support.supportedBy);  // ['wordreference', 'linguee']
```

### Frontend-Safe Usage (React Example)

```javascript
import { translate, checkLanguageSupport } from 'multi-dictionary-scraper';
import { useState } from 'react';

function TranslationComponent() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleTranslate = async () => {
    setLoading(true);
    try {
      // Check language support first
      const support = checkLanguageSupport('english', 'spanish');
      if (!support.supported) {
        console.error(support.error);
        return;
      }
      
      // Translate with automatic CORS handling
      const translation = await translate('hello', 'english', 'spanish');
      setResult(translation);
    } catch (error) {
      console.error('Translation failed:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? 'Translating...' : 'Translate'}
      </button>
      {result && (
        <div>
          <h3>Results from {Object.keys(result.dictionaries).length} dictionaries:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### Error Handling and Validation

```javascript
import { translate, checkLanguageSupport } from 'multi-dictionary-scraper';

async function safeTranslation(word, from, to) {
  try {
    // Validate language pair first
    const support = checkLanguageSupport(from, to);
    if (!support.supported) {
      throw new Error(`Language pair ${from}-${to} not supported: ${support.error}`);
    }
    
    // Attempt translation
    const result = await translate(word, from, to);
    
    // Check if any dictionaries succeeded
    const successfulDictionaries = Object.entries(result.dictionaries)
      .filter(([_, dict]) => !dict.error);
      
    if (successfulDictionaries.length === 0) {
      throw new Error('No dictionaries returned successful results');
    }
    
    return result;
  } catch (error) {
    console.error('Translation error:', error.message);
    throw error;
  }
}
```

## 📖 API Reference

### Core Translation Functions

#### `translate(word, from, to, options?)`

Main function that translates using multiple dictionaries with automatic fallback and CORS handling.

**Parameters:**
- `word` (string): Word to translate
- `from` (string): Source language ('en', 'english', 'es', 'spanish', etc.)
- `to` (string): Target language ('en', 'english', 'es', 'spanish', etc.)  
- `options` (object, optional): Configuration options
  - `timeout` (number): Request timeout in milliseconds
  - `retries` (number): Number of retry attempts

**Returns:** `Promise<MultiDictionaryResult>` - Combined results from all compatible dictionaries

**Example:**
```javascript
const result = await translate('hello', 'english', 'spanish');
// Result contains translations from all available dictionaries
console.log(result.dictionaries.wordreference);
console.log(result.dictionaries.linguee);
```

#### `translateWithWordReference(word, from, to)`

Direct translation using WordReference dictionary only.

**Parameters:**
- `word` (string): Word to translate
- `from` (string): Source language code
- `to` (string): Target language code

**Returns:** `Promise<DictionaryResult>` - WordReference-specific result

**Example:**
```javascript
const result = await translateWithWordReference('fish', 'en', 'fr');
```

#### `translateWithLinguee(word, from, to)`

Direct translation using Linguee dictionary only.

**Parameters:**
- `word` (string): Word to translate  
- `from` (string): Source language code
- `to` (string): Target language code

**Returns:** `Promise<DictionaryResult>` - Linguee-specific result

**Example:**
```javascript
const result = await translateWithLinguee('beautiful', 'en', 'es');
```

#### `translateWith(dictionary, word, from, to)`

Generic function to translate using a specific dictionary.

**Parameters:**
- `dictionary` (string): Dictionary identifier:
  - `'wordreference'` or `'wr'` for WordReference
  - `'linguee'` or `'lg'` for Linguee
- `word` (string): Word to translate
- `from` (string): Source language code  
- `to` (string): Target language code

**Returns:** `Promise<DictionaryResult>` - Dictionary-specific result

**Example:**
```javascript
const result = await translateWith('wr', 'house', 'en', 'es');
```

### Language Support Functions

#### `normalizeLanguageCode(code)`

Normalizes language codes to standard short format. Supports both short ('en') and long ('english') formats.

**Parameters:**
- `code` (string): Language code to normalize

**Returns:** `string | null` - Normalized short code or null if not supported

**Example:**
```javascript
console.log(normalizeLanguageCode('english')); // 'en'
console.log(normalizeLanguageCode('spanish')); // 'es'
console.log(normalizeLanguageCode('en'));      // 'en'
console.log(normalizeLanguageCode('xyz'));     // null
```

#### `checkLanguageSupport(from, to)`

Checks if a language pair is supported and by which dictionaries.

**Parameters:**
- `from` (string): Source language code
- `to` (string): Target language code

**Returns:** `LanguageSupport` object with:
- `supported` (boolean): Whether the pair is supported
- `supportedBy` (string[]): Array of dictionary names that support this pair
- `normalizedFrom` (string): Normalized source language code
- `normalizedTo` (string): Normalized target language code  
- `error` (string, optional): Error message if not supported

**Example:**
```javascript
const support = checkLanguageSupport('english', 'spanish');
console.log(support.supported);    // true
console.log(support.supportedBy);  // ['wordreference', 'linguee']
```

### Utility Functions

#### `getAvailableDictionaries()`

Returns information about all available dictionaries.

**Returns:** `Record<string, DictionaryInfo>` - Dictionary information

**Example:**
```javascript
const dictionaries = getAvailableDictionaries();
console.log(dictionaries.wordreference.name);
console.log(dictionaries.wordreference.languages);
```

#### `getSupportedLanguages()`

Gets all supported language codes.

**Returns:** `string[]` - Array of supported language codes

**Example:**
```javascript
const languages = getSupportedLanguages();
console.log(languages); // ['en', 'es', 'fr', 'de', 'it', ...]
```

## 🌐 CORS Handling

This module includes robust CORS handling for frontend applications. When a CORS error is detected, it automatically attempts to use multiple proxy services:

- **allorigins.win** - Primary proxy service
- **corsproxy.io** - Secondary proxy service  
- **cors-anywhere.herokuapp.com** - Backup proxy service
- **thingproxy.freeboard.io** - Final fallback proxy

### CORS Error Detection

The module automatically detects CORS errors and switches to proxy mode:

```javascript
// This will automatically handle CORS errors in browser environments
const result = await translate('hello', 'en', 'es');
```

### Manual CORS Configuration

For advanced users, you can check the internal CORS handling:

```javascript
import { translate } from 'multi-dictionary-scraper';

try {
  const result = await translate('word', 'en', 'es');
  // Check if CORS proxies were used
  console.log('Success with CORS handling');
} catch (error) {
  if (error.message.includes('CORS')) {
    console.log('All CORS proxy attempts failed');
  }
}
```

## 🔄 Legacy API Support

For backward compatibility, the class-based API is still available:

```javascript
import { MultiDictionaryScraper } from 'multi-dictionary-scraper/legacy';

const scraper = new MultiDictionaryScraper();

// Legacy methods
const result = await scraper.translate('wordreference', 'fish', 'en', 'fr');
const multiple = await scraper.translateMultiple('beautiful', 'en', 'fr');
const auto = await scraper.translateAuto('house', 'en', 'es');

// Legacy utility methods
console.log(scraper.getAvailableDictionaries());
console.log(scraper.isLanguagePairSupported('en', 'es'));
console.log(scraper.getCompatibleDictionaries('en', 'fr'));
```

## 📊 Data Structures

### MultiDictionaryResult

Result from the main `translate()` function:

```typescript
interface MultiDictionaryResult {
  inputWord: string;
  fromLang: string;
  toLang: string;
  fromName: string;      // Full language name
  toName: string;        // Full language name
  dictionaries: Record<string, DictionaryResult | { error: string }>;
  timestamp: string;
}
```

### DictionaryResult

Result from individual dictionary functions:

```typescript
interface DictionaryResult {
  inputWord: string;
  sections: TranslationSection[];
  audioLinks: string[];
  source?: string;
  timestamp?: string;
  error?: string;
  fromLang?: string;
  toLang?: string;
}
```

### TranslationSection

Individual translation sections:

```typescript
interface TranslationSection {
  title: string;
  translations: Translation[];
}

interface Translation {
  word: TranslationWord;
  definition: string;
  meanings: TranslationMeaning[];
  examples: TranslationExample[];
}
```

## 📊 Dictionary Output Examples

### WordReference Output Structure

WordReference provides detailed grammatical information and audio pronunciation links:

```json
{
    "inputWord": "running",
    "sections": [
        {
            "title": "Главные переводы",
            "translations": [
                {
                    "word": {
                        "word": "running",
                        "pos": "n"
                    },
                    "definition": "",
                    "meanings": [
                        {
                            "word": "бег",
                            "pos": "м",
                            "sense": ""
                        }
                    ],
                    "examples": []
                }
            ]
        },
        {
            "title": "Дополнительные переводы",
            "translations": [...]
        }
    ],
    "audioLinks": [
        "https://www.wordreference.com/audio/en/us/us/en034319.mp3"
    ],
    "source": "wordreference",
    "timestamp": "2025-06-07T18:13:23.577Z"
}
```

### Linguee Output Structure

Linguee specializes in context-rich translations with real-world usage examples:

```json
{
    "inputWord": "beautiful",
    "sections": [
        {
            "title": "Translations",
            "translations": [
                {
                    "word": {
                        "word": "beautiful",
                        "pos": "adj"
                    },
                    "definition": "",
                    "meanings": [
                        {
                            "word": "hermoso",
                            "pos": "adj",
                            "sense": ""
                        }
                    ],
                    "examples": [
                        {
                            "phrase": "a beautiful landscape",
                            "translations": [
                                "un paisaje hermoso"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "audioLinks": [],
    "source": "linguee",
    "timestamp": "2025-06-07T18:13:23.577Z"
}
```

## 🌍 Supported Languages

### WordReference
English, Spanish, French, German, Italian, Portuguese, Russian, Arabic, Chinese, Japanese, Korean, Dutch, Swedish, Norwegian, Danish, Polish, Czech, Romanian, Turkish, Hebrew, Hindi, Thai, Vietnamese

### Linguee  
English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Swedish, Danish, Finnish, Greek, Hungarian, Slovenian, Latvian, Lithuanian, Estonian, Maltese, Slovak, Bulgarian, Romanian, Croatian, Czech

## 🔄 Language Pair Examples

### Checking Language Support

```javascript
import { checkLanguageSupport, getSupportedLanguages } from 'multi-dictionary-scraper';

// Check specific language pairs
const testPairs = [
  ['en', 'es'],           // English to Spanish
  ['english', 'french'],  // Long format codes
  ['fr', 'de'],           // French to German
  ['en', 'ru'],           // English to Russian
  ['ja', 'en'],           // Japanese to English
  ['en', 'xyz']           // Invalid pair
];

testPairs.forEach(([from, to]) => {
  const support = checkLanguageSupport(from, to);
  console.log(`${from} → ${to}: ${support.supported ? '✅' : '❌'}`);
  if (support.supported) {
    console.log(`  Supported by: ${support.supportedBy.join(', ')}`);
  } else {
    console.log(`  Error: ${support.error}`);
  }
});

// Get all supported languages
console.log('All supported languages:', getSupportedLanguages());
```

### Language Code Normalization Examples

```javascript
import { normalizeLanguageCode } from 'multi-dictionary-scraper';

const testCodes = [
  'english', 'spanish', 'french', 'german',
  'en', 'es', 'fr', 'de',
  'English', 'SPANISH', 'invalid'
];

testCodes.forEach(code => {
  const normalized = normalizeLanguageCode(code);
  console.log(`'${code}' → '${normalized}'`);
});
```

## 🔧 Configuration Options

### Translation Options

The main `translate()` function accepts configuration options:

```javascript
import { translate } from 'multi-dictionary-scraper';

const options = {
  timeout: 10000,    // 10 second timeout (default: 5000)
  retries: 3         // 3 retry attempts (default: 2)
};

const result = await translate('word', 'en', 'es', options);
```

### Environment Detection

The module automatically detects browser vs Node.js environments:

```javascript
// In browser: automatically uses CORS proxies
// In Node.js: makes direct requests
const result = await translate('word', 'en', 'es');
```

## 🛠️ Error Handling

The new API provides comprehensive error handling with detailed error messages:

```javascript
import { translate, checkLanguageSupport } from 'multi-dictionary-scraper';

try {
  // Always validate language support first
  const support = checkLanguageSupport('en', 'xyz');
  if (!support.supported) {
    console.error('Language pair not supported:', support.error);
    return;
  }
  
  const result = await translate('nonexistentword', 'en', 'fr');
  
  // Check individual dictionary results
  Object.entries(result.dictionaries).forEach(([dictName, dictResult]) => {
    if (dictResult.error) {
      console.log(`${dictName} failed:`, dictResult.error);
    } else {
      console.log(`${dictName} succeeded with ${dictResult.sections.length} sections`);
    }
  });
  
} catch (error) {
  // Handle critical errors
  if (error.message.includes('CORS')) {
    console.error('CORS error - all proxy attempts failed:', error.message);
  } else if (error.message.includes('timeout')) {
    console.error('Request timeout:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Error Types

- **Language Support Errors**: Invalid or unsupported language codes
- **CORS Errors**: Network restrictions in browser environments  
- **Timeout Errors**: Request timeouts (configurable)
- **Network Errors**: Connection issues or service unavailability
- **Parsing Errors**: Issues with dictionary response parsing

## 📈 Module Statistics

Get comprehensive information about the module capabilities:

```javascript
import { 
  getAvailableDictionaries, 
  getSupportedLanguages,
  checkLanguageSupport 
} from 'multi-dictionary-scraper';

// Get module statistics
const stats = {
  totalDictionaries: Object.keys(getAvailableDictionaries()).length,
  totalLanguages: getSupportedLanguages().length,
  dictionariesInfo: getAvailableDictionaries(),
  sampleLanguagePairs: [
    checkLanguageSupport('en', 'es'),
    checkLanguageSupport('fr', 'de'),
    checkLanguageSupport('en', 'ru')
  ]
};

console.log('Module Statistics:', JSON.stringify(stats, null, 2));
```

## 🎯 Advanced Usage

### TypeScript Support

Full TypeScript definitions are included:

```typescript
import { 
  translate, 
  translateWithWordReference,
  MultiDictionaryResult,
  DictionaryResult,
  LanguageSupport 
} from 'multi-dictionary-scraper';

async function typedTranslation(word: string, from: string, to: string): Promise<MultiDictionaryResult> {
  const result: MultiDictionaryResult = await translate(word, from, to);
  return result;
}

// Type-safe language checking
const support: LanguageSupport = checkLanguageSupport('en', 'es');
```

### Batch Translations

Process multiple words efficiently:

```javascript
import { translate } from 'multi-dictionary-scraper';

async function batchTranslate(words, from, to) {
  const results = await Promise.allSettled(
    words.map(word => translate(word, from, to))
  );
  
  return results.map((result, index) => ({
    word: words[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
}

// Usage
const words = ['hello', 'world', 'beautiful'];
const results = await batchTranslate(words, 'en', 'es');
```

### Performance Optimization

For high-volume usage:

```javascript
import { checkLanguageSupport, translate } from 'multi-dictionary-scraper';

// Cache language support checks
const supportCache = new Map();

async function optimizedTranslate(word, from, to) {
  const cacheKey = `${from}-${to}`;
  
  if (!supportCache.has(cacheKey)) {
    supportCache.set(cacheKey, checkLanguageSupport(from, to));
  }
  
  const support = supportCache.get(cacheKey);
  if (!support.supported) {
    throw new Error(`Language pair not supported: ${support.error}`);
  }
  
  return await translate(word, from, to);
}
```

## 🎯 Future Enhancements

### Planned Features

- **🔍 Additional Dictionaries**: Cambridge, Oxford, and specialized dictionaries
- **💾 Built-in Caching**: Intelligent caching for repeated translations
- **🚀 Performance Improvements**: Enhanced request optimization and batching
- **📱 Mobile Optimization**: React Native and mobile-specific features
- **🔧 CLI Tool**: Command-line interface for quick translations
- **📊 Analytics**: Usage statistics and performance metrics
- **🌐 Offline Support**: Cached translations for offline use

### Community Requests

- **Audio Pronunciation**: Enhanced audio support with IPA transcriptions
- **Translation Confidence**: Scoring system for translation quality
- **Custom Dictionaries**: Plugin system for adding custom dictionary sources
- **Translation History**: Built-in history and favorites management

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### 🔧 Development Areas

1. **Improve Existing Scrapers**: Enhance accuracy and robustness
2. **Add Dictionary Support**: Integrate new dictionary sources
3. **Language Support**: Extend language pair coverage  
4. **Frontend Integration**: Improve React/Vue/Angular support
5. **Documentation**: Improve docs and create tutorials
6. **Testing**: Add comprehensive test coverage
7. **Performance**: Optimize speed and memory usage

### 🚀 Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/multi-dictionary-scraper.git
cd multi-dictionary-scraper

# Install dependencies
npm install

# Run tests
npm test

# Run examples
node examples.js

# Test specific functionality
node test-wr.js
```

### 📝 Contribution Guidelines

1. **Fork & Clone**: Fork the repo and create a feature branch
2. **Code Style**: Follow existing code formatting and style
3. **Testing**: Add tests for new features
4. **Documentation**: Update README and JSDoc comments
5. **Commit Messages**: Use clear, descriptive commit messages
6. **Pull Request**: Submit PR with detailed description

### 🐛 Bug Reports

When reporting bugs, please include:

- Node.js/Browser version
- Operating system
- Code snippet that reproduces the issue
- Expected vs actual behavior
- Error messages and stack traces

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/multi-dictionary-scraper)
- [GitHub Repository](https://github.com/yourusername/multi-dictionary-scraper)
- [Issue Tracker](https://github.com/yourusername/multi-dictionary-scraper/issues)
- [Documentation](https://github.com/yourusername/multi-dictionary-scraper/blob/main/README.md)

## 📞 Support & Community

### 🆘 Getting Help

- **📖 Documentation**: Start with this README and the examples
- **🐛 Bug Reports**: Use GitHub Issues for bug reports
- **💡 Feature Requests**: Submit feature requests via GitHub Issues
- **💬 Questions**: Use GitHub Discussions for general questions
- **📧 Email**: brandon23jimenez3@gmail.com (for business inquiries)

### 🌟 Show Your Support

If this project helps you, please consider:

- ⭐ **Star the repository** on GitHub
- 🐛 **Report bugs** and suggest improvements
- 📝 **Contribute** code or documentation
- 📢 **Share** with other developers
- 💬 **Join** the community discussions

## 📊 Project Stats

- **📦 Version**: 1.1.0
- **📝 License**: MIT
- **🔧 Node.js**: >= 14.0.0
- **📱 Browser**: Modern browsers with ES6+ support
- **🌍 Languages**: 50+ supported languages
- **📚 Dictionaries**: 2 active dictionary sources
- **🚀 CORS**: Full frontend support

---

**Made with ❤️ for the developer community**

*Empowering developers to build multilingual applications with reliable, accessible dictionary data*
