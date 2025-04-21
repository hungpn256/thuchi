import { Event } from './events';

export interface EventEntity extends Event {
  // Kế thừa tất cả thuộc tính từ Event interface và thêm các thuộc tính mới nếu cần

  // Các trường bổ sung cho hiển thị ngày và giờ (nếu cần)
  allDay?: boolean;
  displayTime?: boolean;

  // Các trường bổ sung khác có thể thêm ở đây
}

// Re-export các interface từ events.ts để sử dụng nhất quán
export type { Event, CreateEventDTO, UpdateEventDTO, CalendarEvent } from './events';
