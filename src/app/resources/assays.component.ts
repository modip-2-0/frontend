import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-bioassays',
  imports: [CommonModule],
  template: `
    <section class="placeholder">
      <h2>Bioassays</h2>
      <p>Bioassays view placeholder. Aquí llegaría el contenido de ensayos biológicos.</p>
    </section>
  `,
  styles: [
    ".placeholder { padding: 24px; background: #fff; border-radius: 18px; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08); color: #1f2937; }"
  ]
})
export class AssaysComponent {}
