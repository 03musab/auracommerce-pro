import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';
import { shakeAnimation } from '../../animations/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  animations: [shakeAnimation],
  template: `
    <div class="container py-5 d-flex align-items-center justify-content-center min-vh-75">
      <div class="col-md-6 col-lg-5 col-xl-4 w-100" style="max-width: 440px;" [@shake]="shakeState" (@shake.done)="resetShake()">
        <div class="glass-panel p-5">
          <!-- Form Header -->
          <div class="text-center mb-4">
            <h2 class="text-white">{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h2>
            <p class="text-secondary small">{{ isLoginMode ? 'Enter credentials to access AuraCommerce' : 'Join AuraCommerce and start exploring' }}</p>
          </div>

          <!-- Form Body -->
          <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
            <!-- Name Field (Register Mode Only) -->
            <div *ngIf="!isLoginMode" class="mb-3">
              <label class="form-label text-secondary small">Full Name</label>
              <div class="position-relative">
                <i class="bi bi-person position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                <input 
                  type="text" 
                  formControlName="name" 
                  class="form-control glass-input ps-5" 
                  placeholder="John Doe"
                  [ngClass]="{'is-invalid': submitted && f['name'].errors}"
                >
                <div *ngIf="submitted && f['name'].errors" class="invalid-feedback text-danger small mt-1">
                  Name is required.
                </div>
              </div>
            </div>

            <!-- Email Field -->
            <div class="mb-3">
              <label class="form-label text-secondary small">Email Address</label>
              <div class="position-relative">
                <i class="bi bi-envelope position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                <input 
                  type="email" 
                  formControlName="email" 
                  class="form-control glass-input ps-5" 
                  placeholder="name@example.com"
                  [ngClass]="{'is-invalid': submitted && f['email'].errors}"
                >
                <div *ngIf="submitted && f['email'].errors" class="invalid-feedback text-danger small mt-1">
                  <span *ngIf="f['email'].errors['required']">Email is required.</span>
                  <span *ngIf="f['email'].errors['email']">Please enter a valid email address.</span>
                </div>
              </div>
            </div>

            <!-- Password Field -->
            <div class="mb-3">
              <label class="form-label text-secondary small">Password</label>
              <div class="position-relative">
                <i class="bi bi-lock position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  formControlName="password" 
                  class="form-control glass-input px-5" 
                  placeholder="••••••••"
                  [ngClass]="{'is-invalid': submitted && f['password'].errors}"
                >
                <button 
                  type="button" 
                  (click)="togglePassword()" 
                  class="btn position-absolute top-50 end-0 translate-middle-y me-2 text-secondary p-1 border-0"
                >
                  <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                </button>
                <div *ngIf="submitted && f['password'].errors" class="invalid-feedback text-danger small mt-1">
                  <span *ngIf="f['password'].errors['required']">Password is required.</span>
                  <span *ngIf="f['password'].errors['minlength']">Password must be at least 6 characters.</span>
                </div>
              </div>
            </div>

            <!-- Remember Me / Toggles -->
            <div class="d-flex align-items-center justify-content-between mb-4">
              <div class="form-check">
                <input type="checkbox" class="form-check-input bg-transparent border-secondary border-opacity-20" id="rememberMe">
                <label class="form-check-label text-secondary small" for="rememberMe">Remember me</label>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="btn btn-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2"
              [disabled]="loading"
            >
              <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>{{ isLoginMode ? 'Login' : 'Create Account' }}</span>
            </button>
          </form>

          <!-- Toggle Mode -->
          <div class="text-center mt-4 pt-2">
            <span class="text-secondary small">{{ isLoginMode ? "Don't have an account? " : "Already have an account? " }}</span>
            <a 
              href="javascript:void(0)" 
              (click)="toggleMode()" 
              class="text-primary-glow font-weight-bold small text-decoration-none"
            >
              {{ isLoginMode ? 'Sign Up' : 'Sign In' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-75 {
      min-height: 75vh;
    }
    .text-primary-glow {
      color: #8b5cf6;
      transition: color 0.3s ease;
    }
    .text-primary-glow:hover {
      color: #db2777;
    }
    .form-check-input:checked {
      background-color: #8b5cf6;
      border-color: #8b5cf6;
    }
  `]
})
export class LoginComponent implements OnInit {
  authForm!: FormGroup;
  isLoginMode = true;
  submitted = false;
  loading = false;
  showPassword = false;
  shakeState = '';
  returnUrl = '/products';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Get return URL from route parameters or default to '/products'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';

    // If already logged in, redirect
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/products']);
    }
  }

  private initForm(): void {
    this.authForm = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.updateNameValidator();
  }

  get f() { return this.authForm.controls; }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.submitted = false;
    this.authForm.reset();
    this.updateNameValidator();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private updateNameValidator(): void {
    const nameControl = this.authForm.get('name');
    if (!this.isLoginMode) {
      nameControl?.setValidators([Validators.required]);
    } else {
      nameControl?.clearValidators();
    }
    nameControl?.updateValueAndValidity();
  }

  resetShake(): void {
    this.shakeState = '';
  }

  onSubmit(): void {
    this.submitted = true;

    // Trigger error shake on invalid form
    if (this.authForm.invalid) {
      this.shakeState = 'shake';
      this.toastService.show('Please fill out the form correctly.', 'danger');
      return;
    }

    this.loading = true;
    this.loaderService.show();
    const { name, email, password } = this.authForm.value;

    const authObservable = this.isLoginMode 
      ? this.authService.login(email, password)
      : this.authService.register(name, email, password);

    authObservable.subscribe({
      next: (response) => {
        this.loading = false;
        this.loaderService.hide();
        if (response.success) {
          this.toastService.show(
            this.isLoginMode ? 'Welcome back to AuraCommerce Pro!' : 'Account created successfully!', 
            'success'
          );
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.shakeState = 'shake';
          this.toastService.show(response.message || 'Authentication failed.', 'danger');
        }
      },
      error: (err) => {
        this.loading = false;
        this.loaderService.hide();
        this.shakeState = 'shake';
        const errorMsg = err.error?.message || 'Something went wrong. Please try again.';
        this.toastService.show(errorMsg, 'danger');
      }
    });
  }
}
