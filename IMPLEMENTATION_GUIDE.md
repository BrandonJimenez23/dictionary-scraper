# Implementation Guide for New Dictionaries

This guide will help you add support for new dictionaries to the multi-dictionary module.

## Basic Structure

Each scraper should follow this basic structure:

```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeNewDictionary(word, from = 'en', to = 'es') {
  const url = buildURL(word, from, to);

  try {
    const { data } = await axios.get(url, {
      headers: getHeaders()
    });

    return processHTML(data, word, from, to);
  } catch (error) {
    return handleError(error, word, from, to);
  }
}
```

## Implementation Steps

### 1. Website Analysis

Before starting, analyze:

- **URL Pattern**: How are search URLs constructed?
- **HTML Structure**: Where are translations located in the DOM?
- **Rate Limiting**: Are there request limits?
- **User-Agent**: Does it require specific headers?

### 2. Create the Scraper

```javascript
// scrapers/new-dictionary.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { TextProcessor, ErrorHandler } from '../utils/common.js';

export async function scrapeNewDictionary(word, from, to) {
  // Validate input
  if (!word || !from || !to) {
    throw new Error('Required parameters: word, from, to');
  }

  // Build URL
  const url = `https://dictionary.example.com/${from}-${to}/${encodeURIComponent(word)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DictionaryBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    return processHTML(response.data, word, from, to);
  } catch (error) {
    return ErrorHandler.handleScrapingError(error, 'new-dictionary', word);
  }
}

function processHTML(html, word, from, to) {
  const $ = cheerio.load(html);
  
  const result = {
    source: 'new-dictionary',
    inputWord: word,
    fromLang: from,
    toLang: to,
    translations: [],
    // Other dictionary-specific fields
  };

  // Extract translations
  $('.translation-item').each((index, element) => {
    const $item = $(element);
    
    const translation = {
      text: TextProcessor.cleanText($item.find('.translation-text').text()),
      type: TextProcessor.extractGrammaticalType($item.find('.type').text()),
      // Other specific fields
    };

    if (translation.text) {
      result.translations.push(translation);
    }
  });

  return result;
}

// Validation function (optional)
export function isLanguagePairSupported(from, to) {
  const supportedLanguages = ['en', 'es', 'fr', 'de'];
  return supportedLanguages.includes(from) && 
         supportedLanguages.includes(to) && 
         from !== to;
}
```

### 3. Add to MultiDictionaryScraper

```javascript
// In multi-scraper.js
import { scrapeNewDictionary, isLanguagePairSupported as isNewSupported } from './scrapers/new-dictionary.js';

// Add to constructor
this.dictionaries.newDictionary = {
  name: 'New Dictionary',
  scraper: scrapeNewDictionary,
  languages: ['en', 'es', 'fr', 'de'],
  features: ['basic-translation', 'grammatical-types'],
  priority: 4,
  validator: isNewSupported
};
```

### 4. Create Tests

```javascript
// tests/new-dictionary.test.js
import { scrapeNewDictionary } from '../scrapers/new-dictionary.js';

async function testNewDictionary() {
  console.log('Testing New Dictionary...');
  
  const testCases = [
    { word: 'hello', from: 'en', to: 'es' },
    { word: 'house', from: 'en', to: 'fr' },
  ];

  for (const test of testCases) {
    try {
      const result = await scrapeNewDictionary(test.word, test.from, test.to);
      console.log(`✅ ${test.word} (${test.from}→${test.to}):`, result.translations.length, 'translations');
    } catch (error) {
      console.log(`❌ ${test.word} (${test.from}→${test.to}):`, error.message);
    }
  }
}

testNewDictionary();
```

## Standard JSON Formats

### Basic Structure

```json
{
  "source": "dictionary-name",
  "inputWord": "word",
  "fromLang": "en",
  "toLang": "es",
  "translations": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### For Dictionaries with Examples

```json
{
  "translations": [
    {
      "text": "translation",
      "type": "n",
      "examples": [
        {
          "source": "Source example",
          "target": "Translated example"
        }
      ]
    }
  ]
}
```

### For Dictionaries with Pronunciation

```json
{
  "pronunciation": {
    "ipa": "/həˈloʊ/",
    "audio": ["https://example.com/audio.mp3"]
  }
}
```

### For Dictionaries with Frequency

```json
{
  "translations": [
    {
      "text": "translation",
      "frequency": "high|medium|low",
      "verified": true
    }
  ]
}
```

## Best Practices

### 1. Robust Error Handling

```javascript
try {
  // Scraping code
} catch (error) {
  if (error.response?.status === 404) {
    return { error: 'Word not found', translations: [] };
  }
  throw error;
}
```

### 2. Rate Limiting

```javascript
import { RateLimiter } from '../utils/common.js';
const limiter = new RateLimiter(0.5); // 0.5 requests per second

export async function scrapeWithLimit(word, from, to) {
  return await limiter.execute(() => scrapeInternal(word, from, to));
}
```

### 3. Result Caching

```javascript
const cache = new Map();

export async function scrapeWithCache(word, from, to) {
  const key = `${word}-${from}-${to}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await scrapeInternal(word, from, to);
  cache.set(key, result);
  
  return result;
}
```

### 4. Appropriate Headers

```javascript
const headers = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};
```

## Implementation Checklist

- [ ] Analyze website HTML structure
- [ ] Implement basic scraper function
- [ ] Add error handling
- [ ] Implement language validation
- [ ] Create basic tests
- [ ] Add to MultiDictionaryScraper
- [ ] Document specific JSON format
- [ ] Test with different words
- [ ] Optimize performance
- [ ] Add rate limiting if necessary

## Suggested Dictionaries

### High Priority

1. **Cambridge Dictionary** - Academic definitions, IPA
2. **Oxford Dictionary** - Academic authority
3. **Merriam-Webster** - Standard American dictionary

### Medium Priority

4. **Collins Dictionary** - Usage frequency
5. **Macmillan Dictionary** - Clear definitions
6. **Longman Dictionary** - For learners

### Low Priority

7. **Glosbe** - Minority languages
8. **Dict.cc** - German-English specialized
9. **Leo.org** - Multiple European languages

## Support

If you need help implementing a new dictionary:

1. Review existing examples
2. Check common utilities documentation
3. Test with different use cases
4. Consider the target site's rate limiting
