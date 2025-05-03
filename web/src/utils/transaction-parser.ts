import { TRANSACTION_REGEX } from '@/constants/app.constant';
import { Category } from '@/hooks/use-categories';
import { parse, isValid } from 'date-fns';
import Fuse from 'fuse.js';
import { extractVietnameseNumber, replaceVietnameseNumbers } from './vietnamese-number-parser';

export interface ParsedTransaction {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: Date;
  categoryId?: number;
  category?: Category;
}

/**
 * Parse amount from various formats including k, m, nghìn, triệu
 */
export const parseAmount = (amountStr: string): number => {
  // Trong mọi trường hợp, xem dấu , hoặc . là dấu thập phân
  // Lấy dấu thập phân cuối cùng, và loại bỏ tất cả các dấu khác
  let cleanAmount = amountStr;

  // Nếu có nhiều dấu . hoặc ,
  const dotsAndCommas = cleanAmount.match(/[.,]/g);
  if (dotsAndCommas && dotsAndCommas.length > 0) {
    // Tìm vị trí của dấu thập phân cuối cùng
    const lastDotIndex = cleanAmount.lastIndexOf('.');
    const lastCommaIndex = cleanAmount.lastIndexOf(',');

    // Chọn dấu thập phân cuối cùng
    const lastDecimalIndex = Math.max(lastDotIndex, lastCommaIndex);

    if (lastDecimalIndex >= 0) {
      // Chia chuỗi thành phần nguyên và phần thập phân
      const integerPart = cleanAmount.substring(0, lastDecimalIndex).replace(/[.,]/g, '');
      const decimalPart = cleanAmount.substring(lastDecimalIndex + 1);

      // Nối lại với dấu thập phân là dấu chấm (cho JavaScript)
      cleanAmount = integerPart + '.' + decimalPart;
    }
  } else {
    // Nếu chỉ có một dấu , thì chuyển thành dấu .
    cleanAmount = cleanAmount.replace(',', '.');
  }

  let multiplier = 1;

  // Handle different currency terms
  const lowerAmount = cleanAmount.toLowerCase();
  if (lowerAmount.includes('k') || lowerAmount.includes('nghìn') || lowerAmount.includes('nghin')) {
    multiplier = 1000;
  } else if (
    lowerAmount.includes('m') ||
    lowerAmount.includes('triệu') ||
    lowerAmount.includes('trieu') ||
    lowerAmount.includes('tr')
  ) {
    multiplier = 1000000;
  }

  // Remove currency terms to extract the numeric value
  cleanAmount = cleanAmount.replace(/k|m|nghìn|nghin|triệu|trieu/i, '').replace(/\s+/g, '');

  // Parse as float to handle decimal values correctly
  return parseFloat(cleanAmount) * multiplier;
};

/**
 * Parse date from various formats
 */
export const parseDate = (dateStr: string): Date => {
  // Try to parse dd/MM/yyyy
  let date = parse(dateStr, 'dd/MM/yyyy', new Date());

  // If invalid, try dd/MM (current year)
  if (!isValid(date)) {
    const today = new Date();
    date = parse(`${dateStr}/${today.getFullYear()}`, 'dd/MM/yyyy', today);
  }

  return isValid(date) ? date : new Date();
};

/**
 * Determine transaction type (income or expense) based on text
 */
export const parseTransactionType = (text: string): 'INCOME' | 'EXPENSE' => {
  const lowerText = text.toLowerCase();
  if (
    TRANSACTION_REGEX.INCOME_INDICATORS.test(text) ||
    lowerText.includes('thu') ||
    lowerText.includes('nhận') ||
    lowerText.includes('thêm')
  ) {
    return 'INCOME';
  }

  if (
    TRANSACTION_REGEX.EXPENSE_INDICATORS.test(text) ||
    lowerText.includes('trả') ||
    lowerText.includes('chi') ||
    lowerText.includes('tiêu')
  ) {
    return 'EXPENSE';
  }

  // Default to expense if no specific indicators
  return 'EXPENSE';
};

/**
 * Check if text contains fuel or transportation related terms
 */
export const isFuelOrTransportation = (text: string): boolean => {
  const lowerText = text.toLowerCase();

  // Specific fuel related terms
  const fuelTerms = [
    'đổ xăng',
    'xăng',
    'dầu',
    'nhiên liệu',
    'gas',
    'bơm xăng',
    'esso',
    'petrolimex',
    'shell',
    'caltex',
    'trạm xăng',
  ];

  // Vehicle maintenance terms
  const maintenanceTerms = [
    'sửa xe',
    'bảo dưỡng xe',
    'thay nhớt',
    'thay dầu',
    'rửa xe',
    'vá xe',
    'thay lốp',
    'thay săm',
  ];

  // General transportation terms
  const transportationTerms = [
    'ô tô',
    'xe máy',
    'xe hơi',
    'xe đạp',
    'taxi',
    'grab',
    'be',
    'gojek',
    'xe ôm',
    'gửi xe',
    'vé tàu',
    'vé xe',
    'vé máy bay',
    'phí đường bộ',
    'phí cầu đường',
    'toll',
  ];

  // Combine all terms
  const allTerms = [...fuelTerms, ...maintenanceTerms, ...transportationTerms];

  // Check if any term is included in the text
  return allTerms.some((term) => lowerText.includes(term));
};

/**
 * Find the most appropriate category based on description text
 */
export const findBestCategoryMatch = (
  description: string,
  categories: Category[],
): Category | undefined => {
  if (!categories || categories.length === 0) return undefined;

  // First, check for fuel or transportation related terms
  if (isFuelOrTransportation(description)) {
    const transportationCategory = categories.find(
      (category) => category.name.toLowerCase() === 'di chuyển',
    );
    if (transportationCategory) return transportationCategory;
  }

  // Define common activity mappings to help with matching
  const activityMappings: Record<string, string[]> = {
    'ăn uống': [
      'ăn',
      'uống',
      'cơm',
      'bữa',
      'nhà hàng',
      'quán',
      'cafe',
      'bánh',
      'trà sữa',
      'ăn sáng',
      'ăn trưa',
      'ăn tối',
      'ăn vặt',
    ],
    'mua sắm': ['mua', 'chợ', 'đi chợ', 'siêu thị', 'shopping'],
    'giải trí': ['xem phim', 'du lịch', 'đi chơi', 'chơi game', 'karaoke', 'bar'],
    'di chuyển': [
      // Transportation terms are now handled by isFuelOrTransportation function
      // but keeping some common terms here as backup
      'vé bay',
      'vé tàu',
      'đi lại',
      'di chuyển',
      'đường phí',
    ],
    'sức khỏe': ['thuốc', 'khám', 'bệnh viện', 'phòng khám', 'bác sĩ', 'nha sĩ'],
    'tiền lương': ['lương', 'tiền lương', 'thu nhập', 'thưởng'],
  };

  // Try to find a direct match in our mappings
  for (const [categoryName, activities] of Object.entries(activityMappings)) {
    if (activities.some((activity) => description.toLowerCase().includes(activity.toLowerCase()))) {
      const directMatch = categories.find(
        (category) => category.name.toLowerCase() === categoryName.toLowerCase(),
      );
      if (directMatch) return directMatch;
    }
  }

  // If no mapping matches, use fuzzy search with improved settings
  const fuse = new Fuse(categories, {
    keys: ['name'],
    threshold: 0.3, // Lower threshold for stricter matching
    ignoreLocation: true,
    useExtendedSearch: true,
  });

  const results = fuse.search(description);
  if (results.length > 0) {
    return results[0].item;
  }

  // If no match found, return the "Khác" (Other) category as fallback
  const otherCategory = categories.find((category) => category.name.toLowerCase() === 'khác');

  return otherCategory;
};

/**
 * Parse a single transaction from text
 */
export const parseTransaction = (
  text: string,
  categories: Category[],
): ParsedTransaction | null => {
  if (!text.trim()) return null;

  try {
    // First, preprocess the text to convert Vietnamese text numbers to digits
    const preprocessedText = replaceVietnameseNumbers(text);

    // Extract amount using regular expression or Vietnamese text numbers
    let amount = 0;
    let amountStr = '';

    // Regex để tìm số có thể có hậu tố đơn vị tiền tệ
    // Ví dụ: 158 triệu, 1,25 triệu, 158triệu, 50k, 200M
    const amountRegex = /(\d+(?:[,.]\d+)?(?:\s*(?:k|m|nghìn|nghin|triệu|trieu|tỷ))?)/i;
    const amountMatch = preprocessedText.match(amountRegex);

    if (amountMatch) {
      amountStr = amountMatch[0];
      amount = parseAmount(amountStr);
    } else {
      // If no numeric amount found, try to find a Vietnamese text number
      // First in preprocessedText (which should already have converted most numbers)
      // then in the original text as a fallback
      const extractedNumber = extractVietnameseNumber(text);
      if (extractedNumber) {
        amount = extractedNumber.value;
        amountStr = extractedNumber.original;
      } else {
        // No amount found, cannot proceed
        return null;
      }
    }

    // Extract date or use current date
    const dateMatch = preprocessedText.match(TRANSACTION_REGEX.DATE);
    const date = dateMatch ? parseDate(dateMatch[0]) : new Date();

    // Determine transaction type
    const type = parseTransactionType(preprocessedText);

    // Extract description - use the text after removing specific patterns
    let processedText = preprocessedText;

    // Remove transaction indicators
    processedText = processedText
      .replace(TRANSACTION_REGEX.INCOME_INDICATORS, '')
      .replace(TRANSACTION_REGEX.EXPENSE_INDICATORS, '')
      .replace(/[\(\)]/g, '');

    // If date exists, remove it
    if (dateMatch) {
      processedText = processedText.replace(dateMatch[0], '');
    }

    // Remove amount with its suffix carefully
    if (amountMatch) {
      const fullAmountMatch = amountMatch[0];
      const amountIndex = processedText.indexOf(fullAmountMatch);
      if (amountIndex !== -1) {
        const beforeAmount = processedText.substring(0, amountIndex);
        const afterAmount = processedText.substring(amountIndex + fullAmountMatch.length);
        processedText = beforeAmount + afterAmount;
      }
    } else if (amountStr) {
      // If we found a Vietnamese text number, remove it from the description
      processedText = processedText.replace(amountStr, '');
    }

    // Clean up any extra spaces
    const description = processedText.trim().replace(/\s+/g, ' ');

    // Find best category match
    const category = findBestCategoryMatch(description, categories);

    return {
      type,
      amount,
      date,
      description,
      categoryId: category?.id,
      category,
    };
  } catch (error) {
    console.error('Error parsing transaction:', error);
    return null;
  }
};

/**
 * Parse multiple transactions from text separated by newlines
 */
export const parseMultipleTransactions = (
  text: string,
  categories: Category[],
): ParsedTransaction[] => {
  // Split input by newlines
  const lines = text.split('\n').filter((line) => line.trim());

  // Parse each line
  const transactions = lines
    .map((line) => parseTransaction(line, categories))
    .filter((transaction): transaction is ParsedTransaction => transaction !== null);

  return transactions;
};
