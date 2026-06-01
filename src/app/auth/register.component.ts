import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.name || !this.username || !this.email || !this.password || !this.confirmPassword) {
      alert('All fields are required.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.loading = true;
    try {
      const user = { name: this.name, username: this.username, email: this.email, password: this.password };
      const res: any = await this.auth.register(user);
      if (res && res.access_token) {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('username', this.username);
        alert('Registration successful!');
        this.router.navigateByUrl('/');
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
