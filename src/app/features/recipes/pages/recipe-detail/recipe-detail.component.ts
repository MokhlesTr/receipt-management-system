import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { RecipeService } from '../../../../core/services/recipe.service';
import { Recipe } from '../../../../core/models/recipe.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" *ngIf="recipe; else loading">
      <!-- Header / Nav -->
      <button routerLink="/recipes" class="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors mb-8 font-medium">
        <mat-icon class="text-[20px] w-[20px] h-[20px]">arrow_back</mat-icon> Back to Recipes
      </button>

      <!-- Hero Section -->
      <div class="relative rounded-[2.5rem] overflow-hidden mb-16 shadow-lg bg-slate-900">
        <div class="aspect-[21/9] w-full">
          <img [src]="getRecipeImage()" [alt]="recipe.name" class="w-full h-full object-cover opacity-80">
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div class="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div class="flex flex-wrap items-center gap-4 mb-4">
            <span class="px-4 py-1.5 bg-orange-500 text-white text-sm font-bold uppercase tracking-wider rounded-full shadow-sm">{{ getCategoryName() }}</span>
            <span class="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-sm font-bold uppercase tracking-wider rounded-full border border-white/30">{{ recipe.difficulty }}</span>
            <span class="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-sm font-bold uppercase tracking-wider rounded-full border border-white/30 flex items-center gap-1">
              <mat-icon class="text-[16px] w-[16px] h-[16px]">schedule</mat-icon> {{ recipe.preparationTime }} MIN
            </span>
          </div>
          
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 class="text-4xl md:text-6xl font-bold font-display text-white leading-tight max-w-3xl">{{ recipe.name }}</h1>
            
            <div class="flex gap-3">
              <button [routerLink]="['/recipes/edit', recipe._id]" class="w-12 h-12 rounded-full bg-white text-slate-900 hover:bg-orange-100 hover:text-orange-600 transition-colors flex items-center justify-center shadow-lg">
                <mat-icon>edit</mat-icon>
              </button>
              <button (click)="deleteRecipe()" class="w-12 h-12 rounded-full bg-white text-slate-900 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center shadow-lg">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description -->
          <div class="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-neutral-700">
            <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center">
                <mat-icon class="text-[20px] w-[20px] h-[20px]">info</mat-icon>
              </span>
              Description
            </h2>
            <p class="text-lg text-slate-700 dark:text-neutral-300 leading-relaxed">{{ recipe.description }}</p>
          </div>

          <!-- Instructions -->
          <div class="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-neutral-700">
            <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center">
                <mat-icon class="text-[20px] w-[20px] h-[20px]">restaurant_menu</mat-icon>
              </span>
              Instructions
            </h2>
            <div class="text-lg text-slate-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{{ recipe.instructions }}</div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-neutral-800 rounded-3xl p-8 border border-slate-100 dark:border-neutral-700 shadow-sm sticky top-8">
            <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center">
                <mat-icon class="text-[20px] w-[20px] h-[20px]">kitchen</mat-icon>
              </span>
              Ingredients
            </h2>
            <ul class="space-y-4">
              <li *ngFor="let ing of recipe.ingredients" class="flex items-start gap-3 text-slate-700 dark:text-neutral-300 pb-4 border-b border-slate-100 dark:border-neutral-700 last:border-0 last:pb-0">
                <mat-icon class="text-orange-500 mt-0.5">check_circle</mat-icon>
                <span class="leading-relaxed text-lg">{{ ing }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="py-24">
        <app-loading-spinner [loading]="isLoading"></app-loading-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RecipeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);

  recipe?: Recipe;
  isLoading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeService.getRecipeById(id).subscribe({
        next: (data) => {
          this.recipe = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/recipes']);
        }
      });
    }
  }

  getCategoryName(): string {
    if (this.recipe?.category && typeof this.recipe.category === 'object') {
      return this.recipe.category.name;
    }
    return 'Uncategorized';
  }

  getRecipeImage(): string {
    if (!this.recipe?.image || this.recipe.image === 'no-photo.jpg') {
      return 'https://placehold.co/800x600?text=Recipe+Image';
    }
    return this.recipe.image;
  }

  deleteRecipe() {
    if (!this.recipe?._id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.recipeService.deleteRecipe(this.recipe!._id!).subscribe(() => {
          Swal.fire('Deleted!', 'The recipe has been deleted.', 'success');
          this.router.navigate(['/recipes']);
        });
      }
    });
  }
}
