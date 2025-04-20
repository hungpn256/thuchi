export interface Event {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  expectedAmount?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDTO {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  expectedAmount?: number;
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id?: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: unknown;
  description?: string;
  expectedAmount?: number;
}
