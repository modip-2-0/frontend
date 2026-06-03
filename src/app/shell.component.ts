import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent {
  modules = [
    {
      title: 'Resources',
      items: [
        { path: '/app/resources/targets', label: 'Targets' },
        { path: '/app/resources/compounds', label: 'Compounds' },
        { path: '/app/resources/bioassays', label: 'Bioassays' }
      ]
    },
    {
      title: 'Queries',
      items: [
        { path: '/app/queries/new', label: 'New Query' },
        { path: '/app/queries/all', label: 'All Queries' }
      ]
    },
    {
      title: 'Docking',
      items: [
        { path: '/app/docking/new', label: 'New Docking' },
        { path: '/app/docking/all', label: 'All Docking' }
      ]
    }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  get userLabel() {
    return this.authService.getEmail() || 'User';
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
