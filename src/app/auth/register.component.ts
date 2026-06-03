import { Component, inject } from '@angular/core';   // ← importa inject
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Usa inject en lugar de constructor
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  name = '';
  password = '';
  confirmPassword = '';
  loading = false;

  async onSubmit() {
    if (!this.email || !this.name || !this.password || !this.confirmPassword) {
      alert('All fields are required.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.loading = true;
    try {
      const user = { email: this.email, name: this.name, password: this.password };
      const res = await firstValueFrom(this.auth.register(user));
      if (res && res.access_token) {
        alert('Registration successful!');
        this.router.navigateByUrl('/app');
      } else {
        alert('Registration failed: unexpected response');
      }
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Connection error';
      alert(`Registration failed: ${msg}`);
    } finally {
      this.loading = false;
    }
  }
}