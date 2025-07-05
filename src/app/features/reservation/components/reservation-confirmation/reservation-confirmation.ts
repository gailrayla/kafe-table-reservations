import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import {
  ReservationService,
  ReservationResponse,
  REGIONS,
} from '../../../../core';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-reservation-confirmation',
  standalone: true,
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './reservation-confirmation.html',
  styleUrls: ['./reservation-confirmation.scss'],
})
export class ReservationConfirmation implements OnInit {
  reservation$: Observable<ReservationResponse | null>;
  loading$ = new BehaviorSubject<boolean>(true);
  error$ = new BehaviorSubject<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) {
    this.reservation$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const confirmationNumber = params.get('confirmationNumber');
        if (!confirmationNumber) {
          this.loading$.next(false);
          this.error$.next('Invalid confirmation number');
          return of(null);
        }
        return this.reservationService.getReservationByConfirmation(
          confirmationNumber
        );
      }),
      tap((reservation) => {
        this.loading$.next(false);

        if (!reservation) {
          this.error$.next('Reservation not found');
        } else {
          this.error$.next(null);
        }
      }),
      catchError((error) => {
        console.error('Error loading reservation:', error);
        this.loading$.next(false);
        this.error$.next('Failed to load reservation');
        return of(null);
      })
    );
  }

  ngOnInit(): void {}

  makeNewReservation(): void {
    this.router.navigate(['/reservation']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getRegionName(regionId: string): string {
    if (!regionId) return '';
    const region = REGIONS.find((r) => r.id === regionId);
    return region?.name || 'Unknown Region';
  }
}
