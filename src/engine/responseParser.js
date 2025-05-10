/**
 * Utility functions for parsing LLM responses
 */

/**
 * Parse a response into an array of items for fan-out
 * @param {string} text - The text to parse
 * @param {string} parserType - The type of parser to use (json_array, list, auto)
 * @returns {string[]} - Array of items
 */
export const parseResponseForFanOut = (text, parserType = 'auto') => {
  console.log(`Parsing response for fan-out using ${parserType} parser: ${text.substring(0, 100)}...`);
  
  try {
    // JSON Array parser
    if (parserType === 'json_array' || parserType === 'auto') {
      try {
        // Try to find JSON array in the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          // If we found a JSON array pattern, try to parse it
          const parsedArray = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsedArray) && parsedArray.length > 0) {
            console.log(`Successfully parsed JSON array with ${parsedArray.length} items`);
            return parsedArray;
          }
        }
        
        // If no JSON array pattern found, try to parse the whole text
        const parsedData = JSON.parse(text);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log(`Successfully parsed full text as JSON array with ${parsedData.length} items`);
          return parsedData;
        }
      } catch (jsonError) {
        if (parserType === 'json_array') {
          console.error('Failed to parse JSON array response:', jsonError);
          // If the parser type is specifically json_array, return a single item
          return [text];
        }
        // Otherwise continue to other parsing methods
      }
    }
    
    // List parser (numbered or bullet lists)
    if (parserType === 'list' || parserType === 'auto') {
      // Look for numbered list (1. Item, 2. Item, etc.)
      const numberedListRegex = /^\s*\d+[\.\)]\s+.+$/gm;
      const numberedMatches = text.match(numberedListRegex);
      
      if (numberedMatches && numberedMatches.length > 1) {
        // We found a numbered list
        const items = numberedMatches.map(line => 
          line.replace(/^\s*\d+[\.\)]\s+/, '').trim()
        );
        console.log(`Parsed numbered list with ${items.length} items`);
        return items;
      }
      
      // Look for bullet list (- Item, * Item, etc.)
      const bulletListRegex = /^\s*[\-\*]\s+.+$/gm;
      const bulletMatches = text.match(bulletListRegex);
      
      if (bulletMatches && bulletMatches.length > 1) {
        // We found a bullet list
        const items = bulletMatches.map(line => 
          line.replace(/^\s*[\-\*]\s+/, '').trim()
        );
        console.log(`Parsed bullet list with ${items.length} items`);
        return items;
      }
    }
    
    // Line parser (split by newlines)
    if (parserType === 'lines' || parserType === 'auto') {
      const lines = text
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('[') && !line.startsWith(']'));
        
      if (lines.length > 1) {
        // Clean up lines (remove quotes, etc.)
        const cleanedLines = lines.map(line => {
          return line
            .replace(/^["']|["']$/g, '')    // Remove quotes at start/end
            .trim();
        }).filter(line => line.length > 0);
        
        if (cleanedLines.length > 1) {
          console.log(`Split text into ${cleanedLines.length} lines`);
          return cleanedLines;
        }
      }
    }
    
    // Sentence parser (split by sentences)
    if (parserType === 'sentences' || parserType === 'auto') {
      if (text.length > 100) {
        const sentences = text
          .replace(/([.?!])\s+/g, "$1|")
          .split("|")
          .map(s => s.trim())
          .filter(s => s.length > 10); // Only keep sentences of reasonable length
          
        if (sentences.length > 1) {
          console.log(`Split text into ${sentences.length} sentences`);
          return sentences;
        }
      }
    }
    
    // If all else fails, return as a single-item array
    console.log('Returning response as a single item array');
    return [text];
  } catch (error) {
    console.error('Error parsing fan-out response:', error);
    return [text]; // Fallback to single item array
  }
};