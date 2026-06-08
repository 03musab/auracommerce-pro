import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { listStagger, fadeAnimation } from '../../animations/animations';
import { Product } from '../../models';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBarComponent, ProductCardComponent],
  animations: [listStagger, fadeAnimation],
  template: `
    <div class="container py-5" [@fadeAnimation]>
      <!-- Header Area -->
      <div class="d-flex flex-column align-items-center text-center mb-5">
        <h1 class="text-white display-5">Aura Premium Catalog</h1>
        <p class="text-secondary col-md-6">Browse our handpicked collection of high-tech wearables, custom audio gear, and sleek minimal accessories designed to elevate your everyday flow.</p>
      </div>

      <!-- Search and Filter Controls -->
      <app-search-bar 
        [categories]="categories"
        (search)="onSearch($event)"
        (category)="onCategory($event)"
        (sort)="onSort($event)"
      ></app-search-bar>

      <!-- Skeleton Skeletons Grid -->
      <div *ngIf="loading" class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <div *ngFor="let item of [1, 2, 3, 4]" class="col">
          <div class="card glass-card h-100 p-3" style="min-height: 400px;">
            <div class="skeleton w-100 rounded-3 mb-3" style="height: 200px;"></div>
            <div class="skeleton w-75 mb-2" style="height: 20px;"></div>
            <div class="skeleton w-50 mb-4" style="height: 15px;"></div>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <div class="skeleton w-25" style="height: 24px;"></div>
              <div class="skeleton rounded-circle" style="width: 40px; height: 40px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Real Catalog Grid -->
      <div 
        *ngIf="!loading && products.length > 0" 
        class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4"
        [@listStagger]="products.length"
      >
        <div *ngFor="let product of products; trackBy: trackByProductId" class="col">
          <app-product-card 
            [product]="product" 
            (add)="onAddToCart($event)"
          ></app-product-card>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && products.length === 0" class="text-center py-5 my-5 glass-panel col-md-8 mx-auto">
        <i class="bi bi-search-heart text-secondary display-1 mb-4"></i>
        <h3 class="text-white">No products found</h3>
        <p class="text-secondary col-md-8 mx-auto mb-4">We couldn't find any products matching your query. Adjust your search criteria or category filter and try again.</p>
        <button (click)="resetFilters()" class="btn btn-premium px-4 py-2">Reset Filters</button>
      </div>
    </div>
  `
})
export class ProductListingComponent implements OnInit {
  products: Product[] = [];
  categories = ['All', 'Audio', 'Computers', 'Wearables', 'Apparel', 'Accessories'];
  
  searchQuery = '';
  selectedCategory = 'All';
  selectedSort = 'newest';
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }

  fetchProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.searchQuery, this.selectedCategory, this.selectedSort).subscribe({
      next: (response) => {
        this.products = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Failed to fetch products. Please try again.', 'danger');
        this.loading = false;
      }
    });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.fetchProducts();
  }

  onCategory(category: string): void {
    this.selectedCategory = category;
    this.fetchProducts();
  }

  onSort(sort: string): void {
    this.selectedSort = sort;
    this.fetchProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.selectedSort = 'newest';
    // We should trigger the update on search bar, but simple reload is fine
    this.fetchProducts();
  }

  onAddToCart(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.toastService.show('Please log in to add items to your cart.', 'warning');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }

    this.cartService.addToCart(product._id, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.show(`${product.name} added to cart!`, 'success');
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
}
