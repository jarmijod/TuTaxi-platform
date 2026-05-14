import { create } from 'zustand';

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface RideState {
  origin: Location | null;
  destination: Location | null;
  activeRideId: string | null;
  driverLocation: { lat: number; lng: number } | null;
  setOrigin: (origin: Location) => void;
  setDestination: (destination: Location) => void;
  setActiveRide: (id: string | null) => void;
  setDriverLocation: (loc: { lat: number; lng: number } | null) => void;
  reset: () => void;
}

export const useRideStore = create<RideState>((set) => ({
  origin: null,
  destination: null,
  activeRideId: null,
  driverLocation: null,
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setActiveRide: (id) => set({ activeRideId: id }),
  setDriverLocation: (loc) => set({ driverLocation: loc }),
  reset: () => set({ origin: null, destination: null, activeRideId: null, driverLocation: null }),
}));
