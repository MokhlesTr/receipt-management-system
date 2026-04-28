import { Routes } from '@angular/router';
import { RecipeListComponent } from './pages/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './pages/recipe-detail/recipe-detail.component';
import { RecipeFormComponent } from './pages/recipe-form/recipe-form.component';

export const RECIPE_ROUTES: Routes = [
  { path: '', component: RecipeListComponent },
  { path: 'new', component: RecipeFormComponent },
  { path: ':id', component: RecipeDetailComponent },
  { path: 'edit/:id', component: RecipeFormComponent }
];
