import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared-module';
import { ReservationConfirmation } from './components/reservation-confirmation/reservation-confirmation';
import { ReservationForm } from './components/reservation-form/reservation-form';
import { ReservationSummary } from './components/reservation-summary/reservation-summary';
import { ReservationPage } from './pages/reservation-page/reservation-page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ReservationForm,
    ReservationSummary,
    ReservationConfirmation,
    ReservationPage,
  ],
})
export class ReservationModule {}
