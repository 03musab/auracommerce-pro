import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { fadeAnimation, bounceInAnimation } from '../../animations/animations';
import { Product } from '../../models';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  animations: [fadeAnimation, bounceInAnimation],
  template: `
    <div class="container py-5" [@fadeAnimation] *ngIf="product">
      <!-- Back Link -->
      <a routerLink="/products" class="btn-back d-inline-flex align-items-center gap-2 mb-4 text-secondary text-decoration-none">
        <i class="bi bi-arrow-left"></i> Back to Catalog
      </a>

      <!-- Main Product Info Panel -->
      <div class="row g-5 glass-panel p-4 p-md-5 mb-5 align-items-center">
        <!-- Left Side: Image -->
        <div class="col-md-6 text-center">
          <div class="image-container overflow-hidden rounded-4 border border-secondary border-opacity-10">
            <img 
              [src]="product.image" 
              [alt]="product.name" 
              class="img-fluid details-img"
            >
          </div>
        </div>

        <!-- Right Side: Details -->
        <div class="col-md-6">
          <span class="badge px-3 py-2 bg-dark-badge border border-secondary border-opacity-10 text-white rounded-pill mb-3">
            {{ product.category }}
          </span>

          <h1 class="text-white display-5 mb-2">{{ product.name }}</h1>
          
          <!-- Stock Level Status -->
          <div class="mb-4">
            <span *ngIf="product.stock > 10" class="badge bg-success bg-opacity-20 text-success border border-success border-opacity-20 px-3 py-2 rounded-pill">
              <i class="bi bi-check-circle-fill me-1"></i> In Stock ({{ product.stock }})
            </span>
            <span *ngIf="product.stock <= 10 && product.stock > 0" class="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-20 px-3 py-2 rounded-pill">
              <i class="bi bi-exclamation-triangle-fill me-1"></i> Low Stock ({{ product.stock }} left)
            </span>
            <span *ngIf="product.stock === 0" class="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-20 px-3 py-2 rounded-pill">
              <i class="bi bi-x-circle-fill me-1"></i> Out of Stock
            </span>
          </div>

          <!-- Price Tag -->
          <div class="price-box mb-4">
            <span class="text-secondary small d-block">MSRP Price</span>
            <h2 class="text-white font-weight-bold fs-1">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</h2>
          </div>

          <!-- Description -->
          <p class="text-secondary leading-relaxed mb-4">
            {{ product.description }}
          </p>

          <hr class="bg-secondary opacity-10 my-4">

          <!-- Add to Cart Actions -->
          <div class="d-flex align-items-center gap-3">
            <!-- Quantity Selection -->
            <div class="quantity-selector d-flex align-items-center rounded-3 bg-dark border border-secondary border-opacity-20 px-2">
              <button 
                (click)="decreaseQty()" 
                class="btn btn-sm btn-dark border-0 py-2 text-secondary"
                [disabled]="quantity <= 1 || product.stock === 0"
              >
                <i class="bi bi-dash fs-5"></i>
              </button>
              <span class="px-3 text-white font-weight-bold">{{ quantity }}</span>
              <button 
                (click)="increaseQty()" 
                class="btn btn-sm btn-dark border-0 py-2 text-secondary"
                [disabled]="quantity >= product.stock || product.stock === 0"
              >
                <i class="bi bi-plus fs-5"></i>
              </button>
            </div>

            <!-- Action Button -->
            <button 
              (click)="onAddToCart()" 
              class="btn btn-premium flex-grow-1 py-3 d-flex align-items-center justify-content-center gap-2"
              [disabled]="product.stock === 0"
            >
              <i class="bi bi-cart-plus-fill fs-5"></i>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div *ngIf="relatedProducts.length > 0" class="mt-5">
        <h3 class="text-white mb-4">You Might Also Like</h3>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div *ngFor="let item of relatedProducts" class="col" [@bounceIn]>
            <app-product-card [product]="item" (add)="onAddRelatedToCart($event)"></app-product-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-back {
      transition: color 0.3s ease;
      cursor: pointer;
    }
    .btn-back:hover {
      color: #8b5cf6 !important;
    }
    .image-container {
      background-color: rgba(15, 12, 27, 0.4);
      padding: 20px;
    }
    .details-img {
      max-height: 400px;
      object-fit: contain;
      transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .details-img:hover {
      transform: scale(1.05);
    }
    .bg-dark-badge {
      background-color: rgba(15, 12, 27, 0.8) !important;
      backdrop-filter: blur(8px);
    }
    .quantity-selector {
      height: 54px;
    }
    .quantity-selector button:hover {
      color: #fff !important;
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Watch path parameter modifications (such as clicking related cards)
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.quantity = 1;
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.product = response.data;
          this.loadRelatedProducts(response.data.category, response.data._id);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Failed to fetch product details.', 'danger');
        this.router.navigate(['/products']);
      }
    });
  }

  loadRelatedProducts(category: string, currentId: string): void {
    this.productService.getProducts(undefined, category, 'newest').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Exclude current product and slice first 4 items
          this.relatedProducts = response.data
            .filter((p: Product) => p._id !== currentId)
            .slice(0, 4);
        }
      }
    });
  }

  increaseQty(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onAddToCart(): void {
    if (!this.product) return;

    if (!this.authService.isAuthenticated()) {
      this.toastService.show('Please log in to add items to your cart.', 'warning');
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/product/${this.product._id}` } });
      return;
    }

    this.cartService.addToCart(this.product._id, this.quantity).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.show(`${this.quantity} x ${this.product?.name} added to cart!`, 'success');
        } else {
          this.toastService.show(response.message || 'Could not add to cart.', 'danger');
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Failed to add item. Check stock limits.';
        this.toastService.show(errorMsg, 'danger');
      }
    });
  }

  onAddRelatedToCart(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.toastService.show('Please log in to add items to your cart.', 'warning');
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/product/${this.product?._id}` } });
      return;
    }

    this.cartService.addToCart(product._id, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.show(`${product.name} added to cart!`, 'success');
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Failed to add item.';
        this.toastService.show(errorMsg, 'danger');
      }
    });
  }
}
