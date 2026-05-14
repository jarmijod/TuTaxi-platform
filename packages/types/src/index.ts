export enum RoleType {
  ADMIN = 'ADMIN',
  USER = 'USER',
  DRIVER = 'DRIVER',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: RoleType;
  isActive: boolean;
  createdAt: string;
}

export interface IDriver {
  id: string;
  licenseNumber: string;
  status: DriverStatus;
  rating: number;
  totalTrips: number;
  isVerified: boolean;
  userId: string;
}

export interface IVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  status: VehicleStatus;
  capacity: number;
  driverId: string;
}
