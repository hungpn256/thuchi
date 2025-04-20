import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import axiosClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/constants/app.constant";
import { QUERY_KEYS } from "@/constants/query-keys.constant";

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateEventDTO extends Partial<CreateEventDTO> {}

export const useCreateEvent = () => {
  return useMutation<Event, Error, CreateEventDTO>({
    mutationFn: async (newEvent: CreateEventDTO) => {
      try {
        const { data } = await axiosClient.post<Event>(
          API_ENDPOINTS.EVENTS.CREATE,
          newEvent
        );
        return data;
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Failed to create event");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS.ALL });
    },
  });
};

export const useEventList = () => {
  return useQuery<Event[], Error>({
    queryKey: QUERY_KEYS.EVENTS.LIST(),
    queryFn: async () => {
      try {
        const { data } = await axiosClient.get<Event[]>(
          API_ENDPOINTS.EVENTS.LIST
        );
        return data;
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch events");
      }
    },
  });
};

export const useEvent = (id: number) => {
  return useQuery<Event, Error>({
    queryKey: QUERY_KEYS.EVENTS.DETAIL(id),
    queryFn: async () => {
      try {
        const { data } = await axiosClient.get<Event>(
          `${API_ENDPOINTS.EVENTS.DETAIL}/${id}`
        );
        return data;
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(`Failed to fetch event with id ${id}`);
      }
    },
    enabled: !!id,
  });
};

export const useUpdateEvent = () => {
  return useMutation<Event, Error, { id: number; data: UpdateEventDTO }>({
    mutationFn: async ({ id, data }) => {
      try {
        const response = await axiosClient.patch<Event>(
          `${API_ENDPOINTS.EVENTS.UPDATE}/${id}`,
          data
        );
        return response.data;
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(`Failed to update event with id ${id}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EVENTS.DETAIL(variables.id),
      });
    },
  });
};

export const useDeleteEvent = () => {
  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      try {
        await axiosClient.delete(`${API_ENDPOINTS.EVENTS.DELETE}/${id}`);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(`Failed to delete event with id ${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS.ALL });
    },
  });
};

export const useEventsByCategory = (categoryId: number) => {
  return useQuery<Event[], Error>({
    queryKey: QUERY_KEYS.EVENTS.BY_CATEGORY(categoryId),
    queryFn: async () => {
      try {
        const { data } = await axiosClient.get<Event[]>(
          `${API_ENDPOINTS.EVENTS.BY_CATEGORY}/${categoryId}`
        );
        return data;
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(`Failed to fetch events for category ${categoryId}`);
      }
    },
    enabled: !!categoryId,
  });
};
