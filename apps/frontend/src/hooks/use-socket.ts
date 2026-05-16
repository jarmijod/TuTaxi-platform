'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { useRideStore } from '@/store/ride.store';

function getSocketUrl() {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user, accessToken } = useAuthStore();
  const { setDriverLocation } = useRideStore();

  useEffect(() => {
    if (!user || !accessToken) return;

    const socket = io(`${getSocketUrl()}/rides`, {
      query: { userId: user.id },
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('ride:driver_location', (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, accessToken]);

  const joinRide = useCallback((rideId: string) => {
    socketRef.current?.emit('join:ride', rideId);
  }, []);

  const leaveRide = useCallback((rideId: string) => {
    socketRef.current?.emit('leave:ride', rideId);
  }, []);

  return { socket: socketRef.current, joinRide, leaveRide };
}
