import { useMutation } from '@tanstack/react-query';
import { GoogleGenAI, Type } from '@google/genai';

export interface AIParsedTransaction {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
}

interface UseParseTransactionsAIResult {
  parseTransactions: (text: string) => Promise<AIParsedTransaction[]>;
  isLoading: boolean;
  error: string | null;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_STUDIO_AI_KEY as string;

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function aiParseTransactions(text: string): Promise<AIParsedTransaction[]> {
  const prompt = `Hãy phân tích đoạn text sau thành danh sách các giao dịch tài chính. Mỗi giao dịch gồm: type (INCOME/EXPENSE), amount (number), description (string), date (yyyy/MM/dd), giờ hiện tại là ${new Date().toString()}. Trả về kết quả dạng JSON array để có thể dùng js JSON.parse thành object được.\n\nText: ${text}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: 'Type of the transaction',
              nullable: false,
              enum: ['INCOME', 'EXPENSE'],
            },
            amount: {
              type: Type.NUMBER,
              description: 'Amount of the transaction',
              nullable: false,
            },
            description: {
              type: Type.STRING,
              description: 'Description of the transaction',
              nullable: true,
            },
            date: {
              type: Type.STRING,
              description: 'Date of the transaction in format yyyy/MM/dd',
              nullable: false,
            },
          },
          required: ['type', 'amount', 'date'],
        },
      },
    },
  });

  const data = JSON.parse(response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}');
  let transactions: AIParsedTransaction[] = [];
  if (Array.isArray(data)) {
    transactions = data;
  }

  return transactions;
}

export function useParseTransactionsAI(): UseParseTransactionsAIResult {
  const { mutateAsync, isPending, error } = useMutation<AIParsedTransaction[], unknown, string>({
    mutationFn: aiParseTransactions,
  });

  return {
    parseTransactions: mutateAsync,
    isLoading: isPending,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}
