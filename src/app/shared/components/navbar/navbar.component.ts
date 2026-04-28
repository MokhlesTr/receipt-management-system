import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, switchMap, of, tap } from 'rxjs';
import { RecipeService } from '../../../core/services/recipe.service';
import { Recipe } from '../../../core/models/recipe.model';
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isDarkMode = document.documentElement.classList.contains('dark');
  isSidebarOpen = false;

  searchControl = new FormControl('');
  suggestions: Recipe[] = [];
  isSearching = false;

  constructor(
    public recipeService: RecipeService,
    private router: Router,
  ) {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          if (this.searchControl.value) this.isSearching = true;
        }),
        switchMap((value) => {
          if (!value || value.length < 2) {
            this.isSearching = false;
            return of([]);
          }
          return this.recipeService.searchRecipes(value);
        }),
      )
      .subscribe((recipes) => {
        this.suggestions = recipes || [];
        this.isSearching = false;
      });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  onSuggestionSelected(recipe: Recipe) {
    this.searchControl.setValue('');
    this.router.navigate(['/recipes', recipe._id]);
  }
}
