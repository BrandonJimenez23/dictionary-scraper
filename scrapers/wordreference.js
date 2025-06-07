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
        // Special URL formatting for certain language pairs
        let url;
        const pair = `${fromCode}${toCode}`;
        
        // Handle special cases based on the example provided
        if (/enes/.test(pair) && fromCode === 'en') {
          url = `https://www.wordreference.com/es/translation.asp?tranword=${encodeURIComponent(word)}`;
        } else if (/esen/.test(pair) && fromCode === 'es') {
          url = `https://www.wordreference.com/es/en/translation.asp?spen=${encodeURIComponent(word)}`;
        } else {
          // Default format
          url = `https://www.wordreference.com/${fromCode}${toCode}/${encodeURIComponent(word)}`;
        }
        
        console.log(`Trying URL: ${url}`);
        
        const html = await RequestHandler.makeRequest(url);

        const result = processHTML(html, word);
        
        // Check if we got valid results
        if (result.sections && result.sections.length > 0) {
          return {
            ...result,
            languagePair: `${fromCode}-${toCode}`,
            normalizedFrom,
            normalizedTo,
            url: url // Include the successful URL for debugging
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
    result.title = titleRow.find('.ph').text().trim() || titleRow.text().trim();
  }

  // Get all rows including section headers and translation rows
  const allRows = $table.find('tr.wrtopsection, tr.odd, tr.even').not('.more');
  
  let currentTranslation = null;
  let currentExample = {};
  
  const resetCurrentTranslation = () => {
    if (currentExample && Object.keys(currentExample).length > 0 && currentTranslation) {
      currentTranslation.examples.push(currentExample);
    }
    if (currentTranslation) {
      result.translations.push(currentTranslation);
    }
    currentTranslation = null;
    currentExample = {};
  };

  allRows.each((_, row) => {
    const $row = $(row);

    // Skip section headers - we already processed the title
    if ($row.hasClass('wrtopsection')) {
      return;
    }

    // Check if this row has examples (FrEx, ToEx classes)
    const $frEx = $row.find('td.FrEx');
    const $toEx = $row.find('td.ToEx');
    
    if ($frEx.length > 0) {
      // Save previous example if it exists
      if (currentExample.phrase && currentTranslation) {
        currentTranslation.examples.push(currentExample);
      }
      // Start a new example
      currentExample = {
        phrase: $frEx.text().trim(),
        translations: []
      };
      return;
    }
    
    if ($toEx.length > 0) {
      // Add translation to current example
      if (currentExample.phrase) {
        currentExample.translations.push($toEx.text().trim());
      }
      return;
    }

    // Check if this is a new translation row (has FrWrd and ToWrd)
    const $fromCell = $row.find('td.FrWrd');
    const $toCell = $row.find('td.ToWrd');
    
    if ($fromCell.length > 0 || $toCell.length > 0) {
      // This is a new translation, save the previous one
      resetCurrentTranslation();
      
      // Initialize new translation
      currentTranslation = {
        word: { word: '', pos: '' },
        definition: '',
        meanings: [],
        examples: []
      };

      // Extract source word and part of speech
      if ($fromCell.length > 0) {
        const fromText = $fromCell.find('strong').text().trim().replace('⇒', '') || 
                        $fromCell.clone().find('em, .POS2').remove().end().text().trim();
        const fromPos = $fromCell.find('em, .POS2').text().trim();
        
        currentTranslation.word.word = fromText;
        currentTranslation.word.pos = fromPos;
      }

      // Extract target word and part of speech
      const currentMeaning = { word: '', pos: '' };
      if ($toCell.length > 0) {
        const toPos = $toCell.find('em, .POS2').text().trim();
        const $toClone = $toCell.clone();
        $toClone.find('em, .POS2').remove();
        const toText = $toClone.text().trim().replace('⇒', '');
        
        currentMeaning.word = toText;
        currentMeaning.pos = toPos;
      }

      // Extract definition from other cells
      const $allCells = $row.find('td');
      $allCells.each((_, cell) => {
        const $cell = $(cell);
        
        // Skip the main word cells
        if ($cell.hasClass('FrWrd') || $cell.hasClass('ToWrd')) {
          return;
        }

        // Look for sense information
        const senseText = $cell.find('.dsense').text().trim().replace(/[\(\)]/g, '');
        $cell.find('.dsense').remove();
        if (senseText) {
          currentMeaning.sense = senseText;
        }

        // Look for word sense in source
        const wordSense = $cell.find('.Fr2').text().trim();
        $cell.find('.Fr2').remove();
        if (wordSense) {
          currentTranslation.word.sense = wordSense;
        }

        // Extract definition (remove parentheses if they wrap the entire text)
        const cellText = $cell.text().trim();
        if (cellText && !currentTranslation.definition) {
          if (cellText.startsWith('(') && cellText.endsWith(')')) {
            currentTranslation.definition = cellText.slice(1, -1).trim();
          } else {
            currentTranslation.definition = cellText;
          }
        }
      });

      // Add the meaning if it has content
      if (currentMeaning.word || currentMeaning.pos) {
        currentTranslation.meanings.push(currentMeaning);
      }
    }
  });

  // Don't forget the last translation
  resetCurrentTranslation();

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
