import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionType } from '@/types/transaction';

interface TransactionTypeSelectProps {
  onTypeChange: (type: TransactionType | undefined) => void;
  selectedType: TransactionType | undefined;
}

export function TransactionTypeSelect({ onTypeChange, selectedType }: TransactionTypeSelectProps) {
  const handleChange = (value: string) => {
    if (value === 'ALL') {
      onTypeChange(undefined);
    } else {
      onTypeChange(value as TransactionType);
    }
  };

  return (
    <Select onValueChange={handleChange} value={selectedType || 'ALL'}>
      <SelectTrigger className="h-10 w-full">
        <SelectValue placeholder="Loại giao dịch" />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectItem value="ALL">Tất cả giao dịch</SelectItem>
        <SelectItem value="INCOME">Thu nhập</SelectItem>
        <SelectItem value="EXPENSE">Chi tiêu</SelectItem>
      </SelectContent>
    </Select>
  );
}
