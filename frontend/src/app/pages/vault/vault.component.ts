import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../models';
import { fadeAnimation, bounceInAnimation } from '../../animations/animations';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    fadeAnimation, 
    bounceInAnimation,
    trigger('rewardState', [
      state('idle', style({ transform: 'rotate(0)' })),
      state('spinning', style({ transform: 'rotate(1440deg)' })),
      transition('idle => spinning', [
        animate('2000ms cubic-bezier(0.1, 0.8, 0.1, 1)')
      ])
    ])
  ],
  template: `
    <div class="container py-5" [@fadeAnimation]>
      <!-- Header banner -->
      <div class="glass-panel p-5 mb-5 relative-glow text-center text-md-start">
        <div class="row align-items-center">
          <div class="col-md-8">
            <span class="badge bg-purple-glow text-white px-3 py-2 rounded-pill mb-3">
              <i class="bi bi-shield-lock-fill me-1"></i> AURA PREMIUM VAULT
            </span>
            <h1 class="text-white display-5 mb-2">Welcome to your Vault, {{ userName }}</h1>
            <p class="text-secondary mb-0">Claim exclusive discounts, track your reward tier progress, and trace active orders here.</p>
          </div>
          <!-- Balance Widget -->
          <div class="col-md-4 mt-4 mt-md-0 text-center text-md-end">
            <div class="d-inline-block p-4 rounded-4 bg-dark-coin-card border border-secondary border-opacity-10 shadow-lg">
              <span class="text-secondary small d-block mb-1 text-uppercase font-weight-bold">Aura Coins Balance</span>
              <div class="d-flex align-items-center justify-content-center justify-content-md-end gap-2">
                <i class="bi bi-coin text-warning fs-1 coin-glow-icon"></i>
                <h2 class="text-white mb-0 display-6 font-weight-bold">{{ coinBalance }}</h2>
              </div>
              <small class="text-secondary mt-2 d-block">Earn 5% back on all purchases</small>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- VIP Tier Progress (Left Column) -->
        <div class="col-md-6 col-lg-4">
          <div class="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h4 class="text-white mb-3"><i class="bi bi-award-fill me-2 text-primary-glow-color"></i>VIP Tier Status</h4>
              <p class="text-secondary small">Your rewards multiply as you advance across the tiers.</p>
              
              <!-- Tier Badges status -->
              <div class="text-center my-4 py-3">
                <div class="tier-badge-glowing mx-auto mb-3" [ngClass]="vipTier.toLowerCase()">
                  <i class="bi" [ngClass]="getTierIcon()"></i>
                </div>
                <h4 class="text-white mb-1">{{ vipTier }} Member</h4>
                <span class="text-secondary small">{{ nextTierMsg }}</span>
              </div>
            </div>

            <!-- Progress line -->
            <div class="mt-auto">
              <div class="d-flex justify-content-between text-secondary small mb-2">
                <span>{{ currentTierLimit }} Coins</span>
                <span>{{ nextTierLimit }} Coins</span>
              </div>
              <div class="progress bg-dark" style="height: 10px; border-radius: 5px;">
                <div 
                  class="progress-bar progress-bar-striped progress-bar-animated bg-gradient-premium" 
                  role="progressbar" 
                  [style.width.%]="tierProgress" 
                  [attr.aria-valuenow]="tierProgress" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Spin for Discounts Mini-Game (Middle Column) -->
        <div class="col-md-6 col-lg-4">
          <div class="glass-panel p-4 h-100 text-center d-flex flex-column justify-content-between">
            <div>
              <h4 class="text-white text-start mb-3"><i class="bi bi-gift-fill me-2 text-accent-pink-color"></i>Aura Claim Box</h4>
              <p class="text-secondary text-start small">Spin the hyper-wheel to generate random discount codes you can use at checkout.</p>
            </div>

            <!-- Interactive Spinner representation -->
            <div class="my-4 d-flex justify-content-center align-items-center">
              <div 
                class="wheel-box" 
                [@rewardState]="wheelState"
                [class.spinning-now]="wheelState === 'spinning'"
              >
                <div class="wheel-pointer"></div>
                <i class="bi bi-compass text-white display-3 pointer-icon"></i>
              </div>
            </div>

            <div class="mt-auto">
              <!-- Success coupon alert -->
              <div *ngIf="claimedCoupon" class="coupon-success-alert mb-3 p-3 rounded-3" [@bounceIn]>
                <span class="text-secondary small d-block mb-1">Coupon Claimed! Click code to copy:</span>
                <span 
                  (click)="copyCoupon()" 
                  class="btn-copy-coupon border border-dashed border-success text-success bg-success bg-opacity-10 d-block py-2 rounded font-weight-bold fs-5"
                >
                  <i class="bi bi-clipboard2-check-fill me-1"></i> {{ claimedCoupon }}
                </span>
              </div>

              <button 
                (click)="triggerSpin()" 
                class="btn btn-premium w-100 py-3" 
                [disabled]="wheelState === 'spinning'"
              >
                {{ wheelState === 'spinning' ? 'Spinning...' : 'Claim Code' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Active Orders Tracker (Right Column) -->
        <div class="col-lg-4">
          <div class="glass-panel p-4 h-100">
            <h4 class="text-white mb-4"><i class="bi bi-box-seam-fill me-2 text-warning"></i>Order Timelines</h4>
            
            <div class="orders-timeline-container overflow-y-auto pr-2" style="max-height: 400px;" *ngIf="orders.length > 0; else noOrders">
              <div *ngFor="let order of orders; let last = last" class="timeline-order-item mb-4">
                
                <!-- Order basic header -->
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-white small font-weight-bold">Order ID: {{ order._id | slice:0:8 }}</span>
                  <span class="badge bg-secondary bg-opacity-20 text-secondary font-weight-bold" style="font-size: 0.75rem;">
                    {{ order.total | currency:'INR':'symbol':'1.0-0' }}
                  </span>
                </div>

                <!-- Horizontal status timeline tracker -->
                <div class="d-flex justify-content-between align-items-center text-center mt-3 position-relative py-2 px-1">
                  <!-- Connector line background -->
                  <div class="timeline-line"></div>
                  <!-- Active colored path -->
                  <div class="timeline-line-active" [style.width.%]="getOrderStatusWidth(order)"></div>

                  <!-- Status nodes -->
                  <div 
                    *ngFor="let step of ['Received', 'Processing', 'Dispatched', 'Delivered']; let idx = index"
                    class="timeline-node position-relative"
                    [class.active-node]="isNodeActive(order, idx)"
                    [title]="step"
                  >
                    <i class="bi timeline-node-icon" [ngClass]="getStepIcon(idx)"></i>
                    <span class="timeline-node-label text-secondary">{{ step }}</span>
                  </div>
                </div>

                <hr *ngIf="!last" class="bg-secondary opacity-10 mt-4">
              </div>
            </div>

            <!-- Fallback if no orders -->
            <ng-template #noOrders>
              <div class="text-center py-5">
                <i class="bi bi-journal-x text-secondary fs-1 mb-3"></i>
                <p class="text-secondary mb-0">No orders found. Once you place an order, it will appear on your tracking timeline!</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-primary-glow-color {
      color: #8b5cf6;
    }
    .text-accent-pink-color {
      color: #db2777;
    }
    .bg-purple-glow {
      background-color: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }
    .bg-dark-coin-card {
      background-color: rgba(15, 12, 27, 0.5);
    }
    .coin-glow-icon {
      color: #fbbf24 !important;
      text-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
    }
    
    /* VIP badge styling */
    .tier-badge-glowing {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      border: 3px solid transparent;
      transition: all 0.5s ease;
    }
    .tier-badge-glowing.silver {
      border-color: #9ca3af;
      color: #e5e7eb;
      background: rgba(156, 163, 175, 0.1);
      box-shadow: 0 0 20px rgba(156, 163, 175, 0.3);
    }
    .tier-badge-glowing.gold {
      border-color: #f59e0b;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.1);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
    }
    .tier-badge-glowing.platinum {
      border-color: #8b5cf6;
      color: #a78bfa;
      background: rgba(139, 92, 246, 0.15);
      box-shadow: 0 0 25px rgba(139, 92, 246, 0.5);
    }

    /* Wheel spinner mini-game styles */
    .wheel-box {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 4px solid rgba(255, 255, 255, 0.1);
      background: radial-gradient(circle, rgba(30,27,57,1) 0%, rgba(15,12,27,1) 100%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }
    .wheel-pointer {
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 15px solid #db2777;
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }
    .pointer-icon {
      color: #8b5cf6 !important;
      text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
    }
    .spinning-now {
      animation: spin-visual-keyframes 2s cubic-bezier(0.1, 0.8, 0.1, 1) infinite;
    }
    @keyframes spin-visual-keyframes {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(1440deg); }
    }
    
    .coupon-success-alert {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.15);
    }
    .btn-copy-coupon {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-copy-coupon:hover {
      background: rgba(16, 185, 129, 0.2) !important;
      transform: scale(1.02);
    }

    /* Vertical and Horizontal tracking timelines */
    .timeline-line {
      position: absolute;
      left: 10px;
      right: 10px;
      height: 3px;
      background: rgba(255, 255, 255, 0.08);
      top: 22px;
      z-index: 1;
    }
    .timeline-line-active {
      position: absolute;
      left: 10px;
      height: 3px;
      background: linear-gradient(to right, #8b5cf6, #db2777);
      top: 22px;
      z-index: 2;
      transition: width 1s ease;
    }
    .timeline-node {
      z-index: 5;
    }
    .timeline-node-icon {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #0f0c1b;
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      margin: 0 auto 6px;
      transition: all 0.3s ease;
    }
    .timeline-node-label {
      font-size: 0.65rem;
      font-weight: 500;
      display: block;
    }
    .active-node .timeline-node-icon {
      background: linear-gradient(135deg, #8b5cf6 0%, #db2777 100%);
      border-color: transparent;
      color: white;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
    }
    .active-node .timeline-node-label {
      color: white !important;
      font-weight: 600;
    }
  `]
})
export class VaultComponent implements OnInit {
  userName = '';
  coinBalance = 500; // Starting sign-up base points
  vipTier = 'Silver';
  tierProgress = 0;
  currentTierLimit = 0;
  nextTierLimit = 1000;
  nextTierMsg = '';

  wheelState = 'idle';
  claimedCoupon = '';
  
  orders: Order[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = user.name;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data;
          this.calculateRewards(response.data);
        }
      }
    });
  }

  calculateRewards(orders: Order[]): void {
    // 500 base registration + 5% cashback on totals
    let spent = orders.reduce((acc, order) => acc + order.total, 0);
    this.coinBalance = 500 + Math.round(spent * 5); // 5 points per dollar

    // Define tiers
    if (this.coinBalance < 1000) {
      this.vipTier = 'Silver';
      this.currentTierLimit = 0;
      this.nextTierLimit = 1000;
      this.tierProgress = (this.coinBalance / 1000) * 100;
      this.nextTierMsg = `${1000 - this.coinBalance} more coins to Gold Tier`;
    } else if (this.coinBalance >= 1000 && this.coinBalance < 3000) {
      this.vipTier = 'Gold';
      this.currentTierLimit = 1000;
      this.nextTierLimit = 3000;
      this.tierProgress = ((this.coinBalance - 1000) / 2000) * 100;
      this.nextTierMsg = `${3000 - this.coinBalance} more coins to Platinum Tier`;
    } else {
      this.vipTier = 'Platinum';
      this.currentTierLimit = 3000;
      this.nextTierLimit = 5000;
      this.tierProgress = Math.min(((this.coinBalance - 3000) / 2000) * 100, 100);
      this.nextTierMsg = 'Maximum tier achieved. Platinum benefits unlocked!';
    }
  }

  getTierIcon(): string {
    switch (this.vipTier) {
      case 'Gold': return 'bi-award-fill';
      case 'Platinum': return 'bi-gem';
      default: return 'bi-award';
    }
  }

  triggerSpin(): void {
    if (this.wheelState === 'spinning') return;

    this.wheelState = 'spinning';
    this.claimedCoupon = '';

    setTimeout(() => {
      this.wheelState = 'idle';
      
      // Select random discounts
      const codes = ['AURAVIP10', 'PULSE15', 'NEON20', 'COINS50'];
      const randomIndex = Math.floor(Math.random() * codes.length);
      this.claimedCoupon = codes[randomIndex];
      
      this.toastService.show(`Coupon Claimed: ${this.claimedCoupon}`, 'success');
    }, 2000);
  }

  copyCoupon(): void {
    if (this.claimedCoupon) {
      navigator.clipboard.writeText(this.claimedCoupon).then(() => {
        this.toastService.show('Coupon code copied to clipboard!', 'info');
      });
    }
  }

  // Tracking details
  getOrderStatusWidth(order: Order): number {
    const step = this.getOrderStepIndex(order);
    return (step / 3) * 100;
  }

  private getOrderStepIndex(order: Order): number {
    if (!order.createdAt) return 0;
    
    // Simulate progression based on timestamp age
    const hours = (new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    
    if (hours < 1) return 0; // Received
    if (hours < 24) return 1; // Processing
    if (hours < 48) return 2; // Dispatched
    return 3; // Delivered
  }

  isNodeActive(order: Order, idx: number): boolean {
    const activeStep = this.getOrderStepIndex(order);
    return idx <= activeStep;
  }

  getStepIcon(idx: number): string {
    switch (idx) {
      case 0: return 'bi-receipt';
      case 1: return 'bi-gear';
      case 2: return 'bi-truck';
      default: return 'bi-house-check';
    }
  }
}
