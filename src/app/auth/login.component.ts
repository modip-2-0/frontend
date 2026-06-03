import { Component, inject } from '@angular/core';   // ← importa inject
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Usa inject en lugar de constructor
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;

  async onSubmit() {
    if (!this.email || !this.password) {
      alert('Please enter both email and password.');
      return;
    }

    this.loading = true;
    try {
      const res = await firstValueFrom(this.auth.login(this.email, this.password));
      if (res && res.access_token) {
        alert('Login successful!');
        this.router.navigateByUrl('/app');
      } else {
        alert('Login failed: unexpected response');
      }
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Connection error';
      alert(`Login failed: ${msg}`);
    } finally {
      this.loading = false;
    }
  }
}