import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('badgeBounce', [
      transition('* => *', [
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.4)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ])
  ],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark-navbar border-bottom border-secondary border-opacity-10 py-3 sticky-top">
      <div class="container">
        <!-- Logo -->
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <div class="logo-icon bg-gradient-premium rounded-3 d-flex align-items-center justify-content-center">
            <i class="bi bi-lightning-charge-fill text-white fs-5"></i>
          </div>
          <span class="logo-text">AURA<span class="text-primary-glow-font font-weight-bold">COMMERCE</span></span>
        </a>

        <!-- Mobile Toggler -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar Links -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li class="nav-item" *ngIf="currentUser$ | async">
              <a class="nav-link px-3" routerLink="/products" routerLinkActive="active">Catalog</a>
            </li>
            <li class="nav-item" *ngIf="currentUser$ | async">
              <a class="nav-link px-3" routerLink="/vault" routerLinkActive="active">My Vault</a>
            </li>
          </ul>

          <!-- Right Side Controls -->
          <div class="d-flex align-items-center gap-3">
            <!-- Cart Icon -->
            <a routerLink="/cart" class="btn-cart position-relative d-flex align-items-center justify-content-center p-2 rounded-circle">
              <i class="bi bi-bag-fill text-white fs-5"></i>
              <span 
                *ngIf="(cartCount$ | async) as count" 
                [@badgeBounce]="count"
                class="position-absolute top-0 start-100 translate-middle badge rounded-circle badge-glow"
              >
                {{ count }}
              </span>
            </a>

            <!-- Authentication Dropdown or Buttons -->
            <ng-container *ngIf="currentUser$ | async as user; else guestUser">
              <div class="dropdown">
                <button 
                  class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 rounded-pill border-opacity-10" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i class="bi bi-person-circle fs-5"></i>
                  <span>{{ user.name }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end glass-dropdown mt-2 border-secondary border-opacity-10" aria-labelledby="userDropdown">
                  <li><a class="dropdown-item py-2" routerLink="/vault"><i class="bi bi-shield-lock-fill me-2 text-primary"></i>My Vault</a></li>
                  <li><a class="dropdown-item py-2" routerLink="/checkout"><i class="bi bi-credit-card-2-front-fill me-2 text-success"></i>Checkout</a></li>
                  <li><hr class="dropdown-divider bg-secondary opacity-10"></li>
                  <li><a class="dropdown-item py-2 text-danger" (click)="onLogout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </div>
            </ng-container>

            <ng-template #guestUser>
              <a routerLink="/login" class="btn btn-premium btn-sm rounded-pill font-weight-bold px-4 py-2">
                Login
              </a>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .bg-dark-navbar {
      background-color: rgba(15, 12, 27, 0.8) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .logo-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #8b5cf6 0%, #db2777 100%);
    }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      letter-spacing: 1.5px;
      font-size: 1.25rem;
    }
    .text-primary-glow-font {
      color: #8b5cf6;
      background: linear-gradient(to right, #8b5cf6, #db2777);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .btn-cart {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      width: 44px;
      height: 44px;
      transition: all 0.3s ease;
    }
    .btn-cart:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(139, 92, 246, 0.3);
    }
    .nav-link {
      font-weight: 500;
      color: #a0aec0 !important;
      transition: color 0.3s ease;
    }
    .nav-link.active, .nav-link:hover {
      color: #fff !important;
    }
    .glass-dropdown {
      background: rgba(30, 27, 57, 0.95) !important;
      backdrop-filter: blur(16px);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    .dropdown-item {
      color: #a0aec0;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .dropdown-item:hover {
      background: rgba(139, 92, 246, 0.15);
      color: #fff;
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.35em 0.55em;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  cartCount$ = this.cartService.cartCount$;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
