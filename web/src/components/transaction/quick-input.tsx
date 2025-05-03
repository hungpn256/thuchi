'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCategories } from '@/hooks/use-categories';
import { ArrowDownCircle, ArrowUpCircle, CalendarIcon, ListChecks, Loader2, X } from 'lucide-react';
import { formatAmount } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { ParsedTransaction, parseMultipleTransactions } from '@/utils/transaction-parser';

interface QuickInputProps {
  onSubmit: (transaction: Omit<ParsedTransaction, 'category'>) => Promise<void>;
  onComplete?: () => void;
}

export function QuickInput({ onSubmit, onComplete }: QuickInputProps) {
  const [inputText, setInputText] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { categories } = useCategories();

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
      setIsProcessing(true);
      try {
        const parsed = parseMultipleTransactions(value, categories);
        setParsedTransactions(parsed);
      } catch (error) {
        console.error('Error parsing transactions:', error);
        toast({
          title: 'Lỗi xử lý',
          description: 'Không thể phân tích văn bản thành giao dịch',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
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
        <div className="border-input bg-background relative rounded-md border">
          <textarea
            className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[150px] w-full resize-none rounded-md bg-transparent px-3 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={`+40k tiền lương\n+500 triệu tiền bán nhà\n40k đi ăn bánh cuốn\n100k đi chợ\n11/02 50k ăn ốc`}
            value={inputText}
            onChange={handleInputChange}
            rows={6}
            disabled={isSubmitting}
          />
          {isProcessing && (
            <div className="absolute top-3 right-3">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}
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
              disabled={isSubmitting || isProcessing}
            >
              Huỷ
            </Button>
            <Button
              className="gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || isProcessing}
            >
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
