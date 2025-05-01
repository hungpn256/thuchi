import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCategories } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from './ui/use-toast';
import { getErrorMessage } from '@/utils/error';

interface CategoryComboboxProps {
  value?: number;
  onValueChange?: (value: number) => void;
}

export function CategoryCombobox({ value, onValueChange }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { categories, createCategory } = useCategories();

  const selectedCategory = categories.find((category) => category.id === value);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateCategory = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!search) return;
    try {
      const newCategory = await createCategory.mutateAsync({ name: search });
      onValueChange?.(newCategory.id);
      setOpen(false);
      setSearch('');
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra',
        description: getErrorMessage(error, 'Không thể tạo danh mục'),
      });
      console.error('Failed to create category:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={(e) => e.stopPropagation()}
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          {selectedCategory ? selectedCategory.name : 'Chọn danh mục...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" onPointerDownOutside={(e) => e.preventDefault()}>
        <Command shouldFilter={false} onPointerDownCapture={(e) => e.stopPropagation()}>
          <CommandInput
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="px-4 py-2">
              <div className="flex items-center justify-between">
                <span>Không tìm thấy danh mục</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateCategory(e);
                  }}
                  disabled={!search || createCategory.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo mới
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={(value) => {
                    const categoryToSelect = categories.find(
                      (c) => c.name.toLowerCase() === value.toLowerCase(),
                    );
                    if (categoryToSelect) {
                      onValueChange?.(categoryToSelect.id);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === category.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {search && filteredCategories.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={(e) => {
                      // Prevent event bubbling
                      const event = e as unknown as React.MouseEvent;
                      event.stopPropagation?.();
                      handleCreateCategory();
                    }}
                    disabled={createCategory.isPending}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo mới &quot;{search}&quot;
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
