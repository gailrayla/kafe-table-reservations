import { Region } from '../models/region.model';
import { RegionType } from '../enums/region-type.enum';

export const REGIONS: Region[] = [
  {
    id: RegionType.MAIN_HALL,
    name: 'Main Hall',
    maxSize: 12,
    childrenAllowed: true,
    smokingAllowed: false,
  },
  {
    id: RegionType.BAR,
    name: 'Bar',
    maxSize: 4,
    childrenAllowed: false,
    smokingAllowed: false,
  },
  {
    id: RegionType.RIVERSIDE,
    name: 'Riverside',
    maxSize: 8,
    childrenAllowed: true,
    smokingAllowed: false,
  },
  {
    id: RegionType.RIVERSIDE_SMOKING,
    name: 'Riverside (Smoking)',
    maxSize: 6,
    childrenAllowed: false,
    smokingAllowed: true,
  },
];

export const BUSINESS_RULES = {
  MAX_PARTY_SIZE: 12,
  MIN_PARTY_SIZE: 1,
  RESERVATION_WINDOW_MINUTES: 30,
  OPENING_TIME: '18:00',
  CLOSING_TIME: '22:00',
} as const;
