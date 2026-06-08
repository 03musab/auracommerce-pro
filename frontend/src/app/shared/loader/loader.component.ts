import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading$ | async" class="loader-overlay d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-box p-4 rounded-4 text-center">
        <div class="aura-spinner mb-3"></div>
        <h5 class="text-white mb-0 mt-2">Loading</h5>
        <small class="text-secondary">AuraCommerce Pro</small>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 12, 27, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2000;
      transition: all 0.3s ease;
    }
    .spinner-box {
      background: rgba(30, 27, 57, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    .aura-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid transparent;
      border-top: 3px solid #8b5cf6;
      border-right: 3px solid #db2777;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent implements OnInit {
  loading$ = this.loaderService.loading$;

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {}
}
