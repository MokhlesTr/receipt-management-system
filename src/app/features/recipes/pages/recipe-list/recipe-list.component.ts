import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { RecipeService } from '../../../../core/services/recipe.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Recipe } from '../../../../core/models/recipe.model';
import { Category } from '../../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent
  ],
  template: `
    <!-- HERO SECTION -->
    <section class="py-20 sm:py-24 bg-white dark:bg-neutral-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
              <span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Culinary Journey
            </span>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6 font-display">Discover Delicious Recipes</h1>
          </div>
          <div class="lg:pt-12">
            <p class="text-lg text-slate-600 dark:text-neutral-400 mb-8">
              Explore our collection of hand-crafted recipes. Whether you're looking for a quick weeknight dinner or an elaborate weekend feast, we've got you covered.
            </p>
            <div class="flex flex-wrap gap-4">
              <a routerLink="/recipes/new" class="px-6 py-3 bg-orange-600 hover:bg-orange-700 transition-colors rounded-full text-white font-semibold shadow-sm">Submit Recipe</a>
              <button (click)="scrollToExplore()" class="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors rounded-full text-slate-900 dark:text-white font-semibold">Explore Now</button>
            </div>
          </div>
        </div>

        <app-loading-spinner [loading]="isLoading"></app-loading-spinner>

        <div *ngIf="!isLoading && recipes.length > 0">
          <!-- Bento Grid Images -->
          <div class="grid lg:grid-cols-3 gap-5">
          <div *ngIf="recipes[0]?._id" class="lg:col-span-2 lg:row-span-2 relative rounded-3xl overflow-hidden h-80 lg:h-[32rem] group cursor-pointer" [routerLink]="['/recipes', recipes[0]._id]">
              <img [src]="getRecipeImage(recipes[0])" [alt]="recipes[0].name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
              <div class="absolute bottom-6 left-6 right-6">
                <span class="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 block bg-slate-900/50 backdrop-blur-md w-max px-3 py-1 rounded-full">Featured Recipe</span>
                <h3 class="text-white text-3xl md:text-4xl font-bold font-display">{{ recipes[0].name }}</h3>
                <p class="text-slate-300 text-sm mt-2 line-clamp-2 md:text-base max-w-xl">{{ recipes[0].description }}</p>
              </div>
            </div>

            <div *ngIf="recipes[1]?._id" class="relative rounded-3xl overflow-hidden h-64 lg:h-[15.5rem] group cursor-pointer" [routerLink]="['/recipes', recipes[1]._id]">
              <img [src]="getRecipeImage(recipes[1])" [alt]="recipes[1].name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
              <div class="absolute bottom-5 left-5 right-5">
                <h4 class="text-white font-bold font-display text-xl mb-1">{{ recipes[1].name }}</h4>
                <span class="text-slate-300 text-xs font-semibold bg-orange-600 px-2 py-0.5 rounded text-white">{{ recipes[1].preparationTime }} MIN / {{ recipes[1].difficulty | uppercase }}</span>
              </div>
            </div>

            <div *ngIf="recipes[2]?._id" class="relative rounded-3xl overflow-hidden h-64 lg:h-[15.5rem] group cursor-pointer" [routerLink]="['/recipes', recipes[2]._id]">
              <img [src]="getRecipeImage(recipes[2])" [alt]="recipes[2].name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
              <div class="absolute bottom-5 left-5 right-5">
                <h4 class="text-white font-bold font-display text-xl mb-1">{{ recipes[2].name }}</h4>
                <span class="text-slate-300 text-xs font-semibold bg-orange-600 px-2 py-0.5 rounded text-white">{{ recipes[2].preparationTime }} MIN / {{ recipes[2].difficulty | uppercase }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-12 border-t border-slate-200 dark:border-neutral-800">
          <div class="text-center">
            <span class="text-4xl font-bold text-orange-600 dark:text-orange-400 block font-display">{{ recipes.length }}</span>
            <span class="text-slate-500 dark:text-neutral-400 text-sm font-medium uppercase tracking-wide">Recipes</span>
          </div>
          <div class="text-center">
            <span class="text-4xl font-bold text-orange-600 dark:text-orange-400 block font-display">{{ categories.length }}</span>
            <span class="text-slate-500 dark:text-neutral-400 text-sm font-medium uppercase tracking-wide">Categories</span>
          </div>
          <div class="text-center">
            <span class="text-4xl font-bold text-orange-600 dark:text-orange-400 block font-display">12K+</span>
            <span class="text-slate-500 dark:text-neutral-400 text-sm font-medium uppercase tracking-wide">Foodies</span>
          </div>
          <div class="text-center">
            <span class="text-4xl font-bold text-orange-600 dark:text-orange-400 block font-display">100%</span>
            <span class="text-slate-500 dark:text-neutral-400 text-sm font-medium uppercase tracking-wide">Delicious</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters Section -->
    <section id="explore" class="py-16 bg-slate-50 dark:bg-neutral-900 border-t border-b border-slate-200 dark:border-neutral-800 scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold font-display text-slate-900 dark:text-white">Explore All Recipes</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/20">
          <mat-form-field appearance="outline" class="w-full filter-field">
            <mat-label>Search recipes...</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Ex. Pasta">
            <mat-icon matSuffix class="text-slate-400">search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full filter-field">
            <mat-label>Filter by Category</mat-label>
            <mat-select [formControl]="categoryFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All Categories</mat-option>
              <mat-option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full filter-field">
            <mat-label>Filter by Difficulty</mat-label>
            <mat-select [formControl]="difficultyFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All Difficulties</mat-option>
              <mat-option value="Easy">Easy</mat-option>
              <mat-option value="Medium">Medium</mat-option>
              <mat-option value="Hard">Hard</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div *ngIf="!isLoading && filteredRecipes.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <mat-icon class="text-5xl text-slate-400">restaurant_menu</mat-icon>
          </div>
          <h3 class="text-2xl font-bold mb-3 font-display">No recipes found</h3>
          <p class="text-slate-500 mb-8 text-lg">Try adjusting your search or filters to find what you're looking for.</p>
          <button mat-flat-button class="!bg-orange-600 !text-white !rounded-full !px-8 !py-6 font-bold text-lg" (click)="resetFilters()">Reset All Filters</button>
        </div>

        <div *ngIf="!isLoading && filteredRecipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          <ng-container *ngFor="let recipe of filteredRecipes">
            <div *ngIf="recipe._id" class="bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-neutral-700 group flex flex-col h-full" [routerLink]="['/recipes', recipe._id]">
            <div class="h-56 overflow-hidden relative">
              <img [src]="getRecipeImage(recipe)" [alt]="recipe.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
              <div class="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {{ recipe.difficulty | uppercase }}
              </div>
            </div>
            <div class="p-6 flex flex-col flex-grow">
              <h4 class="font-bold font-display text-xl mb-3 text-slate-900 dark:text-white line-clamp-1 group-hover:text-orange-600 transition-colors">{{ recipe.name }}</h4>
              <p class="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">{{ recipe.description }}</p>
              <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-neutral-700">
                <div class="flex items-center text-slate-500 text-sm font-medium">
                  <mat-icon class="text-[18px] w-[18px] h-[18px] mr-1">schedule</mat-icon>
                  <span>{{ recipe.preparationTime }} MIN</span>
                </div>
                <button class="text-orange-600 dark:text-orange-400 font-semibold text-sm hover:underline flex items-center">
                  View <mat-icon class="text-[16px] w-[16px] h-[16px] ml-1">arrow_forward</mat-icon>
                </button>
              </div>
            </div>
            </div>
          </ng-container>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20 sm:py-24 bg-white dark:bg-neutral-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
            <span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Foodie Stories
          </span>
          <h2 class="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 font-display">Reviews from our community</h2>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Card 1 -->
          <div class="bg-slate-50 dark:bg-neutral-900 rounded-3xl p-8 border border-slate-100 dark:border-neutral-800 hover:shadow-lg transition-shadow">
            <p class="text-slate-700 dark:text-neutral-300 text-lg leading-relaxed mb-8 font-medium">"These recipes are foolproof! The step-by-step instructions made it so easy to cook a gourmet dinner for my family."</p>
            <div class="flex items-center gap-4 border-t border-slate-200 dark:border-neutral-700 pt-6">
              <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">SM</div>
              <div>
                <h6 class="text-slate-900 dark:text-white font-bold">Sarah Mitchell</h6>
                <span class="text-orange-600 dark:text-orange-400 text-sm font-medium">Home Chef</span>
              </div>
            </div>
          </div>
          <!-- Card 2 -->
          <div class="bg-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-200 dark:shadow-none transform lg:-translate-y-4">
            <p class="text-orange-50 text-lg leading-relaxed mb-8 font-medium">"Amazing platform! The variety of categories and the beautiful UI makes browsing for dinner ideas a joy every day."</p>
            <div class="flex items-center gap-4 border-t border-orange-500 pt-6">
              <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">MC</div>
              <div>
                <h6 class="text-white font-bold">Marcus Chen</h6>
                <span class="text-orange-200 text-sm font-medium">Food Enthusiast</span>
              </div>
            </div>
          </div>
          <!-- Card 3 -->
          <div class="bg-slate-50 dark:bg-neutral-900 rounded-3xl p-8 border border-slate-100 dark:border-neutral-800 hover:shadow-lg transition-shadow">
            <p class="text-slate-700 dark:text-neutral-300 text-lg leading-relaxed mb-8 font-medium">"I love uploading my family recipes here. It's safe, beautiful, and sharing with friends is incredibly easy!"</p>
            <div class="flex items-center gap-4 border-t border-slate-200 dark:border-neutral-700 pt-6">
              <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">ER</div>
              <div>
                <h6 class="text-slate-900 dark:text-white font-bold">Emma Rodriguez</h6>
                <span class="text-orange-600 dark:text-orange-400 text-sm font-medium">Baking Expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 sm:py-24 bg-slate-50 dark:bg-neutral-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <div class="bg-orange-600 dark:bg-orange-700 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl shadow-orange-200 dark:shadow-none">
            <div class="absolute top-0 left-0 w-64 h-64 bg-orange-500/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
            <div class="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/50 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl"></div>
            
            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
                <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span class="text-sm font-bold text-white uppercase tracking-wider">Join the Community</span>
              </div>
              <h2 class="text-4xl sm:text-5xl font-bold text-white leading-tight font-display mb-6">
                Submit Your Own Recipe Today
              </h2>
              <p class="text-orange-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Share your culinary masterpiece with thousands of foodies worldwide. Create your recipe profile, upload photos, and inspire others!
              </p>
              <a routerLink="/recipes/new" class="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-orange-50 text-orange-700 font-bold rounded-full transition-transform hover:scale-105 shadow-xl">
                Create Recipe Now
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .filter-field .mat-mdc-form-field-subscript-wrapper {
      display: none; /* Keep hidden if we want a compact look, but ensure it doesn't break padding */
    }
    ::ng-deep .filter-field .mat-mdc-text-field-wrapper {
      background-color: rgba(0,0,0,0.02) !important;
      padding: 0 12px !important;
      border-radius: 12px !important;
      transition: all 0.2s ease;
    }
    .dark ::ng-deep .filter-field .mat-mdc-text-field-wrapper {
      background-color: rgba(255,255,255,0.05) !important;
    }
    ::ng-deep .filter-field.mat-mdc-form-field-appearance-outline .mat-mdc-notched-outline {
      color: rgba(0,0,0,0.1) !important;
    }
    .dark ::ng-deep .filter-field.mat-mdc-form-field-appearance-outline .mat-mdc-notched-outline {
      color: rgba(255,255,255,0.1) !important;
    }
    ::ng-deep .filter-field.mat-mdc-form-field-focused .mat-mdc-notched-outline {
      color: var(--primary-color) !important;
    }
  `]
})
export class RecipeListComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);

  recipes: Recipe[] = []; // Top featured recipes (Hero)
  filteredRecipes: Recipe[] = []; // Filtered recipes (Explore)
  categories: Category[] = [];
  isLoading = false;

  searchControl = new FormControl('');
  categoryFilter = new FormControl('');
  difficultyFilter = new FormControl('');

  ngOnInit() {
    console.log('RecipeListComponent initialized');
    this.loadCategories();
    this.loadRecipes();
    this.setupSearch();
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(data => {
      console.log('Categories loaded:', data);
      this.categories = data;
      this.cdr.detectChanges();
    });
  }

  loadRecipes() {
    this.isLoading = true;
    this.cdr.detectChanges();
    console.log('Loading recipes...');
    this.recipeService.getAllRecipes().subscribe({
      next: (data) => {
        console.log('Recipes loaded:', data);
        this.recipes = data || [];
        this.filteredRecipes = [...this.recipes]; // Initialize filtered list with full set
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recipes:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading = true;
        this.cdr.detectChanges();
        if (query) {
          return this.recipeService.searchRecipes(query);
        } else {
          return this.recipeService.getAllRecipes();
        }
      })
    ).subscribe({
      next: (data) => {
        this.filteredRecipes = data || []; // Update ONLY the explore section
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    const category = this.categoryFilter.value || undefined;
    const difficulty = this.difficultyFilter.value || undefined;

    this.isLoading = true;
    this.cdr.detectChanges();
    this.recipeService.filterRecipes(category, difficulty).subscribe({
      next: (data) => {
        this.filteredRecipes = data || []; // Update ONLY the explore section
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetFilters() {
    this.searchControl.setValue('');
    this.categoryFilter.setValue('');
    this.difficultyFilter.setValue('');
    this.loadRecipes();
  }

  scrollToExplore() {
    document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
  }

  getRecipeImage(recipe: Recipe): string {
    return this.recipeService.getImageUrl(recipe.image);
  }
}
