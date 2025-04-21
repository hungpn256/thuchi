import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Edit, Trash, Calendar, DollarSign, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { EventEntity } from '@/types/event';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

interface EventCardProps {
  event: EventEntity;
  onEdit?: (event: EventEntity) => void;
  onDelete?: (event: EventEntity) => void;
  onClick?: (event: EventEntity) => void;
  hideActions?: boolean;
  className?: string;
  showFullDetails?: boolean;
  useDropdownActions?: boolean;
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  onClick,
  hideActions = false,
  className,
  showFullDetails = false,
  useDropdownActions = false,
}: EventCardProps) {
  const hasClickHandler = onClick && onClick !== (() => {});

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if we have a handler and it's not the dropdown or its children
    if (onClick && hasClickHandler && !e.defaultPrevented) {
      onClick(event);
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-lg',
        hasClickHandler ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      onClick={handleClick}
    >
      <CardHeader
        className={cn(
          'from-primary-500/10 to-primary-600/10 bg-gradient-to-r',
          useDropdownActions ? 'flex flex-row items-center justify-between p-3' : 'p-4 pb-2',
        )}
      >
        <CardTitle className="text-lg leading-tight">{event.name}</CardTitle>
        {!hideActions && useDropdownActions && (onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(event);
                  }}
                  className="text-amber-500 focus:bg-amber-50 focus:text-amber-500 dark:focus:bg-amber-950"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(event);
                  }}
                  className="text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-950"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className={useDropdownActions ? 'p-0' : 'space-y-3 p-4'}>
        {event.description &&
          (useDropdownActions ? (
            <div className="p-4 pb-3">
              <p
                className={cn('text-muted-foreground text-sm', !showFullDetails && 'line-clamp-2')}
              >
                {event.description}
              </p>
            </div>
          ) : (
            <p className={cn('text-muted-foreground text-sm', !showFullDetails && 'line-clamp-2')}>
              {event.description}
            </p>
          ))}

        {useDropdownActions && <Separator className="mb-3" />}

        <div className={useDropdownActions ? 'space-y-2 px-4 pb-4' : 'space-y-2'}>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <p className="text-muted-foreground">
              {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', {
                locale: vi,
              })}
              {' - '}
              {format(new Date(event.endDate), 'dd/MM/yyyy HH:mm', {
                locale: vi,
              })}
            </p>
          </div>
          {event.expectedAmount && (
            <div className="flex items-center gap-2">
              <DollarSign className="text-primary-700 dark:text-primary-400 h-4 w-4" />
              <div className="text-primary-700 dark:text-primary-400 text-sm font-medium">
                {formatCurrency(event.expectedAmount)}
              </div>
            </div>
          )}
        </div>

        {!hideActions && !useDropdownActions && (
          <div className="flex justify-end space-x-2 pt-1">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-amber-500 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-950"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event);
                }}
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event);
                }}
              >
                <Trash className="h-4 w-4" />
                Xóa
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
