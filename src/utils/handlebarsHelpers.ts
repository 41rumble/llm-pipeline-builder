import Handlebars from 'handlebars';

/**
 * Register custom Handlebars helpers for prompt templates
 */
export const registerHandlebarsHelpers = (): void => {
  // JSON helper - stringify an object
  Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });
  
  // Pretty JSON helper - stringify with formatting
  Handlebars.registerHelper('prettyJson', function(context) {
    return JSON.stringify(context, null, 2);
  });
  
  // Join helper - join array elements with a separator
  Handlebars.registerHelper('join', function(array, separator) {
    if (!Array.isArray(array)) {
      return array;
    }
    return array.join(separator);
  });
  
  // Each with index helper
  Handlebars.registerHelper('eachWithIndex', function(array, options) {
    let result = '';
    for (let i = 0; i < array.length; i++) {
      result += options.fn({ item: array[i], index: i });
    }
    return result;
  });
  
  // Conditional helpers
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });
  
  Handlebars.registerHelper('neq', function(a, b) {
    return a !== b;
  });
  
  Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
  });
  
  Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
  });
  
  // Escape special characters for LLM prompts
  Handlebars.registerHelper('escape', function(text) {
    if (typeof text !== 'string') {
      return text;
    }
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  });
};