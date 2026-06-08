import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';
import { Product } from '../../models';
import { shakeAnimation, fadeAnimation } from '../../animations/animations';

@Component({
  selector: 'app-auth-portal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  animations: [shakeAnimation, fadeAnimation],
  template: `
    <div class="container-fluid min-vh-90 d-flex align-items-center justify-content-center py-5">
      <div class="container w-100">
        <div class="row g-5 align-items-stretch justify-content-center">
          
          <!-- Left Column: Premium Sliding Showcase -->
          <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-center position-relative overflow-hidden mb-5 mb-lg-0">
            <div class="glass-panel p-5 h-100 d-flex flex-column justify-content-between relative-glow border border-secondary border-opacity-10">
              
              <!-- Floating Brand badge -->
              <div class="d-flex align-items-center gap-2 mb-4">
                <span class="badge bg-purple-glow text-white px-3 py-2 rounded-pill font-weight-bold">
                  <i class="bi bi-star-fill me-1 text-warning"></i> AURA EXCLUSIVE CATALOG
                </span>
              </div>

              <!-- Sliding content with fade -->
              <div class="product-slider flex-grow-1 d-flex flex-column justify-content-center py-4" *ngIf="showcaseProducts.length > 0">
                <div class="slider-item" [@fadeAnimation] *ngIf="currentSlideIndex !== null">
                  <!-- Product Image Preview -->
                  <div class="slider-img-box rounded-4 overflow-hidden mb-4 border border-secondary border-opacity-10 p-3 bg-dark-card-inner">
                    <img 
                      [src]="showcaseProducts[currentSlideIndex].image" 
                      [alt]="showcaseProducts[currentSlideIndex].name" 
                      class="img-fluid slider-image"
                    >
                  </div>

                  <!-- Product Text Details -->
                  <h2 class="text-white display-6 mb-2">{{ showcaseProducts[currentSlideIndex].name }}</h2>
                  <p class="text-secondary mb-4 slider-desc">{{ showcaseProducts[currentSlideIndex].description }}</p>
                  
                  <div class="d-flex align-items-center gap-3">
                    <span class="text-secondary small text-uppercase">Exclusive Price</span>
                    <span class="text-white font-weight-bold fs-3">{{ showcaseProducts[currentSlideIndex].price | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
              </div>

              <!-- Slider Dots navigation -->
              <div class="d-flex gap-2 mt-4" *ngIf="showcaseProducts.length > 0">
                <span 
                  *ngFor="let prod of showcaseProducts; let i = index" 
                  class="dot-indicator" 
                  [class.active-dot]="i === currentSlideIndex"
                  (click)="setSlide(i)"
                ></span>
              </div>
            </div>
          </div>

          <!-- Right Column: Unified Login/Signup Portal -->
          <div class="col-lg-6 d-flex align-items-center justify-content-center">
            <div class="w-100" style="max-width: 460px;" [@shake]="shakeState" (@shake.done)="resetShake()">
              
              <!-- Already Logged In State -->
              <div class="glass-panel p-5 text-center" *ngIf="isLoggedIn" [@fadeAnimation]>
                <div class="glowing-avatar bg-gradient-premium rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                    <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                  </svg>
                </div>
                <h2 class="text-white mb-2">Authenticated</h2>
                <p class="text-secondary small mb-5">You are already logged in as <strong>{{ authService.currentUserValue?.name }}</strong>. Enjoy your premium shopping experience.</p>
                
                <div class="d-flex flex-column gap-3">
                  <a routerLink="/products" class="btn btn-premium py-3 text-decoration-none">
                    Enter Catalog Store <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                  <button (click)="onLogout()" class="btn btn-glass py-3">
                    Sign Out <i class="bi bi-box-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>

              <!-- Guest State: Tabs login and signup -->
              <div class="glass-panel p-4 p-md-5" *ngIf="!isLoggedIn">
                
                <!-- Tab headers -->
                <div class="d-flex border-bottom border-secondary border-opacity-10 mb-4 pb-1 justify-content-center gap-4">
                  <button 
                    (click)="setMode(true)" 
                    class="btn-tab text-uppercase font-weight-bold pb-2" 
                    [class.active-tab]="isLoginMode"
                  >
                    Login
                  </button>
                  <button 
                    (click)="setMode(false)" 
                    class="btn-tab text-uppercase font-weight-bold pb-2" 
                    [class.active-tab]="!isLoginMode"
                  >
                    Register
                  </button>
                </div>

                <h3 class="text-white mb-1 fs-4 text-center">{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h3>
                <p class="text-secondary small text-center mb-4">
                  {{ isLoginMode ? 'Access your private vault and check out premium items' : 'Register to earn rewards coins on every purchase' }}
                </p>

                <!-- Auth form -->
                <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
                  <!-- Name Control (Register Mode Only) -->
                  <div *ngIf="!isLoginMode" class="mb-3" [@fadeAnimation]>
                    <label class="form-label text-secondary small">Full Name</label>
                    <div class="position-relative">
                      <input 
                        type="text" 
                        formControlName="name" 
                        class="form-control glass-input ps-5" 
                        placeholder="Enter your full name"
                        [ngClass]="{'is-invalid': submitted && f['name'].errors}"
                      >
                      <svg class="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style="z-index: 5; pointer-events: none;" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664h10Z"/>
                      </svg>
                      <div *ngIf="submitted && f['name'].errors" class="invalid-feedback text-danger small mt-1">
                        Name is required.
                      </div>
                    </div>
                  </div>

                  <!-- Email Control -->
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Email Address</label>
                    <div class="position-relative">
                      <input 
                        type="email" 
                        formControlName="email" 
                        class="form-control glass-input ps-5" 
                        placeholder="Enter your email address"
                        [ngClass]="{'is-invalid': submitted && f['email'].errors}"
                      >
                      <svg class="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style="z-index: 5; pointer-events: none;" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                      </svg>
                      <div *ngIf="submitted && f['email'].errors" class="invalid-feedback text-danger small mt-1">
                        <span *ngIf="f['email'].errors?.['required']">Email is required.</span>
                        <span *ngIf="f['email'].errors?.['email']">Please enter a valid email address.</span>
                      </div>
                    </div>
                  </div>

                  <!-- Password Control -->
                  <div class="mb-4">
                    <label class="form-label text-secondary small">Password</label>
                    <div class="position-relative">
                      <input 
                        [type]="showPassword ? 'text' : 'password'" 
                        formControlName="password" 
                        class="form-control glass-input px-5" 
                        placeholder="Enter password (min. 6 characters)"
                        [ngClass]="{'is-invalid': submitted && f['password'].errors}"
                      >
                      <svg class="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style="z-index: 5; pointer-events: none;" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                      </svg>
                      <button 
                        type="button" 
                        (click)="togglePassword()" 
                        class="btn position-absolute top-50 end-0 translate-middle-y me-2 text-secondary p-1 border-0"
                        style="z-index: 5;"
                      >
                        <!-- Inline SVG Eye Toggle -->
                        <svg *ngIf="!showPassword" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                        <svg *ngIf="showPassword" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-4.12 2.851c-1.25-.156-2.19-.54-2.918-1.077C2.94 9.72 2 8 2 8s3-5.5 8-5.5c.997 0 1.905.216 2.72.58l-.882.882A5.986 5.986 0 0 1 10 3.5c-2.12 0-3.879 1.168-5.168 2.457A13.134 13.134 0 0 1 1.172 8c.058.087.122.183.195.288.335.48.83 1.12 1.465 1.755A11.813 11.813 0 0 0 5 11.238l.828-.828a2.555 2.555 0 0 1-.5-.5H5.023l-.823.823zm-1.89-1.89a2.5 2.5 0 0 1-2.83-2.829l.822.822z"/>
                        </svg>
                      </button>
                      <div *ngIf="submitted && f['password'].errors" class="invalid-feedback text-danger small mt-1">
                        <span *ngIf="f['password'].errors?.['required']">Password is required.</span>
                        <span *ngIf="f['password'].errors?.['minlength']">Password must be at least 6 characters.</span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Submit Button -->
                  <button 
                    type="submit" 
                    class="btn btn-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                    [disabled]="loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>{{ isLoginMode ? 'Login to Store' : 'Create Account' }}</span>
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-90 {
      min-height: 90vh;
    }
    .text-accent-color {
      color: #8b5cf6;
    }
    .relative-glow::before {
      content: '';
      position: absolute;
      width: 150px;
      height: 150px;
      background: radial-gradient(#8b5cf6, transparent 70%);
      top: -50px;
      left: -50px;
      opacity: 0.15;
      pointer-events: none;
    }
    .bg-dark-card-inner {
      background-color: rgba(15, 12, 27, 0.4);
    }
    .slider-img-box {
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .slider-image {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }
    .slider-desc {
      font-size: 0.95rem;
      line-height: 1.6;
    }
    .dot-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .active-dot {
      background: #8b5cf6;
      width: 24px;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
    }
    .glowing-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #8b5cf6 0%, #db2777 100%);
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
    }
    .btn-tab {
      background: none;
      border: none;
      color: #a0aec0;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      letter-spacing: 1px;
    }
    .active-tab {
      color: #fff;
      border-bottom: 2px solid #8b5cf6;
      text-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
    }
  `]
})
export class AuthPortalComponent implements OnInit, OnDestroy {
  authForm!: FormGroup;
  isLoginMode = true;
  submitted = false;
  loading = false;
  showPassword = false;
  shakeState = '';
  isLoggedIn = false;

  showcaseProducts: Product[] = [];
  currentSlideIndex: number | null = null;
  private slideInterval: any;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private productService: ProductService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.initForm();
    this.loadShowcase();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
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

  setMode(loginMode: boolean): void {
    this.isLoginMode = loginMode;
    this.submitted = false;
    this.authForm.reset();
    this.updateNameValidator();
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

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  resetShake(): void {
    this.shakeState = '';
  }

  loadShowcase(): void {
    this.productService.getProducts().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          // showcase top 4 items
          this.showcaseProducts = response.data.slice(0, 4);
          this.currentSlideIndex = 0;
          this.startSlideshow();
        }
      }
    });
  }

  startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 4500);
  }

  nextSlide(): void {
    if (this.showcaseProducts.length > 0 && this.currentSlideIndex !== null) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.showcaseProducts.length;
    }
  }

  setSlide(index: number): void {
    this.currentSlideIndex = index;
    // reset interval timer
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.startSlideshow();
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.toastService.show('Logged out successfully.', 'info');
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.authForm.invalid) {
      this.shakeState = 'shake';
      this.toastService.show('Please fill in valid credentials.', 'danger');
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
          this.isLoggedIn = true;
          this.toastService.show(
            this.isLoginMode ? 'Welcome to AuraCommerce Pro!' : 'Account registered successfully!', 
            'success'
          );
          this.router.navigate(['/products']);
        } else {
          this.shakeState = 'shake';
          this.toastService.show(response.message || 'Authentication failed.', 'danger');
        }
      },
      error: (err) => {
        this.loading = false;
        this.loaderService.hide();
        this.shakeState = 'shake';
        const errorMsg = err.error?.message || 'Authentication error. Please try again.';
        this.toastService.show(errorMsg, 'danger');
      }
    });
  }
}
