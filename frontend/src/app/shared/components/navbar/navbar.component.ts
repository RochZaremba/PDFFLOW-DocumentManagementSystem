import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;
  isAuthenticated = false;
  isAdmin = false;

  ngOnInit() {
    // Subskrybuj zmiany użytkownika
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      this.isAdmin = user?.role === 'admin';
    });
  }

  /**
   * Wyloguj użytkownika
   */
  logout() {
    this.authService.logout();
  }

  /**
   * Nawigacja
   */
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
