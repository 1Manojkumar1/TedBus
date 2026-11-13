import { Routes } from '@angular/router';
import { LandingPage } from './Component/landing-page/landing-page';
import { SelectbusPage } from './Component/selectbus-page/selectbus-page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'selectbus', component: SelectbusPage },
  {
    path: 'payment',
    loadComponent: () =>
      import('./Component/payment-page/payment-page').then((m) => m.PaymentPage),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./Component/profile-page/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./Component/info-page/info-page').then((m) => m.InfoPageComponent),
    data: { topic: 'help' },
  },
  {
    path: 'cancellation',
    loadComponent: () =>
      import('./Component/info-page/info-page').then((m) => m.InfoPageComponent),
    data: { topic: 'cancellation' },
  },
  { path: '**', redirectTo: '' },
];
