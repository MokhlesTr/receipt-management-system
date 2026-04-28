import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { RecipeService } from '../../../../core/services/recipe.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-recipe-form',
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
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/recipes" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500 hover:bg-orange-100 hover:text-orange-600 transition-colors flex items-center justify-center">
          <mat-icon class="text-[20px] w-[20px] h-[20px]">arrow_back</mat-icon>
        </button>
        <h1 class="text-3xl font-bold font-display text-slate-900 dark:text-white mb-0">
          {{ isEditMode ? 'Edit Recipe' : 'Create New Recipe' }}
        </h1>
      </div>

      <app-loading-spinner [loading]="isSubmitting"></app-loading-spinner>

      <form [formGroup]="recipeForm" (ngSubmit)="onSubmit()" class="space-y-8" *ngIf="!isSubmitting">
        <!-- Main Form Card -->
        <div class="bg-white dark:bg-neutral-800 rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100 dark:border-neutral-700">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">Recipe Name *</label>
                <input type="text" formControlName="name" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all" placeholder="e.g. Grandma's Apple Pie">
                <p class="text-red-500 text-xs mt-2" *ngIf="recipeForm.get('name')?.hasError('required') && recipeForm.get('name')?.touched">Name is required</p>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">Description *</label>
                <textarea formControlName="description" rows="3" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all resize-none" placeholder="A brief overview of your dish..."></textarea>
                <p class="text-red-500 text-xs mt-2" *ngIf="recipeForm.get('description')?.hasError('required') && recipeForm.get('description')?.touched">Description is required</p>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">Category *</label>
                <select formControlName="category" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all appearance-none">
                  <option value="" disabled selected>Select a category</option>
                  <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">Time (Min) *</label>
                  <input type="number" formControlName="preparationTime" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all">
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">Difficulty *</label>
                  <select formControlName="difficulty" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all appearance-none">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 dark:border-neutral-700 pt-8 mb-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold font-display text-slate-900 dark:text-white">Ingredients</h3>
              <button type="button" (click)="addIngredient()" class="text-orange-600 hover:text-orange-700 font-bold text-sm flex items-center gap-1 transition-colors">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">add_circle</mat-icon> Add Item
              </button>
            </div>
            
            <div formArrayName="ingredients" class="space-y-3">
              <div *ngFor="let ing of ingredients.controls; let i=index" class="flex gap-3">
                <input type="text" [formControlName]="i" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all" [placeholder]="'Ingredient ' + (i + 1)">
                <button type="button" (click)="removeIngredient(i)" [disabled]="ingredients.length <= 1" class="w-12 h-12 flex-shrink-0 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-400 hover:bg-red-100 hover:text-red-500 disabled:opacity-50 transition-colors flex items-center justify-center">
                  <mat-icon class="text-[20px] w-[20px] h-[20px]">delete</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 dark:border-neutral-700 pt-8 mb-8">
            <h3 class="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">Instructions</h3>
            <textarea formControlName="instructions" rows="6" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all" placeholder="Step 1: ..."></textarea>
          </div>

          <div class="border-t border-slate-100 dark:border-neutral-700 pt-8">
            <h3 class="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">Recipe Image</h3>
            
            <div class="flex gap-4 mb-6">
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="imageType" value="url" [checked]="imageType === 'url'" (change)="imageType = 'url'" class="peer sr-only">
                <div class="p-4 text-center rounded-xl border-2 peer-checked:border-orange-500 peer-checked:bg-orange-50 dark:peer-checked:bg-orange-900/20 border-slate-200 dark:border-neutral-700 hover:border-orange-300 transition-all font-bold text-slate-600 dark:text-neutral-300 peer-checked:text-orange-600">
                  Image URL
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="imageType" value="file" [checked]="imageType === 'file'" (change)="imageType = 'file'" class="peer sr-only">
                <div class="p-4 text-center rounded-xl border-2 peer-checked:border-orange-500 peer-checked:bg-orange-50 dark:peer-checked:bg-orange-900/20 border-slate-200 dark:border-neutral-700 hover:border-orange-300 transition-all font-bold text-slate-600 dark:text-neutral-300 peer-checked:text-orange-600">
                  Upload File
                </div>
              </label>
            </div>

            <div *ngIf="imageType === 'url'" class="mb-6">
              <input type="text" formControlName="image" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all" placeholder="https://example.com/image.jpg">
            </div>

            <div *ngIf="imageType === 'file'" class="mb-6">
              <div class="flex items-center justify-center w-full">
                <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-neutral-600 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                    <mat-icon class="text-3xl mb-2">cloud_upload</mat-icon>
                    <p class="text-sm font-semibold">Click to upload or drag and drop</p>
                  </div>
                  <input id="dropzone-file" type="file" class="hidden" (change)="onFileSelected($event)" accept="image/*" />
                </label>
              </div>
            </div>

            <div *ngIf="recipeForm.get('image')?.value && recipeForm.get('image')?.value !== ''" class="rounded-2xl overflow-hidden aspect-[21/9] bg-slate-100 dark:bg-neutral-900 relative shadow-inner">
              <img [src]="getImageUrl(recipeForm.get('image')?.value)" class="w-full h-full object-cover">
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4">
          <button type="button" routerLink="/recipes" class="px-8 py-4 rounded-full font-bold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
            Cancel
          </button>
          <button type="submit" [disabled]="recipeForm.invalid" class="px-10 py-4 rounded-full font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-200 dark:shadow-none flex items-center gap-2">
            <mat-icon class="text-[20px] w-[20px] h-[20px]">{{ isEditMode ? 'save' : 'check' }}</mat-icon>
            {{ isEditMode ? 'Update Recipe' : 'Create Recipe' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RecipeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  recipeForm: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  recipeId?: string;
  isSubmitting = false;

  imageType: 'url' | 'file' = 'url';
  selectedFile: File | null = null;

  constructor() {
    this.recipeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      ingredients: this.fb.array([this.fb.control('', Validators.required)]),
      instructions: ['', Validators.required],
      preparationTime: [30, [Validators.required, Validators.min(1)]],
      difficulty: ['Easy', Validators.required],
      category: ['', Validators.required],
      image: ['']
    });
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  ngOnInit() {
    this.loadCategories();
    this.recipeId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.recipeId && this.route.snapshot.url[0].path === 'edit') {
      this.isEditMode = true;
      this.loadRecipe();
    }
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
      this.cdr.detectChanges();
    });
  }

  loadRecipe() {
    if (!this.recipeId) return;
    this.recipeService.getRecipeById(this.recipeId).subscribe(recipe => {
      while (this.ingredients.length) {
        this.ingredients.removeAt(0);
      }
      recipe.ingredients.forEach(ing => this.addIngredient(ing));
      
      this.recipeForm.patchValue({
        name: recipe.name,
        description: recipe.description,
        instructions: recipe.instructions,
        preparationTime: recipe.preparationTime,
        difficulty: recipe.difficulty,
        category: typeof recipe.category === 'object' ? recipe.category._id : recipe.category,
        image: recipe.image
      });
      this.cdr.detectChanges();
    });
  }

  addIngredient(value: string = '') {
    this.ingredients.push(this.fb.control(value, Validators.required));
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  getImageUrl(path: string): string {
    // If it's a base64 string (preview), return it as is
    if (path && path.startsWith('data:image')) {
      return path;
    }
    return this.recipeService.getImageUrl(path);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Set the base64 preview, but don't save this to DB, we will replace it with the uploaded URL before saving
        this.recipeForm.patchValue({ image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.recipeForm.invalid) return;

    this.isSubmitting = true;
    this.cdr.detectChanges();

    if (this.imageType === 'file' && this.selectedFile) {
      this.recipeService.uploadImage(this.selectedFile).subscribe({
        next: (url) => {
          this.recipeForm.patchValue({ image: url });
          this.saveRecipe();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error uploading image', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.saveRecipe();
    }
  }

  private saveRecipe() {
    const recipeData = this.recipeForm.value;

    if (this.isEditMode && this.recipeId) {
      this.recipeService.updateRecipe(this.recipeId, recipeData).subscribe({
        next: () => {
          this.snackBar.open('Recipe updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/recipes', this.recipeId]);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error updating recipe', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.recipeService.createRecipe(recipeData).subscribe({
        next: (newRecipe) => {
          this.snackBar.open('Recipe created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/recipes', newRecipe._id]);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error creating recipe', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
