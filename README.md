# Multi-Dictionary Scraper

[![npm version](https://badge.fury.io/js/multi-dictionary-scraper.svg)](https://badge.fury.io/js/multi-dictionary-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional npm module for scraping translations from multiple online dictionaries with a unified API. Currently supports **WordReference** and **Linguee** with automatic fallback and priority-based dictionary selection.

## 🌟 Features

- **Two Powerful Dictionaries**: WordReference and Linguee support
- **Unified API**: Single interface for both dictionaries
- **Automatic Fallback**: Priority-based dictionary selection
- **Language Pair Validation**: Automatic compatibility checking
- **Rich Translation Data**: Includes examples, audio links, grammatical information
- **Error Handling**: Robust error management with detailed feedback
- **TypeScript Ready**: Full TypeScript support (types included)

## 📦 Installation

```bash
npm install multi-dictionary-scraper
```

## 🚀 Quick Start

### Using WordReference

```javascript
import { MultiDictionaryScraper } from 'multi-dictionary-scraper';

const scraper = new MultiDictionaryScraper();

// Translate using WordReference
const result = await scraper.translate('wordreference', 'running', 'en', 'ru');
console.log(result);
```

### Using Linguee

```javascript
// Translate using Linguee for context-rich translations
const result = await scraper.translate('linguee', 'beautiful', 'en', 'es');
console.log(result);
```

### Auto Translation (Best Dictionary)

```javascript
// Automatically use the best available dictionary
const result = await scraper.translateAuto('house', 'en', 'es');
console.log(result);
```

### Multiple Dictionaries

```javascript
// Get translations from all compatible dictionaries
const results = await scraper.translateMultiple('beautiful', 'en', 'fr');
console.log(results);
```

## 📖 API Reference

### Core Methods

#### `translate(dictionaryKey, word, fromLang, toLang)`

Translates a word using a specific dictionary.

**Parameters:**
- `dictionaryKey` (string): Dictionary identifier ('wordreference' or 'linguee')
- `word` (string): Word to translate
- `fromLang` (string): Source language code (e.g., 'en', 'es', 'fr')
- `toLang` (string): Target language code

**Returns:** Promise<Object> - Translation result in standardized format

**Example:**
```javascript
const result = await scraper.translate('wordreference', 'fish', 'en', 'fr');
```

#### `translateAuto(word, fromLang, toLang)`

Automatically translates using the best available dictionary.

#### `translateMultiple(word, fromLang, toLang, dictionaries?)`

Translates using multiple dictionaries simultaneously.

#### `getAvailableDictionaries()`

Returns information about all available dictionaries.

#### `isLanguagePairSupported(fromLang, toLang)`

Checks if a language pair is supported.

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

```javascript
// Check language support
console.log(scraper.isLanguagePairSupported('en', 'es')); // true
console.log(scraper.isLanguagePairSupported('en', 'xyz')); // false

// Get compatible dictionaries for a language pair
const dictionaries = scraper.getCompatibleDictionaries('en', 'fr');
console.log(dictionaries); // ['wordreference', 'linguee']
```

## 🛠️ Error Handling

```javascript
try {
    const result = await scraper.translate('wordreference', 'nonexistentword', 'en', 'fr');
    if (result.error) {
        console.log('Translation failed:', result.error);
    } else {
        console.log('Success:', result);
    }
} catch (error) {
    console.error('Critical error:', error.message);
}
```

## 📈 Statistics

```javascript
const stats = scraper.getStats();
console.log(`Total dictionaries: ${stats.totalDictionaries}`);
console.log(`Total languages: ${stats.totalLanguages}`);
console.log(`Approximate language pairs: ${stats.approximatePairs}`);
```

## 🎯 Future Enhancements

### Potential Features

- **CLI Tool** - Command-line interface for quick translations
- **Additional Dictionary** - Possibility to add one more dictionary source
- **Performance Improvements** - Enhanced caching and optimization

## 🔧 Configuration

The scraper works out-of-the-box with default settings. Currently focused on reliability and simplicity.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Improve Existing Scrapers**: Enhance accuracy and robustness
2. **Add Language Support**: Extend language pair coverage  
3. **Documentation**: Improve docs and examples
4. **Testing**: Add comprehensive test coverage

### Development Setup

```bash
git clone https://github.com/yourusername/multi-dictionary-scraper.git
cd multi-dictionary-scraper
npm install
npm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/multi-dictionary-scraper)
- [GitHub Repository](https://github.com/yourusername/multi-dictionary-scraper)
- [Issue Tracker](https://github.com/yourusername/multi-dictionary-scraper/issues)
- [Documentation](https://github.com/yourusername/multi-dictionary-scraper/blob/main/README.md)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/multi-dictionary-scraper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/multi-dictionary-scraper/discussions)
- **Email**: your.email@example.com

---

**Made with ❤️ for the developer community**

*Helping developers build multilingual applications with reliable dictionary data*
