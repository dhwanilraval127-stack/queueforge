export interface Session {
  id: string;
  code: string;
  name: string;
  capacity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithStats extends Session {
  acceptedCount: number;
  waitlistCount: number;
  availableSeats: number;
  utilization: number;
}

export interface SessionInput {
  code: string;
  name: string;
  capacity: number;
  active?: boolean;
}