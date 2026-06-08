import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer mt-auto py-4 border-top border-secondary border-opacity-10" style="background-color: rgba(15, 12, 27, 0.8);">
      <div class="container text-center">
        <span class="text-white small">&copy; 2026 AuraCommerce Pro. Built by Musab :) </span>
        
      </div>
    </footer>
  `,
  styles: [`
    footer a {
      transition: color 0.3s ease;
    }
    footer a:hover {
      color: #8b5cf6 !important;
    }
  `]
})
export class FooterComponent { }
