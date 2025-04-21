import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchInputProps {
  onSearch: (term: string) => void;
  initialSearch?: string;
  placeholder?: string;
}

export function SearchInput({
  onSearch,
  initialSearch = '',
  placeholder = 'Tìm kiếm...',
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 500);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex w-full items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="text-muted-foreground h-4 w-4" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pr-10 pl-10"
          value={searchTerm}
          onChange={handleChange}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 h-full p-0 pr-3"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
