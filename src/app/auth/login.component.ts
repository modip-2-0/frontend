import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.username || !this.password) {
      alert('Please enter both username and password.');
      return;
    }

    this.loading = true;
    try {
      const res: any = await this.auth.login(this.username, this.password);
      if (res && res.access_token) {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('username', this.username);
        alert('Login successful!');
        this.router.navigateByUrl('/');
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
