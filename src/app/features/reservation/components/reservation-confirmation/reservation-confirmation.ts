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
  template: `
    <div class="reservation-confirmation">
      <div class="reservation-confirmation__container">
        <!-- Loading State -->
        <div class="reservation-confirmation__loading" *ngIf="loading$ | async">
          <app-loading-spinner
            size="large"
            message="Loading your reservation..."
          ></app-loading-spinner>
        </div>

        <!-- Error State -->
        <div
          class="reservation-confirmation__error"
          *ngIf="(error$ | async) && !(loading$ | async)"
        >
          <div class="reservation-confirmation__error-icon">❌</div>
          <h2 class="reservation-confirmation__error-title">
            Reservation Not Found
          </h2>
          <p class="reservation-confirmation__error-message">
            {{ error$ | async }}
          </p>
          <button
            class="reservation-confirmation__btn reservation-confirmation__btn--primary"
            (click)="makeNewReservation()"
          >
            Make New Reservation
          </button>
        </div>

        <!-- Success State -->
        <div
          class="reservation-confirmation__success"
          *ngIf="(reservation$ | async) && !(loading$ | async)"
        >
          <div class="reservation-confirmation__success-icon">✅</div>

          <h1 class="reservation-confirmation__title">
            Reservation Confirmed!
          </h1>
          <p class="reservation-confirmation__subtitle">
            Your table has been reserved. We're excited to welcome you to Kafè!
          </p>

          <div class="reservation-confirmation__card">
            <ng-container *ngIf="reservation$ | async as reservation">
              <div class="reservation-confirmation__confirmation-number">
                <div class="reservation-confirmation__label">
                  Confirmation Number
                </div>
                <div
                  class="reservation-confirmation__value reservation-confirmation__value--highlight"
                >
                  {{ reservation.confirmationNumber }}
                </div>
              </div>

              <div class="reservation-confirmation__details">
                <div class="reservation-confirmation__detail-section">
                  <h3 class="reservation-confirmation__section-title">
                    📅 Date & Time
                  </h3>
                  <div class="reservation-confirmation__detail">
                    <strong>{{
                      formatDate(reservation.reservation.date)
                    }}</strong>
                  </div>
                  <div class="reservation-confirmation__detail">
                    {{ formatTime(reservation.reservation.timeSlot) }}
                  </div>
                </div>

                <div class="reservation-confirmation__detail-section">
                  <h3 class="reservation-confirmation__section-title">
                    👥 Party Details
                  </h3>
                  <div class="reservation-confirmation__detail">
                    {{ reservation.reservation.partySize }}
                    {{
                      reservation.reservation.partySize === 1
                        ? 'guest'
                        : 'guests'
                    }}
                  </div>
                  <div
                    class="reservation-confirmation__preferences"
                    *ngIf="
                      reservation.reservation.hasChildren ||
                      reservation.reservation.needsSmoking
                    "
                  >
                    <span
                      class="reservation-confirmation__preference-tag"
                      *ngIf="reservation.reservation.hasChildren"
                    >
                      👶 Children included
                    </span>
                    <span
                      class="reservation-confirmation__preference-tag"
                      *ngIf="reservation.reservation.needsSmoking"
                    >
                      🚬 Smoking section
                    </span>
                  </div>
                </div>

                <div class="reservation-confirmation__detail-section">
                  <h3 class="reservation-confirmation__section-title">
                    🏛️ Dining Area
                  </h3>
                  <div class="reservation-confirmation__detail">
                    <strong>{{
                      getRegionName(reservation.reservation.regionId)
                    }}</strong>
                  </div>
                </div>

                <div class="reservation-confirmation__detail-section">
                  <h3 class="reservation-confirmation__section-title">
                    📞 Contact
                  </h3>
                  <div class="reservation-confirmation__detail">
                    {{ reservation.reservation.customerInfo.name }}
                  </div>
                  <div class="reservation-confirmation__detail">
                    {{ reservation.reservation.customerInfo.email }}
                  </div>
                  <div class="reservation-confirmation__detail">
                    {{ reservation.reservation.customerInfo.phone }}
                  </div>
                </div>
              </div>
            </ng-container>
          </div>

          <div class="reservation-confirmation__important-info">
            <h3 class="reservation-confirmation__info-title">
              Important Information
            </h3>
            <ul class="reservation-confirmation__info-list">
              <li>Please arrive within 15 minutes of your reservation time</li>
              <li>Late arrivals may result in table reassignment</li>
              <li>
                For changes or cancellations, please call us at (555) 123-4567
              </li>
              <li>We look forward to serving you at Kafè!</li>
            </ul>
          </div>

          <div class="reservation-confirmation__actions">
            <button
              class="reservation-confirmation__btn reservation-confirmation__btn--secondary"
              (click)="makeNewReservation()"
            >
              Make Another Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
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

  ngOnInit(): void {
    // Observable is set up in constructor
  }

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
