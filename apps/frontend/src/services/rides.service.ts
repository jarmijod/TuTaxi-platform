import { api } from '@/lib/axios';

export interface RequestRidePayload {
  originAddress: string;
  destinationAddress: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

export const ridesService = {
  request: (data: RequestRidePayload) =>
    api.post('/rides/request', data).then((r) => r.data),

  getActive: () =>
    api.get('/rides/active').then((r) => r.data),

  getRide: (id: string) =>
    api.get(`/rides/${id}`).then((r) => r.data),

  getHistory: (page = 1) =>
    api.get(`/rides/history?page=${page}`).then((r) => r.data),

  cancel: (id: string, reason?: string) =>
    api.post(`/rides/${id}/cancel`, { reason }).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/rides/${id}/status`, { status }).then((r) => r.data),
};
