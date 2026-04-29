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
    LoadingSpinnerComponent,
  ],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
})
export class RecipeListComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);

  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
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
    this.categoryService.getAllCategories().subscribe((data) => {
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
        this.filteredRecipes = [...this.recipes];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recipes:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading = true;
          this.cdr.detectChanges();
          if (query) {
            return this.recipeService.searchRecipes(query);
          } else {
            return this.recipeService.getAllRecipes();
          }
        }),
      )
      .subscribe({
        next: (data) => {
          this.filteredRecipes = data || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  applyFilters() {
    const category = this.categoryFilter.value || undefined;
    const difficulty = this.difficultyFilter.value || undefined;

    this.isLoading = true;
    this.cdr.detectChanges();
    this.recipeService.filterRecipes(category, difficulty).subscribe({
      next: (data) => {
        this.filteredRecipes = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
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
