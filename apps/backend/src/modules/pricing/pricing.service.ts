import { Injectable } from '@nestjs/common';

interface Coordinates {
  lat: number;
  lng: number;
}

export interface PriceEstimate {
  distance: number; // km
  duration: number; // minutes
  price: number;
  breakdown: { base: number; perKm: number; perMin: number };
}

@Injectable()
export class PricingService {
  private readonly BASE_FARE = 2.5;
  private readonly PER_KM = 1.2;
  private readonly PER_MIN = 0.3;
  private readonly MIN_FARE = 5.0;

  calculatePrice(origin: Coordinates, destination: Coordinates): PriceEstimate {
    const distance = this.haversineDistance(origin, destination);
    const duration = Math.round(distance * 2.5); // ~2.5 min per km estimate
    const price = Math.max(
      this.MIN_FARE,
      this.BASE_FARE + distance * this.PER_KM + duration * this.PER_MIN,
    );

    return {
      distance: Math.round(distance * 100) / 100,
      duration,
      price: Math.round(price * 100) / 100,
      breakdown: {
        base: this.BASE_FARE,
        perKm: Math.round(distance * this.PER_KM * 100) / 100,
        perMin: Math.round(duration * this.PER_MIN * 100) / 100,
      },
    };
  }

  haversineDistance(a: Coordinates, b: Coordinates): number {
    const R = 6371;
    const dLat = this.toRad(b.lat - a.lat);
    const dLng = this.toRad(b.lng - a.lng);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const calc =
      sinLat * sinLat +
      Math.cos(this.toRad(a.lat)) * Math.cos(this.toRad(b.lat)) * sinLng * sinLng;
    return R * 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
