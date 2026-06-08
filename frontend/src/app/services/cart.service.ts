import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { CartItem } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = '/api/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  private cartTotalSubject = new BehaviorSubject<number>(0);
  public cartTotal$ = this.cartTotalSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // React to authentication changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCart();
      } else {
        this.clearLocal();
      }
    });
  }

  private loadCart(): void {
    this.http.get<any>(this.apiUrl, { headers: this.authService.getAuthHeaders() }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.updateCartState(response.data);
        }
      },
      error: (err) => {
        console.error('Failed to load cart', err);
      }
    });
  }

  private updateCartState(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    
    // Calculate count
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    this.cartCountSubject.next(count);

    // Calculate total
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.cartTotalSubject.next(total);
  }

  addToCart(productId: string, quantity: number = 1): Observable<any> {
    return this.http.post<any>(
      this.apiUrl, 
      { productId, quantity }, 
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Refresh entire cart list from backend to make sure states sync
          this.loadCart();
        }
      })
    );
  }

  updateQuantity(cartItemId: string, quantity: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${cartItemId}`, 
      { quantity }, 
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentItems = this.cartItemsSubject.value.map(item => {
            if (item._id === cartItemId) {
              return { ...item, quantity };
            }
            return item;
          });
          this.updateCartState(currentItems);
        }
      })
    );
  }

  removeFromCart(cartItemId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${cartItemId}`, 
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      tap(response => {
        if (response.success) {
          const filteredItems = this.cartItemsSubject.value.filter(item => item._id !== cartItemId);
          this.updateCartState(filteredItems);
        }
      })
    );
  }

  clearLocal(): void {
    this.updateCartState([]);
  }
}
