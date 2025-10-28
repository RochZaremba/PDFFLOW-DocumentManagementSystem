import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { PdfListComponent } from './features/browse/pdf-list/pdf-list.component';
import { PdfUploadComponent } from './features/upload/pdf-upload/pdf-upload.component';
import { PendingPdfsComponent } from './features/admin/pending-pdfs/pending-pdfs.component';
import { ManageTagsComponent } from './features/admin/manage-tags/manage-tags.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

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
    canActivate: [authGuard],
  },
    {
    path: 'upload',
    component: PdfUploadComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/pending',
    component: PendingPdfsComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/tags',
    component: ManageTagsComponent,
    canActivate: [adminGuard],
  },
  {
    path: '**',
    redirectTo: '/browse',
  },
];
