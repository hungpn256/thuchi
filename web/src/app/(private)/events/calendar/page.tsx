'use client';

import { EventCalendar } from '@/components/calendar/EventCalendar';
import { useEventList, useDeleteEvent, useCreateEvent, useUpdateEvent } from '@/hooks/use-events';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { CalendarEvent } from '@/types/events';
import {
  EventForm,
  EventFormValues,
  eventToFormValues,
  formValuesToEventData,
} from '@/components/event/EventForm';
import { toast } from '@/components/ui/use-toast';
import { EventEntity } from '@/types/event';
import { EventCard } from '@/components/event/EventCard';

export default function EventCalendarPage() {
  const { data: events = [], isLoading } = useEventList();
  const deleteEvent = useDeleteEvent();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [currentEditEvent, setCurrentEditEvent] = useState<EventEntity | null>(null);

  // Format sự kiện cho calendar
  const calendarEvents: CalendarEvent[] = events.map((event) => ({
    id: event.id,
    title: event.name,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    description: event.description,
    expectedAmount: event.expectedAmount,
  }));

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setIsDeleting(true);
      await deleteEvent.mutateAsync(Number(selectedEvent.id));
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
      toast({
        title: 'Xóa sự kiện thành công',
        description: 'Sự kiện đã được xóa khỏi lịch của bạn',
      });
    } catch (error: unknown) {
      console.error('Lỗi khi xóa sự kiện:', error);
      toast({
        title: 'Lỗi khi xóa sự kiện',
        description: 'Đã xảy ra lỗi, vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeNewEventDialog = () => {
    setIsNewEventDialogOpen(false);
  };

  const closeEditEventDialog = () => {
    setIsEditEventDialogOpen(false);
    setCurrentEditEvent(null);
  };

  const openEditEventDialog = () => {
    if (!selectedEvent) return;

    // Tìm event đầy đủ từ danh sách events
    const eventToEdit = events.find((event) => event.id === selectedEvent.id);
    if (eventToEdit) {
      setCurrentEditEvent(eventToEdit as EventEntity);
      setIsEditEventDialogOpen(true);
      setIsDialogOpen(false);
    }
  };

  const handleCreateEvent = async (data: EventFormValues) => {
    console.log('🚀 ~ handleCreateEvent ~ data:', data);
    try {
      setIsCreating(true);

      // Chuyển đổi dữ liệu form sang dữ liệu event
      const eventData = formValuesToEventData(data);

      // Gửi request tạo event
      await createEvent.mutateAsync(eventData);
      setIsNewEventDialogOpen(false);

      toast({
        title: 'Tạo sự kiện thành công',
        description: 'Sự kiện mới đã được thêm vào lịch của bạn',
      });
    } catch (error: unknown) {
      console.error('Lỗi khi tạo sự kiện:', error);
      toast({
        title: 'Lỗi khi tạo sự kiện',
        description: 'Đã xảy ra lỗi, vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateEvent = async (data: EventFormValues) => {
    if (!data.id) return;

    try {
      setIsUpdating(true);
      const eventData = formValuesToEventData(data);

      await updateEvent.mutateAsync({
        id: data.id,
        data: eventData,
      });

      setIsEditEventDialogOpen(false);
      setCurrentEditEvent(null);

      toast({
        title: 'Cập nhật sự kiện thành công',
        description: 'Sự kiện đã được cập nhật thành công',
      });
    } catch (error: unknown) {
      console.error('Lỗi khi cập nhật sự kiện:', error);
      toast({
        title: 'Lỗi khi cập nhật sự kiện',
        description: 'Đã xảy ra lỗi, vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="from-background/10 via-background/50 to-background/80 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto space-y-4 px-2 py-4 sm:space-y-6 sm:px-4 sm:py-6 md:space-y-8 md:py-10">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              Lịch sự kiện
            </h1>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 ml-2 h-6 px-1.5 sm:ml-4"
              size="sm"
              onClick={() => {
                setSelectedDate(new Date());
                setIsNewEventDialogOpen(true);
              }}
            >
              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-xs sm:text-sm">Tạo mới</span>
            </Button>
          </div>
        </div>

        <Card className="dark:shadow-neumorphic-dark border border-white/20 bg-white/80 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl sm:p-4 md:p-6 dark:bg-gray-800/80">
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center sm:h-[550px] md:h-[650px] lg:h-[750px]">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2 sm:h-10 sm:w-10 md:h-12 md:w-12"></div>
            </div>
          ) : (
            <EventCalendar
              events={calendarEvents}
              onSelectEvent={handleEventSelect}
              onSelectSlot={(slotInfo) => {
                // Mở dialog tạo sự kiện mới với ngày đã chọn
                setSelectedDate(slotInfo.start);
                setIsNewEventDialogOpen(true);
              }}
            />
          )}
        </Card>
      </div>

      {/* Dialog hiển thị chi tiết sự kiện */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] border-none bg-transparent p-0 shadow-none sm:max-w-md md:max-w-lg">
          {selectedEvent && events.find((e) => e.id === selectedEvent.id) && (
            <EventCard
              event={events.find((e) => e.id === selectedEvent.id) as EventEntity}
              hideActions={false}
              onEdit={() => openEditEventDialog()}
              onDelete={() => setIsDeleteDialogOpen(true)}
              className="max-w-full shadow-xl"
              onClick={() => {}}
              showFullDetails={true}
              useDropdownActions={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog tạo sự kiện mới sử dụng component chung */}
      <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold sm:text-xl">Tạo sự kiện mới</DialogTitle>
          </DialogHeader>
          <EventForm
            defaultValues={{
              date: selectedDate,
              startTime: '08:00',
              endTime: '17:00',
            }}
            onSubmit={handleCreateEvent}
            onCancel={closeNewEventDialog}
            isSubmitting={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa sự kiện sử dụng component chung */}
      <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold sm:text-xl">
              Chỉnh sửa sự kiện
            </DialogTitle>
          </DialogHeader>
          {currentEditEvent && (
            <EventForm
              defaultValues={eventToFormValues(currentEditEvent)}
              onSubmit={handleUpdateEvent}
              onCancel={closeEditEventDialog}
              isSubmitting={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa sự kiện */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              Bạn có chắc chắn muốn xóa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Hành động này không thể hoàn tác. Sự kiện sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <AlertDialogCancel
              className="mt-0 h-8 px-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
              disabled={isDeleting}
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedEvent(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 bg-red-500 px-2 text-xs hover:bg-red-600 sm:h-10 sm:px-4 sm:text-sm"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteEvent();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-white sm:h-4 sm:w-4"></div>
                  Đang xóa...
                </>
              ) : (
                <>Xóa</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
