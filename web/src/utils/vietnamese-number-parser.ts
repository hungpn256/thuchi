/**
 * A utility to convert Vietnamese text numbers to numeric values
 * Handles cases like "một triệu", "bốn chục", "năm trăm nghìn", etc.
 */

// Mapping of Vietnamese number words to their numeric values
const vietnameseNumbers: Record<string, number> = {
  không: 0,
  một: 1,
  hai: 2,
  ba: 3,
  bốn: 4,
  năm: 5,
  sáu: 6,
  bảy: 7,
  tám: 8,
  chín: 9,
  mười: 10,
  mươi: 10,
  chục: 10,
  trăm: 100,
  nghìn: 1000,
  ngàn: 1000,
  triệu: 1000000,
  tỷ: 1000000000,
};

// Alternative spellings and common variations
const numberAliases: Record<string, string> = {
  muoi: 'mười',
  muời: 'mười',
  chuc: 'chục',
  tram: 'trăm',
  nghin: 'nghìn',
  ngan: 'ngàn',
  trieu: 'triệu',
  ty: 'tỷ',
};

/**
 * Convert a single Vietnamese number word to its numeric value
 */
const getNumberValue = (word: string): number | null => {
  const normalizedWord = word.toLowerCase().trim();
  // Check if it's a direct number
  if (vietnameseNumbers[normalizedWord] !== undefined) {
    return vietnameseNumbers[normalizedWord];
  }

  // Check if it's an alias
  const alias = numberAliases[normalizedWord];
  if (alias && vietnameseNumbers[alias] !== undefined) {
    return vietnameseNumbers[alias];
  }

  return null;
};

/**
 * Parse a Vietnamese text number phrase to its numeric value
 * Examples:
 * - "một triệu" -> 1000000
 * - "hai trăm năm mươi nghìn" -> 250000
 * - "bốn chục" -> 40
 */
export const parseVietnameseNumber = (text: string): number | null => {
  if (!text || typeof text !== 'string') return null;

  // First, check if the text is already a number
  const numberMatch = text.match(/^\d+$/);
  if (numberMatch) {
    return parseInt(numberMatch[0], 10);
  }

  // Clean up the text
  const cleanText = text.toLowerCase().replace(/\s+/g, ' ').trim();

  // Special case for "mốt" (often used for 1 in tens position)
  const withMotReplaced = cleanText.replace(/\bmốt\b/g, 'một');

  // Split into words
  const words = withMotReplaced.split(/\s+/);

  if (words.length === 0) return null;

  let result = 0;
  let currentNumber = 0;
  let hasFoundAnyNumber = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const value = getNumberValue(word);

    if (value === null) continue; // Skip non-number words

    hasFoundAnyNumber = true;

    if (value >= 1000) {
      // For magnitudes like nghìn, triệu, tỷ
      // If no number precedes it, assume 1
      result += (currentNumber || 1) * value;
      currentNumber = 0;
    } else if (value >= 100) {
      // For trăm (hundred)
      if (currentNumber === 0) {
        currentNumber = 1;
      }
      currentNumber *= value;
    } else if (value === 10) {
      // For mười, mươi, chục (ten)
      if (currentNumber === 0) {
        currentNumber = 1;
      }
      currentNumber *= value;

      // Special case for "mười + number"
      if (i + 1 < words.length) {
        const nextValue = getNumberValue(words[i + 1]);
        if (nextValue !== null && nextValue < 10) {
          currentNumber += nextValue;
          i++; // Skip the next word as we've processed it
        }
      }
    } else {
      // For single digits
      if (i + 1 < words.length && getNumberValue(words[i + 1]) === 10) {
        // If next word is "mười/mươi/chục", this is the tens digit
        currentNumber = value * 10;
        i++; // Skip the next word

        // Check if there's a ones digit after "mươi"
        if (i + 1 < words.length) {
          const nextValue = getNumberValue(words[i + 1]);
          if (nextValue !== null && nextValue < 10) {
            currentNumber += nextValue;
            i++; // Skip the next word
          }
        }
      } else {
        // Regular single digit
        currentNumber += value;
      }
    }
  }

  // Add any remaining current number to the result
  result += currentNumber;

  return hasFoundAnyNumber ? result : null;
};

/**
 * Extract and parse Vietnamese text numbers from a string
 * Returns the first valid number found, or null if none found
 */
export const extractVietnameseNumber = (
  text: string,
): { value: number; original: string } | null => {
  if (!text || typeof text !== 'string') return null;

  // Common patterns for number phrases in Vietnamese
  const patterns = [
    // Look for patterns with "triệu", "nghìn", etc.
    /(\b(?:một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|mười một|mười hai|hai mươi|ba mươi|bốn mươi|năm mươi|sáu mươi|bảy mươi|tám mươi|chín mươi)\s+(?:nghìn|ngàn|triệu|tỷ)\b)/i,

    // Look for "X trăm" patterns
    /(\b(?:một|hai|ba|bốn|năm|sáu|bảy|tám|chín)\s+trăm(?:\s+\w+)*\b)/i,

    // Look for "X mươi/chục" patterns
    /(\b(?:hai|ba|bốn|năm|sáu|bảy|tám|chín)\s+(?:mươi|chục)(?:\s+\w+)*\b)/i,

    // Look for "mười X" patterns
    /(\bmười\s+(?:một|hai|ba|bốn|năm|sáu|bảy|tám|chín)?\b)/i,

    // Single numbers
    /(\b(?:không|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\b)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseVietnameseNumber(match[1]);
      if (value !== null) {
        return { value, original: match[1] };
      }
    }
  }

  return null;
};

/**
 * Replace Vietnamese text numbers in a string with their numeric values
 * Useful for preprocessing voice input text before transaction parsing
 */
export const replaceVietnameseNumbers = (text: string): string => {
  console.log('Preprocessing text:', text);

  if (!text || typeof text !== 'string') return text;

  // Bảo vệ các số có đơn vị tiền tệ (k, tr, m, nghìn, triệu) để xử lý riêng
  // Bảo vệ cả số nguyên và số thập phân (vd: 1.5tr, 200k)
  const numbersWithUnitsRegex =
    /(\d+(?:[.,]\d+)?)\s*(k|m|nghìn|nghin|ngàn|ngan|triệu|trieu|tỷ|ty)\b/gi;
  const preservedNumbersWithUnits = text.replace(numbersWithUnitsRegex, (match) => {
    console.log('Preserving number with unit:', match);
    return `__PRESERVED_NUM_UNIT__${match}__END_PRESERVED__`;
  });

  let result = preservedNumbersWithUnits;
  let match;

  // Start with longer phrases to avoid partial replacements
  const patterns = [
    // Số phức tạp với "nghìn, ngàn, triệu, tỷ" - đặc biệt nhận dạng các mẫu như "ba trăm mười nghìn"
    /(\b(?:\w+\s+){1,10}(?:nghìn|ngàn|triệu|tỷ|ty)\b)/gi,

    // Số với "trăm" như "năm trăm"
    /(\b(?:\w+\s+){1,6}(?:trăm)(?:\s+\w+)*\b)/gi,

    // Số với "mươi/chục" như "bốn mươi"
    /(\b(?:\w+\s+){1,3}(?:mươi|chục)(?:\s+\w+)*\b)/gi,

    // Các trường hợp đơn giản như "mười hai" hoặc số đơn
    /(\bmười\s+\w+\b|\b(?:không|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\b)/gi,
  ];

  for (const pattern of patterns) {
    // Cần reset pattern mỗi lần sử dụng
    pattern.lastIndex = 0;

    while ((match = pattern.exec(result)) !== null) {
      // Bỏ qua nếu phần này nằm trong số đã được bảo vệ
      if (
        result
          .substring(Math.max(0, match.index - 20), match.index + match[0].length + 20)
          .includes('__PRESERVED_NUM_UNIT__')
      ) {
        continue;
      }

      console.log('Matched Vietnamese number phrase:', match[1]);
      const parsed = parseVietnameseNumber(match[1]);
      console.log('Parsed value:', parsed);

      if (parsed !== null) {
        // Thay thế văn bản khớp với giá trị số
        const before = result.substring(0, match.index);
        const after = result.substring(match.index + match[1].length);
        result = before + parsed + after;

        // Reset pattern để bắt đầu từ đầu vì đã sửa đổi chuỗi
        pattern.lastIndex = 0;
      }
    }
  }

  console.log('After Vietnamese number processing:', result);

  // Khôi phục các số có đơn vị tiền tệ đã được bảo vệ
  result = result.replace(/__PRESERVED_NUM_UNIT__(.*?)__END_PRESERVED__/g, '$1');

  console.log('Final preprocessed text:', result);
  return result;
};
