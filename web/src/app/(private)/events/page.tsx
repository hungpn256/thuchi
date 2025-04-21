'use client';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { useEventList, useCreateEvent, useUpdateEvent } from '@/hooks/use-events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Edit } from 'lucide-react';
import { ROUTES } from '@/constants/app.constant';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { EventEntity } from '@/types/event';
import {
  EventForm,
  EventFormValues,
  eventToFormValues,
  formValuesToEventData,
} from '@/components/event/EventForm';

export default function EventsPage() {
  const router = useRouter();
  const { data: events = [], isLoading } = useEventList();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventEntity | null>(null);

  const openCreateDialog = () => {
    setCurrentEvent(null);
    setIsEditing(false);
    setIsEventDialogOpen(true);
  };

  const openEditDialog = (event: EventEntity) => {
    setCurrentEvent(event);
    setIsEditing(true);
    setIsEventDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEventDialogOpen(false);
    setCurrentEvent(null);
  };

  const handleSubmitEvent = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      const eventData = formValuesToEventData(data);

      if (isEditing && data.id) {
        // Cập nhật sự kiện
        await updateEvent.mutateAsync({
          id: data.id,
          data: eventData,
        });
        toast({
          title: 'Cập nhật sự kiện thành công',
          description: 'Sự kiện đã được cập nhật',
        });
      } else {
        // Tạo sự kiện mới
        await createEvent.mutateAsync(eventData);
        toast({
          title: 'Tạo sự kiện thành công',
          description: 'Sự kiện mới đã được thêm vào danh sách của bạn',
        });
      }

      setIsEventDialogOpen(false);
      setCurrentEvent(null);
    } catch (error: unknown) {
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
      <Header />
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
              <Card
                key={event.id}
                className="overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                <CardHeader className="from-primary-500/10 to-primary-600/10 bg-gradient-to-r p-4 pb-2">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {event.description && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        {format(new Date(event.startDate), 'dd/MM/yyyy', {
                          locale: vi,
                        })}
                        {' - '}
                        {format(new Date(event.endDate), 'dd/MM/yyyy', {
                          locale: vi,
                        })}
                      </p>
                    </div>
                    {event.expectedAmount && (
                      <div className="text-primary-700 dark:text-primary-400 text-sm font-medium">
                        {formatCurrency(event.expectedAmount)}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary gap-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(event);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                      Chỉnh sửa
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
            onCancel={handleCloseDialog}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
