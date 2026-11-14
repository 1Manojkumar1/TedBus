import { Routes } from '@angular/router';
import { LandingPage } from './Component/landing-page/landing-page';
import { SelectbusPage } from './Component/selectbus-page/selectbus-page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'selectbus', component: SelectbusPage },
  {
    path: 'community',
    loadComponent: () =>
      import('./Component/community/community.component').then((m) => m.CommunityComponent),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./Component/notification-center/notification-center.component').then(
        (m) => m.NotificationCenterComponent
      ),
  },
  {
    path: 'route-planner',
    loadComponent: () =>
      import('./Component/route-planner/route-planner.component').then(
        (m) => m.RoutePlannerComponent
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./Component/admin/admin.component').then((m) => m.AdminComponent),
  },
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
