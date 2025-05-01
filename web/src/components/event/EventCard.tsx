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
import { Can } from '@/components/Can';
import { Action } from '@/casl/ability';

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

  // Format date for compact display
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM', { locale: vi });
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: vi });
  };

  return (
    <Card
      className={cn(
        'overflow-hidden text-sm transition-all duration-200 hover:shadow-lg',
        hasClickHandler ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      onClick={handleClick}
    >
      <CardHeader
        className={cn(
          'from-primary-500/10 to-primary-600/10 bg-gradient-to-r',
          useDropdownActions
            ? 'flex flex-row items-center justify-between p-2 sm:p-3'
            : 'p-3 pb-2 sm:p-4 sm:pb-2',
        )}
      >
        <CardTitle className="line-clamp-1 text-base leading-tight sm:text-lg">
          {event.name}
        </CardTitle>
        {!hideActions && useDropdownActions && (onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 sm:h-8 sm:w-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel className="text-xs sm:text-sm">Thao tác</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onEdit && (
                <Can action={Action.Update} subject="Event">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(event);
                    }}
                    className="text-xs text-amber-500 focus:bg-amber-50 focus:text-amber-500 sm:text-sm dark:focus:bg-amber-950"
                  >
                    <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                </Can>
              )}
              {onDelete && (
                <Can action={Action.Delete} subject="Event">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(event);
                    }}
                    className="text-xs text-red-500 focus:bg-red-50 focus:text-red-500 sm:text-sm dark:focus:bg-red-950"
                  >
                    <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Xóa
                  </DropdownMenuItem>
                </Can>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className={useDropdownActions ? 'p-0' : 'space-y-2 p-3 sm:space-y-3 sm:p-4'}>
        {event.description &&
          (useDropdownActions ? (
            <div className="p-2 pb-2 sm:p-4 sm:pb-3">
              <p
                className={cn(
                  'text-muted-foreground text-xs sm:text-sm',
                  !showFullDetails && 'line-clamp-2',
                )}
              >
                {event.description}
              </p>
            </div>
          ) : (
            <p
              className={cn(
                'text-muted-foreground text-xs sm:text-sm',
                !showFullDetails && 'line-clamp-2',
              )}
            >
              {event.description}
            </p>
          ))}

        {useDropdownActions && <Separator className="mb-2 sm:mb-3" />}

        <div
          className={
            useDropdownActions
              ? 'space-y-1.5 px-2 pb-3 sm:space-y-2 sm:px-4 sm:pb-4'
              : 'space-y-1.5 sm:space-y-2'
          }
        >
          <div className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <Calendar className="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
            <p className="text-muted-foreground">
              <span className="inline sm:hidden">
                {formatDate(event.startDate)} {formatTime(event.startDate)}
                {' - '}
                {formatDate(event.endDate)} {formatTime(event.endDate)}
              </span>
              <span className="hidden sm:inline">
                {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', {
                  locale: vi,
                })}
                {' - '}
                {format(new Date(event.endDate), 'dd/MM/yyyy HH:mm', {
                  locale: vi,
                })}
              </span>
            </p>
          </div>
          {event.expectedAmount && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <DollarSign className="text-primary-700 dark:text-primary-400 h-3 w-3 sm:h-4 sm:w-4" />
              <div className="text-primary-700 dark:text-primary-400 text-xs font-medium sm:text-sm">
                {formatCurrency(event.expectedAmount)}
              </div>
            </div>
          )}
        </div>

        {!hideActions && !useDropdownActions && (
          <div className="flex justify-end space-x-2 pt-1">
            {onEdit && (
              <Can action={Action.Update} subject="Event">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 px-2 text-xs text-amber-500 hover:bg-amber-50 hover:text-amber-500 sm:h-8 sm:px-3 sm:text-sm dark:hover:bg-amber-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                  }}
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  Chỉnh sửa
                </Button>
              </Can>
            )}
            {onDelete && (
              <Can action={Action.Delete} subject="Event">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-500 sm:h-8 sm:px-3 sm:text-sm dark:hover:bg-red-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event);
                  }}
                >
                  <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                  Xóa
                </Button>
              </Can>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
