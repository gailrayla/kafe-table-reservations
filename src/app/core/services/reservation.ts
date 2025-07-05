import { Injectable } from '@angular/core';
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

  // Mock existing reservations for testing
  private mockReservations: ReservationResponse[] = [
    {
      id: '1',
      confirmationNumber: 'KF001',
      status: ReservationStatus.CONFIRMED,
      createdAt: new Date('2024-07-24T10:30:00'),
      reservation: {
        date: '2024-07-24',
        timeSlot: '19:00',
        partySize: 4,
        regionId: RegionType.MAIN_HALL,
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
        hasChildren: false,
        needsSmoking: false,
      },
    },
    {
      id: '2',
      confirmationNumber: 'KF002',
      status: ReservationStatus.CONFIRMED,
      createdAt: new Date('2024-07-25T14:15:00'),
      reservation: {
        date: '2024-07-25',
        timeSlot: '20:00',
        partySize: 2,
        regionId: RegionType.BAR,
        customerInfo: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1987654321',
        },
        hasChildren: false,
        needsSmoking: false,
      },
    },
  ];

  constructor() {
    this.reservationsSubject.next(this.mockReservations);
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

        this.mockReservations.push(reservation);
        this.reservationsSubject.next([...this.mockReservations]);

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
    return of(null).pipe(
      delay(300),
      map(() => {
        const reservation = this.mockReservations.find(
          (r) => r.confirmationNumber === confirmationNumber
        );
        return reservation || null;
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
        return this.mockReservations.filter(
          (r) =>
            r.reservation.date === date && r.reservation.timeSlot === timeSlot
        );
      })
    );
  }

  cancelReservation(confirmationNumber: string): Observable<boolean> {
    return of(confirmationNumber).pipe(
      delay(500),
      map((confNum) => {
        const reservationIndex = this.mockReservations.findIndex(
          (r) => r.confirmationNumber === confNum
        );

        if (reservationIndex === -1) {
          throw new Error('Reservation not found');
        }

        this.mockReservations[reservationIndex].status =
          ReservationStatus.CANCELLED;
        this.reservationsSubject.next([...this.mockReservations]);

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

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateConfirmationNumber(): string {
    return 'KF' + Date.now().toString(36).substr(-6).toUpperCase();
  }
}
