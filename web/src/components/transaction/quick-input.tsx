'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TRANSACTION_REGEX } from '@/constants/app.constant';
import { format, parse, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import Fuse from 'fuse.js';
import { useCategories, Category } from '@/hooks/use-categories';
import { ArrowDownCircle, ArrowUpCircle, CalendarIcon, ListChecks, Loader2, X } from 'lucide-react';
import { formatAmount } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ParsedTransaction {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: Date;
  categoryId?: number;
  category?: Category;
}

interface QuickInputProps {
  onSubmit: (transaction: Omit<ParsedTransaction, 'category'>) => Promise<void>;
  onComplete?: () => void;
}

export function QuickInput({ onSubmit, onComplete }: QuickInputProps) {
  const [inputText, setInputText] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { categories } = useCategories();

  const parseAmount = (amountStr: string): number => {
    let cleanAmount = amountStr.replace(/[,.]/g, '');
    let multiplier = 1;

    // Handle different currency terms
    const lowerAmount = cleanAmount.toLowerCase();
    if (
      lowerAmount.includes('k') ||
      lowerAmount.includes('nghìn') ||
      lowerAmount.includes('nghin')
    ) {
      multiplier = 1000;
    } else if (
      lowerAmount.includes('m') ||
      lowerAmount.includes('triệu') ||
      lowerAmount.includes('trieu')
    ) {
      multiplier = 1000000;
    }

    // Remove currency terms to extract the numeric value
    cleanAmount = cleanAmount.replace(/k|m|nghìn|nghin|triệu|trieu/i, '').replace(/\s+/g, ''); // Remove spaces

    return parseInt(cleanAmount, 10) * multiplier;
  };

  const parseDate = (dateStr: string): Date => {
    // Try to parse dd/MM/yyyy
    let date = parse(dateStr, 'dd/MM/yyyy', new Date());

    // If invalid, try dd/MM (current year)
    if (!isValid(date)) {
      const today = new Date();
      date = parse(`${dateStr}/${today.getFullYear()}`, 'dd/MM/yyyy', today);
    }

    return isValid(date) ? date : new Date();
  };

  const parseTransactionType = (text: string): 'INCOME' | 'EXPENSE' => {
    if (TRANSACTION_REGEX.INCOME_INDICATORS.test(text)) {
      return 'INCOME';
    }

    if (TRANSACTION_REGEX.EXPENSE_INDICATORS.test(text)) {
      return 'EXPENSE';
    }

    // Default to expense if no specific indicators
    return 'EXPENSE';
  };

  const findBestCategoryMatch = (description: string): Category | undefined => {
    if (!categories || categories.length === 0) return undefined;

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
        'taxi',
        'grab',
        'xe ôm',
        'xăng',
        'đổ xăng',
        'gửi xe',
        'vé tàu',
        'vé xe',
        'vé máy bay',
      ],
      'sức khỏe': ['thuốc', 'khám', 'bệnh viện', 'phòng khám', 'bác sĩ', 'nha sĩ'],
      'tiền lương': ['lương', 'tiền lương', 'thu nhập', 'thưởng'],
    };

    // First, try to find a direct match in our mappings
    for (const [categoryName, activities] of Object.entries(activityMappings)) {
      if (
        activities.some((activity) => description.toLowerCase().includes(activity.toLowerCase()))
      ) {
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

  const parseTransaction = (text: string): ParsedTransaction | null => {
    if (!text.trim()) return null;

    try {
      // Extract amount
      const amountMatch = text.match(TRANSACTION_REGEX.AMOUNT);
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
      const category = findBestCategoryMatch(description);

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

  const parseMultipleTransactions = (text: string): ParsedTransaction[] => {
    // Split input by newlines
    const lines = text.split('\n').filter((line) => line.trim());

    // Parse each line
    const transactions = lines
      .map((line) => parseTransaction(line))
      .filter((transaction): transaction is ParsedTransaction => transaction !== null);

    return transactions;
  };

  const handleSubmit = async () => {
    if (parsedTransactions.length > 0) {
      try {
        setIsSubmitting(true);
        setProgress({ current: 0, total: parsedTransactions.length });
        const total = parsedTransactions.length;

        // Create each transaction one by one
        for (let i = 0; i < parsedTransactions.length; i++) {
          // Destructure and ignore 'category' to satisfy linter
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { category, ...transactionData } = parsedTransactions[i];

          // Update progress before submitting
          setProgress({ current: i + 1, total: parsedTransactions.length });

          // Submit the transaction and wait for it to complete
          await onSubmit(transactionData);
        }

        // Reset form after all transactions are created
        setInputText('');
        setParsedTransactions([]);

        // Show success message
        toast({
          title: 'Tạo giao dịch thành công',
          description: `Đã tạo ${total} giao dịch thành công.`,
        });

        // Trigger onComplete callback if provided
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('Error creating transactions:', error);
      } finally {
        setIsSubmitting(false);
        setProgress({ current: 0, total: 0 });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);

    if (value.trim()) {
      const parsed = parseMultipleTransactions(value);
      setParsedTransactions(parsed);
    } else {
      setParsedTransactions([]);
    }
  };

  const handleRemoveTransaction = (index: number) => {
    setParsedTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="border-input bg-background rounded-md border">
          <textarea
            className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[150px] w-full resize-none rounded-md bg-transparent px-3 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={`Nhập các giao dịch, mỗi dòng một giao dịch.\n\nVí dụ:\n+40k tiền lương\n+500 triệu tiền bán nhà\n40k đi ăn bánh cuốn\n100k đi chợ\n11/02 50k ăn ốc`}
            value={inputText}
            onChange={handleInputChange}
            rows={6}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          Mỗi dòng là một giao dịch riêng biệt. Ví dụ: +40k tiền lương, 40k đi ăn bánh cuốn (danh
          mục Ăn uống), 100k đi chợ (danh mục Mua sắm)
        </p>
      </div>

      {parsedTransactions.length > 0 && (
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Xem trước giao dịch</h3>
              <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                {parsedTransactions.length} giao dịch
              </span>
            </div>
          </div>

          <div className="max-h-[300px] overflow-auto pr-2">
            <div className="space-y-4">
              {parsedTransactions.map((transaction, index) => (
                <Card key={index} className="relative p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => handleRemoveTransaction(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'EXPENSE' ? (
                        <ArrowDownCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
                      ) : (
                        <ArrowUpCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      )}
                      <span className="truncate">
                        {transaction.type === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium whitespace-nowrap">Số tiền:</span>
                      <span className="truncate">
                        {formatAmount(transaction.amount.toString())} VND
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <span className="font-medium whitespace-nowrap">Mô tả:</span>
                      <span className="truncate">{transaction.description}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {format(transaction.date, 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium whitespace-nowrap">Danh mục:</span>
                      <span className="truncate">
                        {transaction.category?.name || 'Không xác định'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setParsedTransactions([])}
              disabled={isSubmitting}
            >
              Huỷ
            </Button>
            <Button className="gap-2" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo {progress.current}/{progress.total}
                </>
              ) : (
                <>
                  <ListChecks className="h-4 w-4" />
                  Tạo {parsedTransactions.length} giao dịch
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
