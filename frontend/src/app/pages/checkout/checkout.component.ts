import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';
import { fadeAnimation, bounceInAnimation } from '../../animations/animations';
import { CartItem, Order } from '../../models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  animations: [fadeAnimation, bounceInAnimation],
  template: `
    <div class="container py-5" [@fadeAnimation]>
      <!-- Progress Bar Tracker -->
      <div class="d-flex justify-content-center align-items-center mb-5 gap-3">
        <div class="d-flex align-items-center gap-2">
          <span 
            class="step-badge rounded-circle d-flex align-items-center justify-content-center"
            [ngClass]="step === 1 ? 'step-active' : 'step-completed'"
          >
            <i *ngIf="step > 1" class="bi bi-check-lg"></i>
            <span *ngIf="step === 1">1</span>
          </span>
          <span class="small font-weight-bold" [ngClass]="step === 1 ? 'text-white' : 'text-secondary'">Shipping Info</span>
        </div>
        <div class="step-connector bg-secondary opacity-20" style="width: 60px; height: 2px;"></div>
        <div class="d-flex align-items-center gap-2">
          <span 
            class="step-badge rounded-circle d-flex align-items-center justify-content-center"
            [ngClass]="step === 2 ? 'step-active' : 'step-idle'"
          >
            2
          </span>
          <span class="small font-weight-bold" [ngClass]="step === 2 ? 'text-white' : 'text-secondary'">Confirmation</span>
        </div>
      </div>

      <!-- Step 1: Shipping and Review Form -->
      <div *ngIf="step === 1" class="row g-5">
        <!-- Billing Details Form (Left) -->
        <div class="col-lg-7">
          <div class="glass-panel p-4 p-md-5">
            <h3 class="text-white mb-4">Shipping Details</h3>
            
            <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
              <!-- Customer Name -->
              <div class="mb-3">
                <label class="form-label text-secondary small">Full Name</label>
                <div class="position-relative">
                  <i class="bi bi-person position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input 
                    type="text" 
                    formControlName="customerName" 
                    class="form-control glass-input ps-5" 
                    placeholder="John Doe"
                    [ngClass]="{'is-invalid': submitted && f['customerName'].errors}"
                  >
                  <div *ngIf="submitted && f['customerName'].errors" class="invalid-feedback text-danger small mt-1">
                    Customer name is required.
                  </div>
                </div>
              </div>

              <!-- Shipping Address -->
              <div class="mb-3">
                <label class="form-label text-secondary small">Delivery Address</label>
                <div class="position-relative">
                  <i class="bi bi-geo-alt position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input 
                    type="text" 
                    formControlName="address" 
                    class="form-control glass-input ps-5" 
                    placeholder="123 Aura Ave, San Francisco, CA"
                    [ngClass]="{'is-invalid': submitted && f['address'].errors}"
                  >
                  <div *ngIf="submitted && f['address'].errors" class="invalid-feedback text-danger small mt-1">
                    Delivery address is required.
                  </div>
                </div>
              </div>

              <!-- Mobile Number -->
              <div class="mb-4">
                <label class="form-label text-secondary small">Mobile Number</label>
                <div class="position-relative">
                  <i class="bi bi-telephone position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input 
                    type="text" 
                    formControlName="mobile" 
                    class="form-control glass-input ps-5" 
                    placeholder="+1 (555) 000-0000"
                    [ngClass]="{'is-invalid': submitted && f['mobile'].errors}"
                  >
                  <div *ngIf="submitted && f['mobile'].errors" class="invalid-feedback text-danger small mt-1">
                    <span *ngIf="f['mobile'].errors['required']">Mobile number is required.</span>
                    <span *ngIf="f['mobile'].errors['pattern']">Please enter a valid mobile number (e.g. 10+ digits).</span>
                  </div>
                </div>
              </div>

              <!-- Submit Payment Info -->
              <button 
                type="submit" 
                class="btn btn-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                [disabled]="(cartItems$ | async)?.length === 0"
              >
                <i class="bi bi-credit-card-2-front-fill"></i>
                <span>Place Order (Pay on Delivery)</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Order Summary Detail (Right) -->
        <div class="col-lg-5">
          <div class="glass-panel p-4 position-sticky" style="top: 100px;">
            <h4 class="text-white mb-4">Order Summary</h4>

            <!-- Item Mini cards -->
            <div class="summary-items-list mb-4 overflow-y-auto" style="max-height: 280px;">
              <div 
                *ngFor="let item of cartItems$ | async" 
                class="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-10 pb-2"
              >
                <div class="d-flex align-items-center gap-2">
                  <img 
                    [src]="item.image" 
                    [alt]="item.name" 
                    class="rounded bg-dark"
                    style="width: 50px; height: 50px; object-fit: cover;"
                  >
                  <div>
                    <h6 class="text-white mb-0 small text-wrap-limit">{{ item.name }}</h6>
                    <span class="text-secondary small">{{ item.quantity }} x {{ item.price | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
                <span class="text-white font-weight-bold small">{{ (item.price * item.quantity) | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <!-- Pricing -->
            <div class="d-flex justify-content-between mb-2 text-secondary small">
              <span>Subtotal</span>
              <span>{{ total$ | async | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 text-secondary small">
              <span>Shipping</span>
              <span class="text-success">FREE</span>
            </div>
            <hr class="bg-secondary opacity-10">
            <div class="d-flex justify-content-between align-items-end">
              <span class="text-white">Total Cost</span>
              <h4 class="text-white font-weight-bold mb-0">{{ total$ | async | currency:'INR':'symbol':'1.0-0' }}</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Success Checkmark Screen -->
      <div *ngIf="step === 2" class="text-center py-5">
        <div class="d-flex justify-content-center mb-4">
          <div class="checkmark-circle" [@bounceIn]>
            <i class="bi bi-check2 text-success" style="font-size: 4.5rem; line-height: 100px;"></i>
          </div>
        </div>

        <h1 class="text-white display-5 mb-3">Order Placed Successfully!</h1>
        <p class="text-secondary col-md-6 mx-auto mb-4">Thank you for your order, <strong class="text-white">{{ confirmedOrder?.customerName }}</strong>. Your purchase has been logged, and we have sent confirmation details. Your delivery is being scheduled.</p>

        <!-- Order details panel -->
        <div class="col-md-6 mx-auto glass-panel p-4 text-start mb-5" [@bounceIn]>
          <h5 class="text-white border-bottom border-secondary border-opacity-10 pb-2 mb-3">Order Details</h5>
          
          <div class="row g-2 small">
            <div class="col-sm-4 text-secondary">Order Reference:</div>
            <div class="col-sm-8 text-white font-weight-bold">{{ confirmedOrder?._id }}</div>

            <div class="col-sm-4 text-secondary">Deliver To:</div>
            <div class="col-sm-8 text-white">{{ confirmedOrder?.address }}</div>

            <div class="col-sm-4 text-secondary">Contact:</div>
            <div class="col-sm-8 text-white">{{ confirmedOrder?.mobile }}</div>

            <div class="col-sm-4 text-secondary">Amount Paid:</div>
            <div class="col-sm-8 text-success font-weight-bold">{{ confirmedOrder?.total | currency:'INR':'symbol':'1.0-0' }}</div>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/products" class="btn btn-premium px-4 py-2">Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-badge {
      width: 34px;
      height: 34px;
      border: 2px solid transparent;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .step-active {
      background-color: #8b5cf6;
      border-color: #8b5cf6;
      color: white;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
    }
    .step-completed {
      background-color: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #10b981;
    }
    .step-idle {
      background-color: transparent;
      border-color: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.4);
    }
    .text-wrap-limit {
      max-width: 180px;
      white-space: normal;
    }
    
    /* Success checkmark layout */
    .checkmark-circle {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      border: 4px solid #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(16, 185, 129, 0.1);
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.3);
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  submitted = false;
  step = 1;
  confirmedOrder: Order | null = null;

  cartItems$ = this.cartService.cartItems$;
  total$ = this.cartService.cartTotal$;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If cart is empty, redirect back to catalog
    this.cartService.cartCount$.subscribe(count => {
      if (this.step === 1 && count === 0) {
        this.toastService.show('Your cart is empty. Please add items before checking out.', 'warning');
        this.router.navigate(['/products']);
      }
    });

    this.initForm();
  }

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      customerName: ['', Validators.required],
      address: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{10,15}$/)]]
    });
  }

  get f() { return this.checkoutForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.checkoutForm.invalid) {
      this.toastService.show('Please fill in your shipping details correctly.', 'danger');
      return;
    }

    this.loaderService.show();
    const { customerName, address, mobile } = this.checkoutForm.value;

    this.orderService.placeOrder(customerName, address, mobile).subscribe({
      next: (response) => {
        this.loaderService.hide();
        if (response.success && response.data) {
          this.confirmedOrder = response.data;
          this.step = 2; // Jump to Confirmation slide
          this.toastService.show('Order completed successfully!', 'success');
        } else {
          this.toastService.show(response.message || 'Error processing order.', 'danger');
        }
      },
      error: (err) => {
        this.loaderService.hide();
        const errorMsg = err.error?.message || 'Failed to place order. Check stock availability.';
        this.toastService.show(errorMsg, 'danger');
      }
    });
  }
}
