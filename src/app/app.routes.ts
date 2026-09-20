import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | DevRoadmap'
  },
  {
    path: 'roadmap/:id',
    loadComponent: () => import('./roadmap/roadmap.component').then(m => m.RoadmapComponent),
    title: 'Roadmap | DevRoadmap'
  },
  { path: '**', redirectTo: '' }
];
