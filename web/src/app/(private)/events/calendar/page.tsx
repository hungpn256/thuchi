"use client";

import { Header } from "@/components/layout/Header";
import { EventCalendar } from "@/components/calendar/EventCalendar";
import {
  useEventList,
  useDeleteEvent,
  useCreateEvent,
} from "@/hooks/use-events";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Plus,
  Trash,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { CalendarEvent } from "@/types/events";

// Form data cho việc tạo sự kiện mới
interface NewEventFormData {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  expectedAmount?: number;
}

// Toast function
const showToast = ({
  title,
  description,
  variant,
}: {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}) => {
  console.log(
    `${variant === "destructive" ? "Error: " : ""}${title}${description ? ` - ${description}` : ""}`
  );
  // In a real app, you would use a toast library here
};

export default function EventCalendarPage() {
  const router = useRouter();
  const { data: events = [], isLoading } = useEventList();
  const deleteEvent = useDeleteEvent();
  const createEvent = useCreateEvent();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewEventFormData>({
    defaultValues: {
      startTime: "08:00",
      endTime: "17:00",
    },
  });

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
      showToast({
        title: "Xóa sự kiện thành công",
        description: "Sự kiện đã được xóa khỏi lịch của bạn",
      });
    } catch (error: unknown) {
      console.error("Lỗi khi xóa sự kiện:", error);
      showToast({
        title: "Lỗi khi xóa sự kiện",
        description: "Đã xảy ra lỗi, vui lòng thử lại sau",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmitNewEvent = async (data: NewEventFormData) => {
    try {
      setIsCreating(true);

      // Tạo ngày bắt đầu từ selectedDate và startTime
      const startDate = new Date(selectedDate);
      const [startHour, startMinute] = data.startTime.split(":").map(Number);
      startDate.setHours(startHour, startMinute, 0);

      // Tạo ngày kết thúc từ selectedDate và endTime
      const endDate = new Date(selectedDate);
      const [endHour, endMinute] = data.endTime.split(":").map(Number);
      endDate.setHours(endHour, endMinute, 0);

      await createEvent.mutateAsync({
        name: data.name,
        description: data.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        expectedAmount: data.expectedAmount
          ? Number(data.expectedAmount)
          : undefined,
      });

      setIsNewEventDialogOpen(false);
      reset();

      showToast({
        title: "Tạo sự kiện thành công",
        description: "Sự kiện mới đã được thêm vào lịch của bạn",
      });
    } catch (error: unknown) {
      console.error("Lỗi khi tạo sự kiện:", error);
      showToast({
        title: "Lỗi khi tạo sự kiện",
        description: "Đã xảy ra lỗi, vui lòng thử lại sau",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/10 via-background/50 to-background/80">
      <Header />
      <div className="container mx-auto py-10 px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Lịch sự kiện</h1>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
            onClick={() => {
              setSelectedDate(new Date());
              setIsNewEventDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tạo sự kiện mới
          </Button>
        </div>

        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-neumorphic-dark border-white/20 border bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-[700px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <DialogTitle className="text-xl font-semibold">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedEvent?.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Mô tả
                </h3>
                <p>{selectedEvent.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Bắt đầu
                </h3>
                <p>
                  {format(
                    selectedEvent?.start || new Date(),
                    "EEEE, dd/MM/yyyy",
                    { locale: vi }
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Kết thúc
                </h3>
                <p>
                  {format(
                    selectedEvent?.end || new Date(),
                    "EEEE, dd/MM/yyyy",
                    { locale: vi }
                  )}
                </p>
              </div>
            </div>
            {selectedEvent?.expectedAmount && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Số tiền dự kiến
                </h3>
                <p className="font-medium text-primary-600 dark:text-primary-400">
                  {formatCurrency(selectedEvent.expectedAmount)} VND
                </p>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="w-4 h-4" />
                  Xóa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-amber-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
                  onClick={() => {
                    setIsDialogOpen(false);
                    router.push(`/events/${selectedEvent?.id}/edit`);
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </Button>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
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

      {/* Dialog tạo sự kiện mới */}
      <Dialog
        open={isNewEventDialogOpen}
        onOpenChange={setIsNewEventDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Tạo sự kiện mới
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmitNewEvent)}
            className="space-y-4 pt-4"
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Ngày:</span>
                  <span>
                    {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Tên sự kiện <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="Nhập tên sự kiện"
                  {...register("name", {
                    required: "Tên sự kiện không được để trống",
                  })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Mô tả
                </label>
                <Input
                  id="description"
                  placeholder="Nhập mô tả (tùy chọn)"
                  {...register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="flex items-center text-sm font-medium text-foreground mb-1"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Thời gian bắt đầu
                  </label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register("startTime", { required: true })}
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="flex items-center text-sm font-medium text-foreground mb-1"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Thời gian kết thúc
                  </label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register("endTime", { required: true })}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="expectedAmount"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Số tiền dự kiến (VND)
                </label>
                <Input
                  id="expectedAmount"
                  type="number"
                  placeholder="Nhập số tiền (tùy chọn)"
                  {...register("expectedAmount")}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewEventDialogOpen(false);
                  reset();
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>Tạo sự kiện</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa sự kiện */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Sự kiện sẽ bị xóa vĩnh viễn khỏi
              hệ thống.
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
