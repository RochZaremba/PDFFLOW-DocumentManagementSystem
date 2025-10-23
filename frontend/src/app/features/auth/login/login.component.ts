import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  returnUrl: string = '/browse';

  ngOnInit() {
    // Sprawdź, czy użytkownik jest już zalogowany
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/browse']);
      return;
    }

    // Pobierz returnUrl z query params (jeśli user próbował wejść na chronioną stronę)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/browse';

    // Inicjalizuj formularz
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.toastr.success(`Witaj, ${response.user.email}!`, 'Zalogowano pomyślnie');

        // Przekieruj do odpowiedniej strony
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/pending']);
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        // Błąd jest już obsłużony przez errorInterceptor (toastr)
        console.error('Login error:', error);
      },
    });
  }

  // Helper do oznaczania wszystkich pól jako "touched" (pokaż błędy walidacji)
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Gettery dla łatwego dostępu do pól w template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
