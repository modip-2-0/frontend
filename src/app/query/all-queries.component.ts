import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-all-queries',
  imports: [CommonModule],
  template: `
    <section class="placeholder">
      <h2>All Queries</h2>
      <p>All Queries view placeholder. Aquí verás el historial de todas tus consultas.</p>
    </section>
  `,
  styles: [
    ".placeholder { padding: 24px; background: #fff; border-radius: 18px; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08); color: #1f2937; }"
  ]
})
export class AllQueriesComponent {}
