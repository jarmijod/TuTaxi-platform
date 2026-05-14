'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useRideStore } from '@/store/ride.store';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user, accessToken } = useAuthStore();
  const { setDriverLocation } = useRideStore();

  useEffect(() => {
    if (!user || !accessToken) return;

    const socket = io(`${SOCKET_URL}/rides`, {
      query: { userId: user.id },
      auth: { token: accessToken },
    });

    socket.on('ride:driver_location', (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user, accessToken, setDriverLocation]);

  const joinRide = (rideId: string) => {
    socketRef.current?.emit('join:ride', rideId);
  };

  const leaveRide = (rideId: string) => {
    socketRef.current?.emit('leave:ride', rideId);
  };

  return { socket: socketRef.current, joinRide, leaveRide };
}
