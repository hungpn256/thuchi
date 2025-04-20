"use client";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { useEventList, useCreateEvent } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Calendar,
  ArrowUpRight,
  CalendarIcon,
  Clock,
} from "lucide-react";
import { ROUTES } from "@/constants/app.constant";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

// Form data cho việc tạo sự kiện mới
interface NewEventFormData {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  expectedAmount?: number;
}

export default function EventsPage() {
  const router = useRouter();
  const { data: events = [], isLoading } = useEventList();
  const createEvent = useCreateEvent();
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

      toast({
        title: "Tạo sự kiện thành công",
        description: "Sự kiện mới đã được thêm vào danh sách của bạn",
      });
    } catch (error: unknown) {
      console.error("Lỗi khi tạo sự kiện:", error);
      toast({
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
          <h1 className="text-3xl font-bold tracking-tight">Sự kiện</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push(ROUTES.EVENTS.CALENDAR)}
            >
              <Calendar className="w-4 h-4" />
              Xem lịch
            </Button>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Calendar className="w-12 h-12 text-muted-foreground" />
                <h3 className="text-xl font-medium">Không có sự kiện nào</h3>
                <p className="text-muted-foreground">
                  Bạn chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!
                </p>
                <Button
                  className="gap-2 mt-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setIsNewEventDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Tạo sự kiện
                </Button>
              </div>
            </div>
          ) : (
            events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <CardHeader className="p-4 pb-2 bg-gradient-to-r from-primary-500/10 to-primary-600/10">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center border-t pt-3">
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        {format(new Date(event.startDate), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                        {" - "}
                        {format(new Date(event.endDate), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </p>
                    </div>
                    {event.expectedAmount && (
                      <div className="text-sm font-medium text-primary-700 dark:text-primary-400">
                        {formatCurrency(event.expectedAmount)}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs text-primary"
                    >
                      Chi tiết
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

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
    </div>
  );
}
