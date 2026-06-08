import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';
import { slideInOut, fadeAnimation } from '../../animations/animations';
import { CartItem } from '../../models';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    slideInOut, 
    fadeAnimation,
    trigger('priceUpdate', [
      transition('* => *', [
        animate('200ms ease-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.08)', color: '#8b5cf6', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ])
  ],
  template: `
    <div class="container py-5" [@fadeAnimation]>
      <!-- Header Area -->
      <h1 class="text-white mb-5">Your Shopping Cart</h1>

      <div *ngIf="(cartItems$ | async) as items" class="row g-4">
        <!-- Cart Items List (Left Column) -->
        <div class="col-lg-8" *ngIf="items.length > 0; else emptyCart">
          <div class="d-flex flex-column gap-3">
            <div 
              *ngFor="let item of items; trackBy: trackByCartId" 
              [@slideInOut]
              class="glass-panel p-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4"
            >
              <!-- Image & Basic Title -->
              <div class="d-flex align-items-center gap-3 w-100 w-md-auto">
                <img 
                  [src]="item.image" 
                  [alt]="item.name" 
                  class="rounded-3 object-fit-cover bg-dark"
                  style="width: 80px; height: 80px; border: 1px solid rgba(255,255,255,0.05);"
                >
                <div>
                  <h5 class="text-white mb-1 fs-6 text-wrap-limit">{{ item.name }}</h5>
                  <span class="text-secondary small">{{ item.category }}</span>
                  <span class="text-secondary small d-block d-md-none mt-1">{{ item.price | currency:'INR':'symbol':'1.0-0' }} each</span>
                </div>
              </div>

              <!-- Quantity selector and Price -->
              <div class="d-flex align-items-center justify-content-between w-100 w-md-auto gap-md-5">
                <!-- Unit Price (Desktop only) -->
                <div class="d-none d-md-block text-end">
                  <span class="text-secondary small d-block">Unit Price</span>
                  <span class="text-white">{{ item.price | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>

                <!-- Quantity controls -->
                <div class="d-flex align-items-center rounded-3 bg-dark border border-secondary border-opacity-20 px-1" style="height: 40px;">
                  <button 
                    (click)="decreaseQty(item)" 
                    class="btn btn-sm btn-dark border-0 px-2 py-0 text-secondary"
                    [disabled]="item.quantity <= 1"
                  >
                    <i class="bi bi-dash fs-5"></i>
                  </button>
                  <span class="px-2 text-white font-weight-bold small">{{ item.quantity }}</span>
                  <button 
                    (click)="increaseQty(item)" 
                    class="btn btn-sm btn-dark border-0 px-2 py-0 text-secondary"
                    [disabled]="item.quantity >= item.stock"
                  >
                    <i class="bi bi-plus fs-5"></i>
                  </button>
                </div>

                <!-- Item Total -->
                <div class="text-end">
                  <span class="text-secondary small d-block">Subtotal</span>
                  <span class="text-white font-weight-bold" [@priceUpdate]="item.quantity * item.price">
                    {{ (item.price * item.quantity) | currency:'INR':'symbol':'1.0-0' }}
                  </span>
                </div>

                <!-- Remove Button -->
                <button 
                  (click)="removeItem(item._id)" 
                  class="btn btn-outline-danger btn-sm border-0 rounded-circle d-flex align-items-center justify-content-center"
                  style="width: 38px; height: 38px;"
                  title="Remove item"
                >
                  <i class="bi bi-trash-fill fs-5"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Side Card (Right Column) -->
        <div class="col-lg-4" *ngIf="items.length > 0">
          <div class="glass-panel p-4 position-sticky" style="top: 100px;">
            <h4 class="text-white mb-4">Summary</h4>
            
            <div class="d-flex justify-content-between mb-3 text-secondary">
              <span>Items Total</span>
              <span>{{ cartCount$ | async }} items</span>
            </div>
            
            <div class="d-flex justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-10">
              <span class="text-secondary">Shipping</span>
              <span class="text-success font-weight-bold">FREE</span>
            </div>

            <div class="d-flex justify-content-between align-items-end mb-4">
              <span class="text-white">Est. Total</span>
              <h3 
                class="text-white font-weight-bold mb-0" 
                [@priceUpdate]="total$ | async"
              >
                {{ total$ | async | currency:'INR':'symbol':'1.0-0' }}
              </h3>
            </div>

            <a routerLink="/checkout" class="btn btn-premium w-100 py-3 text-center d-block text-decoration-none">
              Proceed to Checkout
            </a>
            
            <a routerLink="/products" class="btn-continue-shopping w-100 text-center d-block text-secondary small mt-3 text-decoration-none">
              <i class="bi bi-arrow-left"></i> Continue Shopping
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #emptyCart>
        <div class="text-center py-5 my-5 glass-panel col-md-8 mx-auto">
          <i class="bi bi-cart-x text-secondary display-1 mb-4"></i>
          <h3 class="text-white">Your cart is empty</h3>
          <p class="text-secondary col-md-8 mx-auto mb-4">Explore our premier collections to find tech gear, apparel, or desktop accessories and add them to your cart.</p>
          <a routerLink="/products" class="btn btn-premium px-5 py-3 text-decoration-none">Start Shopping</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .text-wrap-limit {
      max-width: 200px;
      white-space: normal;
    }
    .btn-continue-shopping {
      transition: color 0.3s ease;
    }
    .btn-continue-shopping:hover {
      color: #fff !important;
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems$ = this.cartService.cartItems$;
  cartCount$ = this.cartService.cartCount$;
  total$ = this.cartService.cartTotal$;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  trackByCartId(index: number, item: CartItem): string {
    return item._id;
  }

  increaseQty(item: CartItem): void {
    if (item.quantity < item.stock) {
      this.cartService.updateQuantity(item._id, item.quantity + 1).subscribe({
        error: (err) => {
          this.toastService.show(err.error?.message || 'Failed to update quantity.', 'danger');
        }
      });
    } else {
      this.toastService.show(`Cannot exceed available stock (${item.stock} units available)`, 'warning');
    }
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item._id, item.quantity - 1).subscribe({
        error: (err) => {
          this.toastService.show(err.error?.message || 'Failed to update quantity.', 'danger');
        }
      });
    }
  }

  removeItem(cartItemId: string): void {
    this.loaderService.show();
    this.cartService.removeFromCart(cartItemId).subscribe({
      next: (response) => {
        this.loaderService.hide();
        this.toastService.show('Item removed from cart', 'success');
      },
      error: (err) => {
        this.loaderService.hide();
        this.toastService.show('Failed to remove item.', 'danger');
      }
    });
  }
}
