'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCategories } from '@/hooks/use-categories';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarIcon,
  ListChecks,
  Loader2,
  Mic,
  MicOff,
  X,
} from 'lucide-react';
import { formatAmount } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { ParsedTransaction, parseMultipleTransactions } from '@/utils/transaction-parser';

interface VoiceInputProps {
  onSubmit: (transaction: Omit<ParsedTransaction, 'category'>) => Promise<void>;
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

export function VoiceInput({ onSubmit, onComplete }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { categories } = useCategories();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentLineRef = useRef<string>('');

  // Browser compatibility check
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

  // Initialize speech recognition on mount
  useEffect(() => {
    // Check if the browser supports Speech Recognition
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    setIsSpeechRecognitionSupported(!!SpeechRecognition);
  }, []);

  // Parse transcript when it changes
  useEffect(() => {
    if (transcript.trim()) {
      setIsProcessing(true);
      try {
        const parsed = parseMultipleTransactions(transcript, categories);
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
  }, [transcript, categories]);

  // Add the current line to transcript and update the UI immediately
  const addLineToTranscript = (line: string) => {
    if (line.trim()) {
      setTranscript((prev) => (prev ? `${prev}\n${line.trim()}` : line.trim()));
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

    // Create a new instance for each session
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = false; // Only one recognition per session
    recognition.interimResults = true;
    recognition.lang = 'vi-VN';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript;
      currentLineRef.current = text;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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

    recognition.onend = () => {
      // Add current line to transcript if it has content
      if (currentLineRef.current.trim()) {
        addLineToTranscript(currentLineRef.current);
      }

      setIsListening(false);
    };

    // Start recognition
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
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

  const clearTranscript = () => {
    setTranscript('');
    setParsedTransactions([]);
  };

  const handleRemoveTransaction = (index: number) => {
    setParsedTransactions((prev) => prev.filter((_, i) => i !== index));
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
        setTranscript('');
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

  const handleTranscriptEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? 'destructive' : 'default'}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                Dừng ghi âm
              </>
            ) : (
              <>
                <Mic className={`h-4 w-4 ${isProcessing ? 'animate-pulse' : ''}`} />
                Bắt đầu ghi âm
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={clearTranscript}
            disabled={!transcript || isSubmitting || isProcessing}
          >
            Xóa
          </Button>

          {isProcessing && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </div>
          )}
        </div>

        {!isSpeechRecognitionSupported && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói. Vui lòng sử dụng Chrome,
            Edge, hoặc Safari.
          </div>
        )}

        {isListening && (
          <div className="border-input bg-background relative flex items-center rounded-md border p-3 text-sm">
            <Activity className="text-primary mr-2 h-4 w-4 animate-pulse" />
            <span>{'Đang lắng nghe...'}</span>
          </div>
        )}

        <div className="border-input bg-background relative rounded-md border p-3 text-sm">
          <textarea
            value={transcript}
            onChange={handleTranscriptEdit}
            className="min-h-[100px] w-full resize-none bg-transparent focus:outline-none disabled:cursor-not-allowed"
            placeholder="Mỗi lần ghi âm sẽ tạo một dòng mới. Bạn cũng có thể chỉnh sửa trực tiếp ở đây."
            disabled={isListening || isSubmitting}
            rows={5}
          />
        </div>

        <p className="text-muted-foreground text-sm">
          Mẹo: Mỗi lần ghi âm sẽ tạo một giao dịch mới. Nói rõ số tiền và mô tả, ví dụ: &quot;chi 50
          nghìn đi ăn phở&quot;, &quot;thu nhập 5 triệu tiền lương&quot;
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
              onClick={clearTranscript}
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
