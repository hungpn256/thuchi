'use client';

import { Header } from '@/components/layout/Header';
import { EventCalendar } from '@/components/calendar/EventCalendar';
import { useEventList, useDeleteEvent, useCreateEvent, useUpdateEvent } from '@/hooks/use-events';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { CalendarEvent } from '@/types/events';
import {
  EventForm,
  EventFormValues,
  eventToFormValues,
  formValuesToEventData,
} from '@/components/event/EventForm';
import { toast } from '@/components/ui/use-toast';
import { EventEntity } from '@/types/event';

export default function EventCalendarPage() {
  const router = useRouter();
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
    try {
      setIsCreating(true);

      // Log dữ liệu form để debug
      console.log('Original form data:', data);

      // Chuyển đổi dữ liệu form sang dữ liệu event
      const eventData = formValuesToEventData(data);

      // Log dữ liệu đã chuyển đổi để debug
      console.log('Converted event data:', eventData);
      console.log('StartDate with time:', new Date(eventData.startDate).toLocaleString());
      console.log('EndDate with time:', new Date(eventData.endDate).toLocaleString());

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
      <Header />
      <div className="container mx-auto space-y-8 px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Lịch sự kiện</h1>
          </div>
          <Button
            className="from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 gap-2 bg-gradient-to-r"
            onClick={() => {
              setSelectedDate(new Date());
              setIsNewEventDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Tạo sự kiện mới
          </Button>
        </div>

        <Card className="dark:shadow-neumorphic-dark border border-white/20 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl dark:bg-gray-800/80">
          {isLoading ? (
            <div className="flex h-[700px] items-center justify-center">
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedEvent?.description && (
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">Mô tả</h3>
                <p>{selectedEvent.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">Bắt đầu</h3>
                <p>
                  {format(selectedEvent?.start || new Date(), 'EEEE, dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">Kết thúc</h3>
                <p>
                  {format(selectedEvent?.end || new Date(), 'EEEE, dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
            </div>
            {selectedEvent?.expectedAmount && (
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">Số tiền dự kiến</h3>
                <p className="text-primary-600 dark:text-primary-400 font-medium">
                  {formatCurrency(selectedEvent.expectedAmount)} VND
                </p>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4" />
                  Xóa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-amber-500 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-950"
                  onClick={openEditEventDialog}
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                    router.push(`/events/${selectedEvent?.id}`);
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog tạo sự kiện mới sử dụng component chung */}
      <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Tạo sự kiện mới</DialogTitle>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Chỉnh sửa sự kiện</DialogTitle>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Sự kiện sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleDeleteEvent();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
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
