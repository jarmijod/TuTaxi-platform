export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'USER' | 'DRIVER';
  isActive: boolean;
}

export interface Driver {
  id: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  totalTrips: number;
  user: User;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

export interface AuthResponse {
  user: Pick<User, 'id' | 'email' | 'role'>;
  token: string;
}
