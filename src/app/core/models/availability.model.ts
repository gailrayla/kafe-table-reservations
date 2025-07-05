export interface AvailabilityCheck {
  date: string;
  timeSlot: string;
  regionId: string;
  partySize: number;
  available: boolean;
  alternatives?: AlternativeOption[];
}

export interface AlternativeOption {
  timeSlot: string;
  regionId: string;
  regionName: string;
  available: boolean;
}

export interface TimeSlot {
  time: string; // Format: "18:00", "18:30", etc.
  available: boolean;
  id: string;
}
