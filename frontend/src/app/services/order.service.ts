import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Order } from '../models';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  placeOrder(customerName: string, address: string, mobile: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      { customerName, address, mobile },
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      tap(response => {
        if (response.success) {
          // Clear cart local state since order checkout cleans backend cart
          this.cartService.clearLocal();
        }
      })
    );
  }

  getOrders(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.authService.getAuthHeaders() });
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.authService.getAuthHeaders() });
  }
}
