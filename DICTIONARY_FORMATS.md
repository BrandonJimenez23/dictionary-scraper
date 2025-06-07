# Dictionary Output Formats

This document describes the specific JSON formats returned by each dictionary scraper in the multi-dictionary system.

## Standard Base Format

All dictionaries return results following this base structure:

```json
{
  "source": "dictionary-name",
  "inputWord": "search-term",
  "fromLang": "source-language-code",
  "toLang": "target-language-code",
  "translations": [...],
  "timestamp": "2025-06-07T18:36:57.602Z"
}
```

## WordReference Format

WordReference provides the most comprehensive data including grammatical types, audio links, and detailed word forms.

### Basic Structure
```json
{
  "source": "wordreference",
  "inputWord": "house",
  "fromLang": "en",
  "toLang": "es",
  "translations": [
    {
      "from": "house",
      "fromType": "n",
      "translations": [
        {
          "text": "casa",
          "type": "nf",
          "sense": "",
          "frequency": "unknown",
          "verified": false
        }
      ],
      "contexts": []
    }
  ],
  "audioLinks": [],
  "timestamp": "2025-06-07T18:36:57.602Z"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `from` | string | Source word or phrase |
| `fromType` | string | Grammatical type of source (n, v, adj, etc.) |
| `translations` | array | Array of translation objects |
| `translations[].text` | string | Translated text |
| `translations[].type` | string | Grammatical type of translation |
| `translations[].sense` | string | Contextual meaning or usage note |
| `audioLinks` | array | URLs to pronunciation audio files |

### Grammatical Types
- `n` - noun
- `nf` - feminine noun
- `nm` - masculine noun
- `v` - verb
- `vi` - intransitive verb
- `vtr` - transitive verb
- `adj` - adjective
- `adv` - adverb
- `prep` - preposition
- `expr` - expression
- `loc` - locution

### Example with Compound Entries
```json
{
  "translations": [
    {
      "from": "fish [sth] out",
      "fromType": "vtr phrasal sep",
      "translations": [
        {
          "text": "repêcher⇒",
          "type": "vtr",
          "sense": "",
          "frequency": "unknown",
          "verified": false
        }
      ],
      "contexts": []
    }
  ]
}
```

## Linguee Format

Linguee focuses on contextual translations with real-world usage examples.

### Basic Structure
```json
{
  "source": "linguee",
  "inputWord": "house",
  "fromLang": "en",
  "toLang": "es",
  "translations": [
    {
      "from": "house",
      "fromType": "n",
      "translations": [
        {
          "text": "casa",
          "type": "",
          "frequency": "unknown",
          "verified": false
        }
      ],
      "contexts": [
        {
          "source": "We had to mortgage our house.",
          "target": "Tuvimos que hipotecar nuestra casa.",
          "verified": false,
          "external": false
        }
      ]
    }
  ],
  "timestamp": "2025-06-07T18:36:58.396Z"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `contexts` | array | Real-world usage examples |
| `contexts[].source` | string | Example sentence in source language |
| `contexts[].target` | string | Example sentence in target language |
| `contexts[].verified` | boolean | Whether the translation is verified |
| `contexts[].external` | boolean | Whether the example is from external sources |

### Example with Multiple Contexts
```json
{
  "from": "house",
  "fromType": "v",
  "translations": [
    {
      "text": "albergar",
      "type": "",
      "frequency": "unknown",
      "verified": false
    }
  ],
  "contexts": [
    {
      "source": "This complex will house government agencies.",
      "target": "Este complejo albergará agencias gubernamentales.",
      "verified": false,
      "external": false
    },
    {
      "source": "This shelter houses abandoned animals.",
      "target": "Este refugio alberga animales abandonados.",
      "verified": false,
      "external": false
    }
  ]
}
```

## Unified Output Format

When using the multi-scraper with multiple dictionaries, results are combined in this format:

```json
{
  "inputWord": "house",
  "fromLang": "en",
  "toLang": "es",
  "results": {
    "wordreference": {
      "source": "wordreference",
      "translations": [...],
      "audioLinks": []
    },
    "linguee": {
      "source": "linguee",
      "translations": [...],
      "contexts": [...]
    }
  },
  "timestamp": "2025-06-07T18:36:58.396Z"
}
```

## Error Format

When a dictionary fails to return results:

```json
{
  "source": "dictionary-name",
  "inputWord": "nonexistent",
  "fromLang": "en",
  "toLang": "es",
  "error": "No translations found",
  "translations": [],
  "timestamp": "2025-06-07T18:36:58.396Z"
}
```

## Language Codes

Both dictionaries use ISO 639-1 language codes:

### Supported Languages

| Code | Language | WordReference | Linguee |
|------|----------|---------------|---------|
| `en` | English | ✅ | ✅ |
| `es` | Spanish | ✅ | ✅ |
| `fr` | French | ✅ | ✅ |
| `de` | German | ✅ | ✅ |
| `it` | Italian | ✅ | ✅ |
| `pt` | Portuguese | ✅ | ✅ |
| `nl` | Dutch | ✅ | ✅ |
| `pl` | Polish | ✅ | ✅ |
| `ru` | Russian | ✅ | ❌ |
| `ar` | Arabic | ✅ | ❌ |
| `zh` | Chinese | ✅ | ❌ |
| `ja` | Japanese | ✅ | ❌ |
| `ko` | Korean | ✅ | ❌ |

## Best Practices for Processing Results

### 1. Handling Empty Results
```javascript
if (!result.translations || result.translations.length === 0) {
  console.log('No translations found');
  return;
}
```

### 2. Extracting Simple Translations
```javascript
const simpleTranslations = result.translations
  .flatMap(t => t.translations)
  .map(t => t.text)
  .filter(Boolean);
```

### 3. Getting Contextual Examples (Linguee)
```javascript
const examples = result.translations
  .flatMap(t => t.contexts || [])
  .map(c => ({ source: c.source, target: c.target }));
```

### 4. Filtering by Grammatical Type
```javascript
const nouns = result.translations.filter(t => 
  t.fromType === 'n' || t.fromType.includes('noun')
);
```
