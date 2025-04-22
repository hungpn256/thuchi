'use client';

import { Button } from '@/components/ui/button';
import { useEventList, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/use-events';
import { Plus, Calendar } from 'lucide-react';
import { ROUTES } from '@/constants/app.constant';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { EventEntity } from '@/types/event';
import {
  EventForm,
  EventFormValues,
  eventToFormValues,
  formValuesToEventData,
} from '@/components/event/EventForm';
import { EventCard } from '@/components/event/EventCard';
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

export default function EventsPage() {
  const router = useRouter();
  const { data: events = [], isLoading } = useEventList();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  // Dialog states
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Operation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Data states
  const [currentEvent, setCurrentEvent] = useState<EventEntity | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventEntity | null>(null);

  // Dialog handlers
  const openCreateDialog = useCallback(() => {
    setCurrentEvent(null);
    setIsEditing(false);
    setIsEventDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((event: EventEntity) => {
    setCurrentEvent(event);
    setIsEditing(true);
    setIsEventDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((event: EventEntity) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  }, []);

  // Action handlers
  const handleDeleteEvent = () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    deleteEvent.mutate(Number(eventToDelete.id), {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        toast({
          title: 'Xóa sự kiện thành công',
          description: 'Sự kiện đã được xóa khỏi danh sách của bạn',
        });
        setEventToDelete(null);
      },
      onError: (error) => {
        console.error('Lỗi khi xóa sự kiện:', error);
        toast({
          title: 'Lỗi khi xóa sự kiện',
          description: 'Đã xảy ra lỗi, vui lòng thử lại sau',
          variant: 'destructive',
        });
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  };

  const handleSubmitEvent = async (data: EventFormValues) => {
    setIsSubmitting(true);
    const eventData = formValuesToEventData(data);

    try {
      if (isEditing && data.id) {
        // Cập nhật sự kiện
        await updateEvent.mutateAsync({
          id: data.id,
          data: eventData,
        });
        setIsEventDialogOpen(false);
        toast({
          title: 'Cập nhật sự kiện thành công',
          description: 'Sự kiện đã được cập nhật',
        });
        setCurrentEvent(null);
        setIsEditing(false);
      } else {
        // Tạo sự kiện mới
        await createEvent.mutateAsync(eventData);
        setIsEventDialogOpen(false);
        toast({
          title: 'Tạo sự kiện thành công',
          description: 'Sự kiện mới đã được thêm vào danh sách của bạn',
        });
        setCurrentEvent(null);
      }
    } catch (error) {
      console.error('Lỗi khi xử lý sự kiện:', error);
      toast({
        title: isEditing ? 'Lỗi khi cập nhật sự kiện' : 'Lỗi khi tạo sự kiện',
        description: 'Đã xảy ra lỗi, vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="from-background/10 via-background/50 to-background/80 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto space-y-8 px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-3xl font-bold tracking-tight">Sự kiện</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push(ROUTES.EVENTS.CALENDAR)}
            >
              <Calendar className="h-4 w-4" />
              Xem lịch
            </Button>
            <Button
              className="from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 gap-2 bg-gradient-to-r"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4" />
              Tạo sự kiện mới
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex h-[400px] items-center justify-center">
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full rounded-xl bg-white p-10 text-center shadow dark:bg-gray-800">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Calendar className="text-muted-foreground h-12 w-12" />
                <h3 className="text-xl font-medium">Không có sự kiện nào</h3>
                <p className="text-muted-foreground">
                  Bạn chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!
                </p>
                <Button
                  className="from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 mt-2 gap-2 bg-gradient-to-r"
                  onClick={openCreateDialog}
                >
                  <Plus className="h-4 w-4" />
                  Tạo sự kiện
                </Button>
              </div>
            </div>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={openEditDialog}
                onClick={() => openEditDialog(event)}
                useDropdownActions={true}
                onDelete={() => openDeleteDialog(event)}
              />
            ))
          )}
        </div>
      </div>

      {/* Dialog tạo/chỉnh sửa sự kiện */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            defaultValues={currentEvent ? eventToFormValues(currentEvent) : undefined}
            onSubmit={handleSubmitEvent}
            onCancel={() => setIsEventDialogOpen(false)}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />
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
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setEventToDelete(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
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
