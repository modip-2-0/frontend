import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-compounds',
  imports: [CommonModule],
  template: `
    <section class="placeholder">
      <h2>Compounds</h2>
      <p>Compounds view placeholder. Aquí llegarán los datos relacionados con compuestos.</p>
    </section>
  `,
  styles: [
    ".placeholder { padding: 24px; background: #fff; border-radius: 18px; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08); color: #1f2937; }"
  ]
})
export class CompoundsComponent {}
