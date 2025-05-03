import { TRANSACTION_REGEX } from '@/constants/app.constant';
import { Category } from '@/hooks/use-categories';
import { parse, isValid } from 'date-fns';
import Fuse from 'fuse.js';

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
  let cleanAmount = amountStr.replace(/[,.]/g, '');
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
  cleanAmount = cleanAmount.replace(/k|m|tr|nghìn|nghin|triệu|trieu/i, '').replace(/\s+/g, '');

  return parseInt(cleanAmount, 10) * multiplier;
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
    // Extract amount - handle spoken numbers
    const amountRegex = /(\d+(?:[,.]\d+)?(?:\s*(?:k|m|nghìn|nghin|triệu|trieu))?)/i;
    const amountMatch = text.match(amountRegex);
    if (!amountMatch) return null;

    const amount = parseAmount(amountMatch[0]);

    // Extract date or use current date
    const dateMatch = text.match(TRANSACTION_REGEX.DATE);
    const date = dateMatch ? parseDate(dateMatch[0]) : new Date();

    // Determine transaction type
    const type = parseTransactionType(text);

    // Extract description - use the text after removing specific patterns
    let processedText = text;

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
    const fullAmountMatch = amountMatch[0];
    const amountIndex = processedText.indexOf(fullAmountMatch);
    if (amountIndex !== -1) {
      const beforeAmount = processedText.substring(0, amountIndex);
      const afterAmount = processedText.substring(amountIndex + fullAmountMatch.length);
      processedText = beforeAmount + afterAmount;
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
