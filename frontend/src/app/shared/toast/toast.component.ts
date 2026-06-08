import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastTrigger', [
      transition(':enter', [
        style({ transform: 'translateY(-20px) scale(0.9)', opacity: 0 }),
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ transform: 'translateY(10px) scale(0.9)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100;">
      <div 
        *ngFor="let toast of toasts$ | async; trackBy: trackById"
        [@toastTrigger]
        class="toast show mb-2 align-items-center text-white border-0 glass-toast-card"
        [ngClass]="getToastClass(toast.type)"
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i [ngClass]="getToastIcon(toast.type)"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button 
            type="button" 
            class="btn-close btn-close-white me-2 m-auto" 
            (click)="close(toast.id)" 
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-toast-card {
      background: rgba(30, 27, 57, 0.85) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
      min-width: 280px;
      border-radius: 10px;
    }
    .toast-success {
      border-left: 4px solid #10b981 !important;
    }
    .toast-danger {
      border-left: 4px solid #ef4444 !important;
    }
    .toast-warning {
      border-left: 4px solid #f59e0b !important;
    }
    .toast-info {
      border-left: 4px solid #3b82f6 !important;
    }
    .btn-close:focus {
      box-shadow: none;
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {}

  trackById(index: number, toast: Toast): number {
    return toast.id;
  }

  close(id: number): void {
    this.toastService.remove(id);
  }

  getToastClass(type: string): string {
    return `toast-${type}`;
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi bi-check-circle-fill text-success fs-5';
      case 'danger': return 'bi bi-exclamation-triangle-fill text-danger fs-5';
      case 'warning': return 'bi bi-exclamation-circle-fill text-warning fs-5';
      default: return 'bi bi-info-circle-fill text-info fs-5';
    }
  }
}
