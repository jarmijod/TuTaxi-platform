import { api } from '@/lib/axios';

export const driverService = {
  goOnline: (driverId: string, latitude: number, longitude: number) =>
    api.post('/tracking/online', { driverId, latitude, longitude }).then((r) => r.data),

  goOffline: (driverId: string) =>
    api.post('/tracking/offline', { driverId }).then((r) => r.data),

  updateLocation: (driverId: string, latitude: number, longitude: number, speed?: number, heading?: number) =>
    api.post('/tracking/location', { driverId, latitude, longitude, speed, heading }).then((r) => r.data),

  acceptRide: (rideId: string, driverId: string) =>
    api.post(`/rides/${rideId}/accept`, { driverId }).then((r) => r.data),

  updateRideStatus: (rideId: string, status: string) =>
    api.patch(`/rides/${rideId}/status`, { status }).then((r) => r.data),

  getActiveRide: () =>
    api.get('/rides/active').then((r) => r.data),

  getDriverRides: (page = 1) =>
    api.get(`/rides/history?page=${page}`).then((r) => r.data),
};
