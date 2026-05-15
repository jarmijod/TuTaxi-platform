'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: { lat: number; lng: number; label?: string; color?: string }[];
  route?: [number, number][];
  driverLocation?: { lat: number; lng: number } | null;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export function Map({
  center = [40.4168, -3.7038],
  zoom = 13,
  markers = [],
  route,
  driverLocation,
  className = '',
  onMapClick,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeRef = useRef<L.Polyline | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const onClickRef = useRef(onMapClick);
  onClickRef.current = onMapClick;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
    }).addTo(mapRef.current);

    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      onClickRef.current?.(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, mapRef.current.getZoom());
    }
  }, [center[0], center[1]]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((m) => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${m.color || '#0ea5e9'};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(mapRef.current!);
      if (m.label) marker.bindPopup(m.label);
      markersRef.current.push(marker);
    });

    if (markers.length >= 2) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [markers]);

  // Update route
  useEffect(() => {
    if (!mapRef.current) return;
    routeRef.current?.remove();

    if (route && route.length >= 2) {
      routeRef.current = L.polyline(route, {
        color: '#0ea5e9',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 12',
      }).addTo(mapRef.current);
    }
  }, [route]);

  // Update driver location
  useEffect(() => {
    if (!mapRef.current) return;
    driverMarkerRef.current?.remove();

    if (driverLocation) {
      const icon = L.divIcon({
        className: 'driver-marker',
        html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚗</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      driverMarkerRef.current = L.marker(
        [driverLocation.lat, driverLocation.lng],
        { icon },
      ).addTo(mapRef.current);
    }
  }, [driverLocation]);

  return <div ref={containerRef} className={`w-full h-full rounded-2xl ${className}`} />;
}
