'use client';

import { Calendar, dateFnsLocalizer, Views, SlotInfo, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarEvent } from '@/types/events';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CalendarDays,
  CalendarIcon,
  ChevronDown,
  Calendar as CalendarMonth,
  LayoutGrid,
} from 'lucide-react';

// Cấu hình date-fns cho tiếng Việt
const locales = {
  vi: vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: vi }),
  getDay,
  locales,
});

// Types for custom views
type CustomViewKey = 'month' | 'week' | 'day' | 'agenda';
type CustomViewType = {
  [key in CustomViewKey]: {
    type: View;
    title: string;
    icon: React.ReactNode;
  };
};

// Custom views configuration
const customViews: CustomViewType = {
  month: {
    type: 'month',
    title: 'Tháng',
    icon: <CalendarMonth className="mr-2 h-4 w-4" />,
  },
  week: {
    type: 'week',
    title: 'Tuần',
    icon: <CalendarIcon className="mr-2 h-4 w-4" />,
  },
  day: {
    type: 'day',
    title: 'Ngày',
    icon: <CalendarDays className="mr-2 h-4 w-4" />,
  },
  agenda: {
    type: 'agenda',
    title: 'Lịch biểu',
    icon: <LayoutGrid className="mr-2 h-4 w-4" />,
  },
};

interface EventCalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: SlotInfo) => void;
}

export const EventCalendar = ({ events, onSelectEvent, onSelectSlot }: EventCalendarProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Đảm bảo chỉ render ở client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Component styling chỉ render ở client
  if (!mounted) return null;

  // Navigation controls
  const handleViewChange = (view: View): void => {
    setCurrentView(view);
  };

  const handleNavigate = (action: string): void => {
    let newDate = new Date(currentDate);

    switch (action) {
      case 'TODAY':
        newDate = new Date();
        break;
      case 'PREV':
        if (currentView === Views.MONTH) {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (currentView === Views.WEEK) {
          newDate = addDays(newDate, -7);
        } else if (currentView === Views.DAY) {
          newDate = addDays(newDate, -1);
        }
        break;
      case 'NEXT':
        if (currentView === Views.MONTH) {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (currentView === Views.WEEK) {
          newDate = addDays(newDate, 7);
        } else if (currentView === Views.DAY) {
          newDate = addDays(newDate, 1);
        }
        break;
      default:
        break;
    }

    setCurrentDate(newDate);
  };

  // Format the date header
  const formatHeader = (): string => {
    if (currentView === Views.MONTH) {
      return format(currentDate, 'MMMM yyyy', { locale: vi });
    } else if (currentView === Views.WEEK) {
      const start = startOfWeek(currentDate, { locale: vi });
      const end = addDays(start, 6);
      return `${format(start, 'dd/MM/yyyy', { locale: vi })} - ${format(end, 'dd/MM/yyyy', { locale: vi })}`;
    } else if (currentView === Views.DAY) {
      return format(currentDate, 'EEEE, dd/MM/yyyy', { locale: vi });
    }
    return format(currentDate, 'MMMM yyyy', { locale: vi });
  };

  // Get view title and icon for the current view
  const getCurrentViewInfo = () => {
    // Map standard view names to customView keys
    const viewMapping: Record<string, CustomViewKey> = {
      month: 'month',
      week: 'week',
      day: 'day',
      agenda: 'agenda',
    };

    const mappedView = viewMapping[currentView] || 'month';
    return customViews[mappedView];
  };

  // Current view info
  const currentViewInfo = getCurrentViewInfo();

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Custom calendar controls */}
      <div className="flex flex-col items-start justify-between gap-2 space-y-2 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
        <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
            onClick={() => handleNavigate('TODAY')}
          >
            Hôm nay
          </Button>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigate('PREV')}
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              &lt;
            </Button>
            <span className="min-w-[100px] px-1 text-center text-xs font-medium sm:min-w-[160px] sm:px-2 sm:text-sm md:min-w-40">
              {formatHeader()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigate('NEXT')}
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              &gt;
            </Button>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
            >
              {currentViewInfo.icon}
              <span className="xs:inline hidden">{currentViewInfo.title}</span>
              <ChevronDown className="ml-0 h-3 w-3 sm:ml-1 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.keys(customViews).map((viewKey) => {
              const view = customViews[viewKey as CustomViewKey];
              return (
                <DropdownMenuItem
                  key={viewKey}
                  className="flex cursor-pointer items-center gap-2 text-xs sm:text-sm"
                  onClick={() => handleViewChange(view.type)}
                >
                  {view.icon}
                  {view.title}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={`xs:h-[450px] h-[400px] w-full sm:h-[550px] md:h-[650px] lg:h-[750px] ${
          theme === 'dark' ? 'calendar-dark' : 'calendar-light'
        }`}
      >
        <style jsx global>{`
          /* Common styles for both themes */
          .rbc-calendar {
            font-size: 12px;
          }
          @media (min-width: 640px) {
            .rbc-calendar {
              font-size: 14px;
            }
          }
          .rbc-toolbar {
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 10px;
            font-size: 12px;
          }
          @media (min-width: 640px) {
            .rbc-toolbar {
              font-size: 14px;
            }
          }
          .rbc-toolbar button {
            padding: 5px 8px;
          }
          @media (min-width: 640px) {
            .rbc-toolbar button {
              padding: 6px 10px;
            }
          }
          .rbc-agenda-view table.rbc-agenda-table {
            font-size: 12px;
          }
          @media (min-width: 640px) {
            .rbc-agenda-view table.rbc-agenda-table {
              font-size: 14px;
            }
          }
          .rbc-header {
            padding: 4px 2px;
          }
          @media (min-width: 640px) {
            .rbc-header {
              padding: 8px 3px;
            }
          }
          .rbc-event {
            padding: 2px 3px;
            font-size: 11px;
            border-radius: 3px;
          }
          @media (min-width: 640px) {
            .rbc-event {
              padding: 4px 5px;
              font-size: 12px;
              border-radius: 4px;
            }
          }
          .rbc-day-slot .rbc-events-container {
            margin-right: 4px;
          }

          /* Dark theme styles */
          .calendar-dark .rbc-calendar {
            background-color: #1e1e2f;
            color: #f8f9fa;
          }
          .calendar-dark .rbc-toolbar button {
            color: #f8f9fa;
            background-color: #1e293b;
            border-color: #0f172a;
          }
          .calendar-dark .rbc-toolbar button:hover {
            background-color: #334155;
          }
          .calendar-dark .rbc-toolbar button.rbc-active {
            background-color: #0284c7;
            border-color: #0284c7;
          }
          .calendar-dark .rbc-header,
          .calendar-dark .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
            background-color: #1e293b;
            color: #f8f9fa;
            border-color: #1e293b;
          }
          .calendar-dark .rbc-month-view,
          .calendar-dark .rbc-time-view,
          .calendar-dark .rbc-agenda-view {
            border-color: #1e293b;
          }
          .calendar-dark .rbc-day-bg + .rbc-day-bg,
          .calendar-dark .rbc-header + .rbc-header,
          .calendar-dark .rbc-time-header-content,
          .calendar-dark .rbc-time-content,
          .calendar-dark .rbc-month-row + .rbc-month-row {
            border-color: #1e293b;
          }
          .calendar-dark .rbc-event {
            background-color: #0284c7;
          }
          .calendar-dark .rbc-today {
            background-color: rgba(2, 132, 199, 0.15);
          }
          .calendar-dark .rbc-off-range-bg {
            background-color: #111827;
          }
          .calendar-dark .rbc-agenda-view table.rbc-agenda-table tbody > tr {
            border-color: #1e293b;
          }
          .calendar-dark .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
            border-color: #1e293b;
          }
          .calendar-dark .rbc-time-view .rbc-time-gutter,
          .calendar-dark .rbc-time-view .rbc-day-slot .rbc-time-slot-group {
            border-color: #1e293b;
          }
          .calendar-dark .rbc-time-view .rbc-day-slot .rbc-time-slot {
            border-color: #1e293b;
          }
          .calendar-dark .rbc-day-slot .rbc-time-slot {
            border-color: #1e293b;
          }
          .calendar-dark .rbc-timeslot-group {
            border-color: #1e293b;
          }
          .rbc-toolbar {
            display: none;
          }
        `}</style>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={{
            month: true,
            week: true,
            day: true,
            agenda: true,
          }}
          view={currentView}
          date={currentDate}
          onView={handleViewChange}
          onNavigate={(date) => setCurrentDate(date)}
          style={{ height: '100%' }}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable
          messages={{
            today: 'Hôm nay',
            previous: 'Trước',
            next: 'Sau',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày',
            agenda: 'Lịch biểu',
            date: 'Ngày',
            time: 'Giờ',
            event: 'Sự kiện',
            allDay: 'Cả ngày',
            noEventsInRange: 'Không có sự kiện nào trong khoảng thời gian này',
          }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#0ea5e9', // Màu xanh dương cho events
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: '500',
            },
          })}
          dayPropGetter={(date) => {
            const today = new Date();
            return {
              style:
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
                  ? {
                      backgroundColor: theme === 'dark' ? '#1e40af20' : '#e0f2fe',
                    }
                  : {},
            };
          }}
        />
      </div>
    </div>
  );
};
