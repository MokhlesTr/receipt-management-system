import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'recipes',
    loadChildren: () => import('./features/recipes/recipes.routes').then(m => m.RECIPE_ROUTES)
  },
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.routes').then(m => m.CATEGORY_ROUTES)
  },
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  { path: '**', redirectTo: 'recipes' }
];
