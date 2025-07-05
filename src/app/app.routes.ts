import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/reservation',
    pathMatch: 'full',
  },
  {
    path: 'reservation',
    loadComponent: () =>
      import(
        './features/reservation/pages/reservation-page/reservation-page'
      ).then((m) => m.ReservationPage),
  },
  {
    path: 'reservation/confirmation/:confirmationNumber',
    loadComponent: () =>
      import(
        './features/reservation/components/reservation-confirmation/reservation-confirmation'
      ).then((m) => m.ReservationConfirmation),
  },
  {
    path: '**',
    redirectTo: '/reservation',
  },
];
