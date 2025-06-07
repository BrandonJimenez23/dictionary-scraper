import axios from 'axios';
import * as cheerio from 'cheerio';
import { LanguageValidator, RequestHandler } from '../utils/common.js';

/**
 * Scrapes WordReference for translations with CORS handling and language validation
 * @param {string} word - Word to translate
 * @param {string} from - Source language code (short or long form)
 * @param {string} to - Target language code (short or long form)
 * @returns {Promise<Object>} Translation result
 */
export async function scrapeWordReference(word, from = 'en', to = 'es') {
  // Validate and normalize language codes
  const validation = LanguageValidator.validatePair(from, to);
  if (validation.error) {
    return {
      inputWord: word,
      sections: [],
      audioLinks: [],
      source: 'wordreference',
      timestamp: new Date().toISOString(),
      error: validation.error
    };
  }

  const normalizedFrom = validation.from;
  const normalizedTo = validation.to;
  
  // Try multiple language code formats
  const fromAlternatives = LanguageValidator.getAlternatives(from);
  const toAlternatives = LanguageValidator.getAlternatives(to);
  
  let lastError = null;
  
  // Try different combinations of language codes
  for (const fromCode of fromAlternatives) {
    for (const toCode of toAlternatives) {
      try {
        const url = `https://www.wordreference.com/${fromCode}${toCode}/${encodeURIComponent(word)}`;
        
        const html = await RequestHandler.makeRequest(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.wordreference.com/'
          }
        });

        const result = processHTML(html, word);
        
        // Check if we got valid results
        if (result.sections && result.sections.length > 0) {
          return {
            ...result,
            languagePair: `${fromCode}-${toCode}`,
            normalizedFrom,
            normalizedTo
          };
        }
      } catch (error) {
        lastError = error;
        console.warn(`Failed with ${fromCode}-${toCode}:`, error.message);
        continue;
      }
    }
  }

  // If all attempts failed, return error result
  return {
    inputWord: word,
    sections: [],
    audioLinks: [],
    source: 'wordreference',
    timestamp: new Date().toISOString(),
    error: lastError?.message || `No translations found for "${word}" from ${validation.fromName} to ${validation.toName}`,
    attemptedLanguagePairs: fromAlternatives.flatMap(f => toAlternatives.map(t => `${f}-${t}`))
  };
}

function processHTML(html, inputWord) {
  const $ = cheerio.load(html);
  const result = {
    inputWord,
    sections: [],
    audioLinks: extractAudioFiles(html),
    source: 'wordreference',
    timestamp: new Date().toISOString()
  };

  const tables = $('table.WRD');
  tables.each((_, table) => {
    const section = processWRDTable($(table), $);
    if (section.title || section.translations.length > 0) {
      result.sections.push(section);
    }
  });

  return result;
}

function processWRDTable($table, $) {
  const result = {
    title: '',
    translations: []
  };

  const titleRow = $table.find('tr.wrtopsection');
  if (titleRow.length > 0) {
    result.title = titleRow.first().text().trim();
  }

  const translationRows = $table.find('tr.even[id], tr.odd[id]');
  translationRows.each((_, row) => {
    const $row = $(row);

    const fromCell = $row.find('td.FrWrd');
    const toCell = $row.find('td.ToWrd');
    if (fromCell.length === 0 || toCell.length === 0) return;

    const fromText = fromCell.clone().find('em').remove().end().text().trim();
    const fromPos = fromCell.find('em').text().trim();

    const toText = toCell.clone().find('em').remove().end().text().trim();
    const toPos = toCell.find('em').text().trim();

    // Extract definition (if available in the source cell)
    const definition = fromCell.find('.tooltip').text().trim() || '';

    const exampleCell = $row.find('td.Ex');
    const examples = [];
    if (exampleCell.length > 0) {
      const exampleText = exampleCell.text().trim();
      const exampleParts = exampleText.split('⇒');
      if (exampleParts.length === 2) {
        examples.push({
          phrase: exampleParts[0].trim(),
          translations: [exampleParts[1].trim()]
        });
      }
    }

    result.translations.push({
      word: { 
        word: fromText, 
        pos: fromPos 
      },
      definition: definition,
      meanings: [{ 
        word: toText, 
        pos: toPos,
        sense: '' // WordReference doesn't typically provide sense tags
      }],
      examples
    });
  });

  return result;
}

function extractAudioFiles(html) {
  const audioFiles = [];
  const audioFilesRegex = /audioFiles\s*=\s*\{([^}]+)\}/;
  const audioFilesMatch = html.match(audioFilesRegex);

  if (audioFilesMatch) {
    const audioContent = audioFilesMatch[1];
    const urlMatches = audioContent.match(/['"]([^'"]*\/audio\/[^'"]*\.mp3)['"]?/g);
    if (urlMatches) {
      urlMatches.forEach(match => {
        const cleanMatch = match.replace(/['"]/g, '');
        if (!audioFiles.includes(cleanMatch)) {
          audioFiles.push(cleanMatch);
        }
      });
    }
  }

  return audioFiles;
}
