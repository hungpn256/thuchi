import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/constants/app.constant';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { X, Check, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
}

interface MultiCategorySelectProps {
  onCategoriesChange: (categoryIds: number[]) => void;
  selectedCategories: number[];
}

export function MultiCategorySelect({
  onCategoriesChange,
  selectedCategories,
}: MultiCategorySelectProps) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery<Category[]>({
    queryKey: QUERY_KEYS.CATEGORIES.LIST(),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.CATEGORIES.LIST);
      return data;
    },
  });

  const handleSelect = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const clearSelection = () => {
    onCategoriesChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            'relative w-full py-2 text-left',
            selectedCategories.length > 0 ? 'justify-start' : 'justify-between',
          )}
        >
          <div className="flex w-full flex-wrap gap-1 pr-6">
            {selectedCategories.length > 0 ? (
              selectedCategories.map((catId) => {
                const cat = data?.find((c) => c.id === catId);
                return (
                  <Badge
                    key={catId}
                    variant="secondary"
                    className="mr-1 mb-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(catId);
                    }}
                  >
                    {cat?.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                );
              })
            ) : (
              <span className="truncate">Chọn danh mục</span>
            )}
          </div>
          <ChevronDown className="absolute top-1/2 right-3 h-4 w-4 shrink-0 -translate-y-1/2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        {selectedCategories.length > 0 && (
          <div className="flex items-center justify-between border-b p-2">
            <span className="text-muted-foreground text-sm">
              Đã chọn {selectedCategories.length} danh mục
            </span>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Xóa
            </Button>
          </div>
        )}
        <Command>
          <CommandInput placeholder="Tìm danh mục..." />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>Không tìm thấy danh mục</CommandEmpty>
            <CommandGroup>
              {isLoading ? (
                <div className="text-muted-foreground p-2 text-sm">Đang tải...</div>
              ) : (
                data?.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => handleSelect(category.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCategories.includes(category.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
