import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel p-4 mb-4">
      <div class="row g-3">
        <!-- Search Input -->
        <div class="col-md-5">
          <label class="form-label text-secondary small">Search Products</label>
          <div class="position-relative">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
            <input 
              type="text" 
              class="form-control glass-input ps-5" 
              placeholder="What are you looking for?"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
            >
          </div>
        </div>

        <!-- Category Filter -->
        <div class="col-md-4 col-sm-6">
          <label class="form-label text-secondary small">Filter Category</label>
          <select 
            class="form-select glass-input" 
            [(ngModel)]="selectedCategory"
            (change)="onCategoryChange()"
          >
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- Sorting Selector -->
        <div class="col-md-3 col-sm-6">
          <label class="form-label text-secondary small">Sort By</label>
          <select 
            class="form-select glass-input" 
            [(ngModel)]="selectedSort"
            (change)="onSortChange()"
          >
            <option value="newest">Newest Releases</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class SearchBarComponent implements OnInit {
  @Input() categories: string[] = ['All'];
  @Output() search = new EventEmitter<string>();
  @Output() category = new EventEmitter<string>();
  @Output() sort = new EventEmitter<string>();

  searchQuery = '';
  selectedCategory = 'All';
  selectedSort = 'newest';

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Debounce search inputs to optimize API calls
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.search.emit(value);
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onCategoryChange(): void {
    this.category.emit(this.selectedCategory);
  }

  onSortChange(): void {
    this.sort.emit(this.selectedSort);
  }
}
