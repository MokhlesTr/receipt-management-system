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
  template: `
    <header class="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16 gap-4">
          <!-- Logo Section -->
          <div class="flex items-center flex-shrink-0">
            <a routerLink="/" class="flex items-center gap-2">
              <div class="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
                <mat-icon>restaurant</mat-icon>
              </div>
              <span class="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight hidden sm:block">Recipe<span class="text-orange-600">Hub</span></span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-1 flex-shrink-0">
            <a routerLink="/recipes" routerLinkActive="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" [routerLinkActiveOptions]="{exact: false}" class="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all">Recipes</a>
            <a routerLink="/categories" routerLinkActive="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" class="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all">Categories</a>
          </nav>

          <!-- Search Bar (Now more flexible) -->
          <div class="flex-grow flex justify-center px-2">
            <div class="w-full max-w-md relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <mat-icon class="text-slate-400 text-[20px] w-[20px] h-[20px]">search</mat-icon>
              </div>
              <input 
                [formControl]="searchControl"
                [matAutocomplete]="auto"
                type="text" 
                class="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-neutral-700 rounded-xl bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all shadow-sm" 
                placeholder="Search recipes...">
              
              <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSuggestionSelected($event.option.value)" class="custom-autocomplete">
                <mat-option *ngIf="isSearching" disabled class="loading-option">
                  <div class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                    Searching...
                  </div>
                </mat-option>
                <mat-option *ngFor="let suggestion of suggestions" [value]="suggestion">
                  <div class="flex items-center gap-3 py-1">
                    <img [src]="recipeService.getImageUrl(suggestion.image)" class="w-10 h-10 rounded-lg object-cover shadow-sm">
                    <div class="flex flex-col overflow-hidden">
                      <span class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ suggestion.name }}</span>
                      <span class="text-xs text-slate-500">{{ suggestion.difficulty }} • {{ suggestion.preparationTime }} min</span>
                    </div>
                  </div>
                </mat-option>
                <mat-option *ngIf="!isSearching && suggestions.length === 0 && searchControl.value && searchControl.value.length >= 2" disabled>
                  No recipes found for "{{ searchControl.value }}"
                </mat-option>
              </mat-autocomplete>
            </div>
          </div>

          <!-- Actions Section -->
          <div class="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <button (click)="toggleTheme()" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400 transition-colors">
              <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            
            <a routerLink="/recipes/new" class="hidden md:flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-100 dark:shadow-none transform hover:scale-105 active:scale-95">
              <mat-icon class="text-[20px] w-[20px] h-[20px]">add</mat-icon>
              <span>New Recipe</span>
            </a>

            <!-- Mobile Menu Toggle -->
            <button (click)="isSidebarOpen = true" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 transition-colors">
              <mat-icon>menu</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Sidebar Backdrop -->
    <div 
      *ngIf="isSidebarOpen" 
      (click)="isSidebarOpen = false" 
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-300"
    ></div>

    <!-- Mobile Sidebar -->
    <div 
      class="fixed inset-y-0 left-0 w-80 bg-white dark:bg-neutral-900 z-[70] lg:hidden transform transition-transform duration-300 ease-out shadow-2xl"
      [ngClass]="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-8 h-full flex flex-col">
        <div class="flex items-center justify-between mb-10">
          <a routerLink="/" (click)="isSidebarOpen = false" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
              <mat-icon>restaurant</mat-icon>
            </div>
            <span class="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">RecipeHub</span>
          </a>
          <button (click)="isSidebarOpen = false" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 transition-colors">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <nav class="flex flex-col gap-4">
          <a routerLink="/recipes" routerLinkActive="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" (click)="isSidebarOpen = false" class="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-all">
            <mat-icon class="text-orange-600">restaurant_menu</mat-icon>
            All Recipes
          </a>
          <a routerLink="/categories" routerLinkActive="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" (click)="isSidebarOpen = false" class="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-all">
            <mat-icon class="text-orange-600">category</mat-icon>
            Categories
          </a>
        </nav>

        <div class="mt-auto pt-8 border-t border-slate-100 dark:border-neutral-800">
          <a routerLink="/recipes/new" (click)="isSidebarOpen = false" class="flex items-center justify-center gap-3 w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-orange-200 dark:shadow-none">
            <mat-icon>add</mat-icon>
            Create New Recipe
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: 50;
      }
      ::ng-deep .mat-mdc-autocomplete-panel {
        background-color: #ffffff !important;
        border-radius: 16px !important;
        margin-top: 8px !important;
        box-shadow:
          0 10px 25px -5px rgba(0, 0, 0, 0.1),
          0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        border: 1px solid rgba(0, 0, 0, 0.05) !important;
        overflow: hidden !important;
      }
      .dark ::ng-deep .mat-mdc-autocomplete-panel {
        background-color: #171717 !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
      ::ng-deep .loading-option {
        height: 48px !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 16px !important;
        color: #64748b !important;
      }
      .dark ::ng-deep .loading-option {
        color: #a3a3a3 !important;
      }
    `,
  ],
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
