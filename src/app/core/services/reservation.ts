import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { ReservationRequest, ReservationResponse } from '../models';
import { ReservationStatus, RegionType } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private reservationsSubject = new BehaviorSubject<ReservationResponse[]>([]);
  public reservations$ = this.reservationsSubject.asObservable();

  private readonly STORAGE_KEY = 'kafe_reservations';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadReservationsFromStorage();
    }
  }

  private loadReservationsFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (stored) {
        const reservations = JSON.parse(stored);
        reservations.forEach((r: ReservationResponse) => {
          r.createdAt = new Date(r.createdAt);
        });
        this.reservationsSubject.next(reservations);
      } else {
      }
    } catch (error) {
      console.error('Error loading reservations from localStorage:', error);
    }
  }

  private saveReservationsToStorage(reservations: ReservationResponse[]): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reservations));
    } catch (error) {
      console.error('Error saving reservations to localStorage:', error);
    }
  }

  private get reservations(): ReservationResponse[] {
    return this.reservationsSubject.value;
  }

  createReservation(
    request: ReservationRequest
  ): Observable<ReservationResponse> {
    return of(request).pipe(
      delay(1000), // Simulate API call
      map((req) => {
        const reservation: ReservationResponse = {
          id: this.generateId(),
          confirmationNumber: this.generateConfirmationNumber(),
          status: ReservationStatus.CONFIRMED,
          createdAt: new Date(),
          reservation: req,
        };

        const updatedReservations = [...this.reservations, reservation];
        this.reservationsSubject.next(updatedReservations);
        this.saveReservationsToStorage(updatedReservations);

        return reservation;
      }),
      catchError((error) => {
        console.error('Error creating reservation:', error);
        return throwError(() => new Error('Failed to create reservation'));
      })
    );
  }

  getReservationByConfirmation(
    confirmationNumber: string
  ): Observable<ReservationResponse | null> {
    return of(confirmationNumber).pipe(
      delay(300), // Simulate API call
      map((confNum) => {
        const currentReservations = this.reservations;

        const reservation = currentReservations.find(
          (r) => r.confirmationNumber === confNum
        );

        return reservation || null;
      }),
      catchError((error) => {
        console.error('Error finding reservation:', error);
        return of(null);
      })
    );
  }

  getReservationsForSlot(
    date: string,
    timeSlot: string
  ): Observable<ReservationResponse[]> {
    return of(null).pipe(
      delay(200),
      map(() => {
        const currentReservations = this.reservations;
        const reservationsForSlot = currentReservations.filter(
          (r) =>
            r.reservation.date === date && r.reservation.timeSlot === timeSlot
        );
        return reservationsForSlot;
      })
    );
  }

  cancelReservation(confirmationNumber: string): Observable<boolean> {
    return of(confirmationNumber).pipe(
      delay(500),
      map((confNum) => {
        const currentReservations = this.reservations;
        const reservationIndex = currentReservations.findIndex(
          (r) => r.confirmationNumber === confNum
        );

        if (reservationIndex === -1) {
          throw new Error('Reservation not found');
        }

        const updatedReservations = [...currentReservations];
        updatedReservations[reservationIndex].status =
          ReservationStatus.CANCELLED;

        this.reservationsSubject.next(updatedReservations);
        this.saveReservationsToStorage(updatedReservations);

        return true;
      }),
      catchError((error) => {
        console.error('Error cancelling reservation:', error);
        return throwError(() => new Error('Failed to cancel reservation'));
      })
    );
  }

  getAllReservations(): Observable<ReservationResponse[]> {
    return this.reservations$;
  }

  clearAllReservations(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.reservationsSubject.next([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateConfirmationNumber(): string {
    return 'KF' + Date.now().toString(36).substr(-6).toUpperCase();
  }
}
