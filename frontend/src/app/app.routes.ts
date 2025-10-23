import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { PdfListComponent } from './features/browse/pdf-list/pdf-list.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/browse',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'browse',
    component: PdfListComponent,
    // Możesz dodać authGuard jeśli chcesz chronić tę stronę
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/browse',
  },
];
