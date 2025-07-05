import { ReservationStatus } from '../enums/reservation-status.enum';

export interface ReservationRequest {
  date: string;
  timeSlot: string;
  partySize: number;
  regionId: string;
  customerInfo: CustomerInfo;
  hasChildren: boolean;
  needsSmoking: boolean;
}

export interface ReservationResponse {
  id: string;
  confirmationNumber: string;
  status: ReservationStatus;
  createdAt: Date;
  reservation: ReservationRequest;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ReservationFormData {
  date: string;
  timeSlot: string;
  partySize: number;
  regionId: string;
  name: string;
  email: string;
  phone: string;
  hasChildren: boolean;
  needsSmoking: boolean;
}
