import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card glass-card h-100 position-relative">
      <!-- Category Badge -->
      <span class="badge position-absolute top-0 start-0 m-3 px-3 py-2 bg-dark-badge border border-secondary border-opacity-10 text-white rounded-pill">
        {{ product.category }}
      </span>

      <!-- Image Area -->
      <div class="product-img-wrapper overflow-hidden" [routerLink]="['/product', product._id]">
        <img 
          [src]="product.image" 
          [alt]="product.name" 
          class="card-img-top product-img"
          loading="lazy"
        >
      </div>

      <!-- Content Area -->
      <div class="card-body d-flex flex-column p-4">
        <h5 class="card-title text-white mb-2 text-truncate" [routerLink]="['/product', product._id]">{{ product.name }}</h5>
        <p class="card-text text-muted small mb-4 flex-grow-1 card-description-height">
          {{ product.description | slice:0:85 }}...
        </p>
        
        <div class="d-flex align-items-center justify-content-between mt-auto pt-2">
          <div class="d-flex flex-column">
            <span class="text-secondary small text-uppercase font-weight-bold">Price</span>
            <span class="price-text font-weight-bold text-white fs-4">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
          </div>

          <!-- Add To Cart Button -->
          <button 
            (click)="onAddToCart($event)" 
            class="btn btn-premium-circle"
            [disabled]="product.stock === 0"
            [title]="product.stock === 0 ? 'Out of Stock' : 'Add to Cart'"
          >
            <i class="bi" [ngClass]="product.stock === 0 ? 'bi-x-circle' : 'bi-cart-plus-fill'"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-dark-badge {
      background-color: rgba(15, 12, 27, 0.8) !important;
      backdrop-filter: blur(8px);
    }
    .product-img-wrapper {
      height: 220px;
      cursor: pointer;
      background-color: rgba(15, 12, 27, 0.4);
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .glass-card:hover .product-img {
      transform: scale(1.1);
    }
    .card-title {
      cursor: pointer;
      font-size: 1.15rem;
      transition: color 0.3s ease;
    }
    .card-title:hover {
      color: #8b5cf6 !important;
    }
    .card-description-height {
      line-height: 1.5;
    }
    .price-text {
      font-family: 'Outfit', sans-serif;
    }
    .btn-premium-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6 0%, #db2777 100%);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-premium-circle:hover {
      transform: scale(1.15) rotate(10deg);
      box-shadow: 0 6px 16px rgba(139, 92, 246, 0.5);
    }
    .btn-premium-circle:active {
      transform: scale(0.95);
    }
    .btn-premium-circle:disabled {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #a0aec0;
      box-shadow: none;
      transform: none;
      cursor: not-allowed;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();

  onAddToCart(event: Event): void {
    event.stopPropagation(); // Avoid triggering route navigation
    this.add.emit(this.product);
  }
}
