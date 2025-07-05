import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import {
  AvailabilityCheck,
  AlternativeOption,
  Region,
  TimeSlot,
} from '../models';
import { REGIONS, TIME_SLOTS, BUSINESS_RULES } from '../constants';
import { ReservationService } from './reservation';

@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {
  constructor(private reservationService: ReservationService) {}

  checkAvailability(
    date: string,
    timeSlot: string,
    regionId: string,
    partySize: number
  ): Observable<AvailabilityCheck> {
    return combineLatest([
      this.reservationService.getReservationsForSlot(date, timeSlot),
      of(REGIONS.find((r) => r.id === regionId)),
    ]).pipe(
      delay(300), // Simulate API call
      map(([existingReservations, region]) => {
        if (!region) {
          return {
            date,
            timeSlot,
            regionId,
            partySize,
            available: false,
            alternatives: [],
          };
        }

        const isRegionBooked = existingReservations.some(
          (reservation) => reservation.reservation.regionId === regionId
        );

        const isPartySizeValid =
          partySize <= region.maxSize &&
          partySize >= BUSINESS_RULES.MIN_PARTY_SIZE;

        const available = !isRegionBooked && isPartySizeValid;

        const alternatives = available
          ? []
          : this.getAlternatives(
              date,
              timeSlot,
              partySize,
              existingReservations
            );

        return {
          date,
          timeSlot,
          regionId,
          partySize,
          available,
          alternatives,
        };
      })
    );
  }

  getAvailableRegions(
    date: string,
    timeSlot: string,
    partySize: number,
    hasChildren: boolean,
    needsSmoking: boolean
  ): Observable<Region[]> {
    return this.reservationService.getReservationsForSlot(date, timeSlot).pipe(
      delay(200),
      map((existingReservations) => {
        return REGIONS.filter((region) => {
          if (partySize > region.maxSize) {
            return false;
          }
          if (hasChildren && !region.childrenAllowed) {
            return false;
          }
          if (needsSmoking && !region.smokingAllowed) {
            return false;
          }
          return true;
        });
      })
    );
  }

  getAvailableTimeSlots(date: string): Observable<TimeSlot[]> {
    return this.reservationService.getAllReservations().pipe(
      delay(200),
      map((allReservations) => {
        return TIME_SLOTS.map((time) => {
          const reservationsForSlot = allReservations.filter(
            (reservation) =>
              reservation.reservation.date === date &&
              reservation.reservation.timeSlot === time
          );

          const bookedRegions = reservationsForSlot.length;

          const available = bookedRegions < REGIONS.length;

          return {
            time,
            available,
            id: `${date}-${time}`,
          };
        });
      })
    );
  }

  getDateAvailability(date: string): Observable<boolean> {
    return this.reservationService.getAllReservations().pipe(
      delay(200),
      map((allReservations) => {
        const reservationsForDate = allReservations.filter(
          (reservation) => reservation.reservation.date === date
        );
        const totalPossibleSlots = REGIONS.length * TIME_SLOTS.length;
        return reservationsForDate.length < totalPossibleSlots;
      })
    );
  }

  getMultipleDateAvailability(
    dates: string[]
  ): Observable<{ [key: string]: boolean }> {
    return this.reservationService.getAllReservations().pipe(
      delay(200),
      map((allReservations) => {
        const availability: { [key: string]: boolean } = {};

        dates.forEach((date) => {
          const reservationsForDate = allReservations.filter(
            (reservation) => reservation.reservation.date === date
          );

          const totalPossibleSlots = REGIONS.length * TIME_SLOTS.length;
          availability[date] = reservationsForDate.length < totalPossibleSlots;
        });

        return availability;
      })
    );
  }

  getBookedRegions(date: string, timeSlot: string): Observable<string[]> {
    return this.reservationService.getReservationsForSlot(date, timeSlot).pipe(
      map((reservations) => {
        const bookedRegions = reservations.map((r) => r.reservation.regionId);
        return bookedRegions;
      })
    );
  }

  private getAlternatives(
    date: string,
    timeSlot: string,
    partySize: number,
    existingReservations: any[]
  ): AlternativeOption[] {
    const alternatives: AlternativeOption[] = [];

    TIME_SLOTS.forEach((altTimeSlot) => {
      if (altTimeSlot !== timeSlot) {
        const availableRegions = REGIONS.filter((region) => {
          if (partySize > region.maxSize) {
            return false;
          }

          const isBooked = existingReservations.some(
            (reservation) =>
              reservation.reservation.date === date &&
              reservation.reservation.timeSlot === altTimeSlot &&
              reservation.reservation.regionId === region.id
          );

          return !isBooked;
        });

        availableRegions.forEach((region) => {
          alternatives.push({
            timeSlot: altTimeSlot,
            regionId: region.id,
            regionName: region.name,
            available: true,
          });
        });
      }
    });

    return alternatives.slice(0, 3);
  }
}
