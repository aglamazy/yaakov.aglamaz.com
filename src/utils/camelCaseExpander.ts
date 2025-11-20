/**
 * Expands camelCase strings into readable English text
 *
 * Rules:
 * - Short strings (1-3 words): Title Case
 * - Long strings (4+ words): Sentence case
 *
 * Examples:
 * - staffManagement -> "Staff Management"
 * - comingSoon -> "Coming Soon"
 * - thisIsALongerStringWithManyWords -> "This is a longer string with many words"
 */
export function expandCamelCase(camelCaseStr: string): string {
  if (!camelCaseStr) return '';

  // Split camelCase into words
  // Handle sequences of capitals (like "XMLParser" -> "XML Parser")
  const words = camelCaseStr
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // XMLParser -> XML Parser
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')     // camelCase -> camel Case
    .split(' ')
    .map(word => word.toLowerCase());

  if (words.length === 0) return '';

  // Determine if we should use title case or sentence case
  const shouldUseTitleCase = words.length <= 3;

  if (shouldUseTitleCase) {
    // Title Case: capitalize first letter of each word
    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } else {
    // Sentence case: capitalize only first word
    const [firstWord, ...restWords] = words;
    return [
      firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
      ...restWords
    ].join(' ');
  }
}

/**
 * Common exceptions that should not be auto-expanded
 * (abbreviations, brand names, etc.)
 */
const EXPANSION_EXCEPTIONS: Record<string, string> = {
  'url': 'URL',
  'api': 'API',
  'id': 'ID',
  'ui': 'UI',
  'html': 'HTML',
  'css': 'CSS',
  'json': 'JSON',
  'xml': 'XML',
  'sql': 'SQL',
  'pdf': 'PDF',
};

/**
 * Expands camelCase with support for common exceptions
 */
export function expandCamelCaseWithExceptions(camelCaseStr: string): string {
  // Check if entire string is an exception
  if (EXPANSION_EXCEPTIONS[camelCaseStr.toLowerCase()]) {
    return EXPANSION_EXCEPTIONS[camelCaseStr.toLowerCase()];
  }

  // Normal expansion
  let expanded = expandCamelCase(camelCaseStr);

  // Replace exception words in the result
  Object.entries(EXPANSION_EXCEPTIONS).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    expanded = expanded.replace(regex, value);
  });

  return expanded;
}
