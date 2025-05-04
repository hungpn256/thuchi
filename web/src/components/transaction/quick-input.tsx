'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCategories } from '@/hooks/use-categories';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarIcon,
  ListChecks,
  Loader2,
  Mic,
  MicOff,
} from 'lucide-react';
import { formatAmount } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { ParsedTransaction } from '@/utils/transaction-parser';
import { useParseTransactionsAI } from '@/hooks/useParseTransactionsAI';
import { findBestCategoryMatch } from '@/utils/transaction-parser';
import { useCreateTransactionsBatch } from '@/hooks/use-transactions';

interface QuickInputProps {
  onComplete?: () => void;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

// TypeScript definitions for Web Speech API
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

// Custom type definitions for Speech Recognition Events
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export function QuickInput({ onComplete }: QuickInputProps) {
  const [inputText, setInputText] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const { categories } = useCategories();
  const { parseTransactions, isLoading: isParsingAI, error: aiError } = useParseTransactionsAI();
  const { mutateAsync: createBatch, isPending: isBatchLoading } = useCreateTransactionsBatch();

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentLineRef = useRef<string>('');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

  // Initialize speech recognition on mount
  useEffect(() => {
    // Check if the browser supports Speech Recognition
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    setIsSpeechRecognitionSupported(!!SpeechRecognition);
    // Create a new instance for each session
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = false; // Only one recognition per session
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'vi-VN';
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (parsedTransactions.length > 0) {
      try {
        const payload = parsedTransactions.map((t) => ({
          type: t.type,
          amount: t.amount,
          description: t.description,
          date: format(t.date, 'yyyy-MM-dd'),
          categoryId: t.categoryId!,
        }));
        await createBatch(payload);
        setInputText('');
        setParsedTransactions([]);
        toast({
          title: 'Tạo giao dịch thành công',
          description: `Đã tạo ${payload.length} giao dịch thành công.`,
        });
        if (onComplete) onComplete();
      } catch (error) {
        console.error('Error creating transactions:', error);
        toast({
          title: 'Lỗi tạo giao dịch',
          description: 'Không thể tạo giao dịch',
          variant: 'destructive',
        });
      }
    }
  };

  const handlePreview = async () => {
    if (!inputText.trim()) return;
    setParsedTransactions([]);
    try {
      const aiResult = await parseTransactions(inputText);
      const mapped = aiResult.map((item) => {
        const category = findBestCategoryMatch(item.description, categories);
        return {
          type: item.type,
          amount: item.amount,
          description: item.description,
          date: new Date(item.date),
          categoryId: category?.id,
          category,
        };
      });
      setParsedTransactions(mapped);
    } catch (error) {
      console.error('Error parsing transactions:', error);
      toast({
        title: 'Lỗi AI',
        description: aiError || 'Không thể phân tích giao dịch',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);
  };

  // Voice input functions
  const addLineToTranscript = (line: string) => {
    if (line.trim()) {
      setInputText((prev) => (prev ? `${prev}\n${line.trim()}` : line.trim()));
      currentLineRef.current = '';
    }
  };

  const startListening = () => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: 'Trình duyệt không hỗ trợ',
        description:
          'Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome, Edge, hoặc Safari.',
        variant: 'destructive',
      });
      return;
    }

    // Clear current line for new recording
    currentLineRef.current = '';
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript;
        currentLineRef.current = text;
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);

        if (event.error !== 'aborted') {
          toast({
            title: 'Lỗi nhận diện giọng nói',
            description: `Đã xảy ra lỗi: ${event.error}`,
            variant: 'destructive',
          });
        }

        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // Add current line to transcript if it has content
        if (currentLineRef.current.trim()) {
          addLineToTranscript(currentLineRef.current);
        }

        setIsListening(false);
      };

      // Start recognition
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      // Save the current line before stopping
      if (currentLineRef.current.trim()) {
        addLineToTranscript(currentLineRef.current);
      }
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
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
            disabled={isBatchLoading || isParsingAI || isListening}
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {isParsingAI && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
            {isSpeechRecognitionSupported && (
              <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 rounded-full p-0 ${
                  isListening
                    ? 'bg-rose-100 text-rose-500 hover:bg-rose-200 dark:bg-rose-900/50'
                    : ''
                }`}
                onClick={toggleListening}
                disabled={isBatchLoading || isParsingAI}
                title={isListening ? 'Dừng ghi âm' : 'Ghi âm giọng nói'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Mỗi dòng là một giao dịch riêng biệt. Ví dụ: +40k tiền lương, 40k đi ăn bánh cuốn
          </p>
          {isListening && (
            <p className="animate-pulse text-sm font-medium text-rose-500">Đang ghi âm...</p>
          )}
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            onClick={handlePreview}
            disabled={isParsingAI || isBatchLoading || !inputText.trim()}
            variant="secondary"
          >
            {isParsingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Preview
          </Button>
        </div>
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
              disabled={isBatchLoading || isParsingAI}
            >
              Huỷ
            </Button>
            <Button
              className="gap-2"
              onClick={handleSubmit}
              disabled={isBatchLoading || isParsingAI}
            >
              {isBatchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo giao dịch
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
