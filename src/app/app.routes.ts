import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'app',
    loadComponent: () => import('./shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'resources/targets', pathMatch: 'full' }, // o la ruta que prefieras
      // Recursos (targets, compounds, bioassays)
      {
        path: 'resources',
        children: [
          { path: 'targets', loadComponent: () => import('./resources/targets.component').then(m => m.TargetsComponent) },
          { path: 'compounds', loadComponent: () => import('./resources/compounds.component').then(m => m.CompoundsComponent) },
          { path: 'bioassays', loadComponent: () => import('./resources/assays.component').then(m => m.AssaysComponent) },
          { path: '', redirectTo: 'targets', pathMatch: 'full' }
        ]
      },
      // Queries
      {
        path: 'queries',
        children: [
          { path: 'new', loadComponent: () => import('./query/new-query.component').then(m => m.NewQueryComponent) },
          { path: 'all', loadComponent: () => import('./query/all-queries.component').then(m => m.AllQueriesComponent) },
          { path: '', redirectTo: 'new', pathMatch: 'full' }
        ]
      },
      // Docking
      {
        path: 'docking',
        children: [
          { path: 'new', loadComponent: () => import('./docking/new-docking.component').then(m => m.NewDockingComponent) },
          { path: 'all', loadComponent: () => import('./docking/all-docking.component').then(m => m.AllDockingComponent) },
          { path: '', redirectTo: 'new', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];