import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReservationResponse } from '../../../../core';
import { ReservationForm } from '../../components/reservation-form/reservation-form';

@Component({
  selector: 'app-reservation-page',
  imports: [ReservationForm],
  standalone: true,
  templateUrl: './reservation-page.html',
  styleUrls: ['./reservation-page.scss'],
})
export class ReservationPage {
  currentStep = 1;

  constructor(private router: Router) {}

  onReservationCreated(reservation: ReservationResponse): void {
    this.router.navigate([
      '/reservation/confirmation',
      reservation.confirmationNumber,
    ]);
  }

  onFormStepChanged(step: number): void {
    this.currentStep = step;
  }
}
