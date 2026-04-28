import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CategoryService } from '../../../../core/services/category.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/categories" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500 hover:bg-orange-100 hover:text-orange-600 transition-colors flex items-center justify-center">
          <mat-icon class="text-[20px] w-[20px] h-[20px]">arrow_back</mat-icon>
        </button>
        <h1 class="text-3xl font-bold font-display text-slate-900 dark:text-white mb-0">
          {{ isEditMode ? 'Edit Category' : 'Create Category' }}
        </h1>
      </div>

      <app-loading-spinner [loading]="isSubmitting"></app-loading-spinner>

      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-8" *ngIf="!isSubmitting">
        <div class="bg-white dark:bg-neutral-800 rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100 dark:border-neutral-700">
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">Category Name *</label>
              <input type="text" formControlName="name" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all" placeholder="e.g. Italian, Desserts">
              <p class="text-red-500 text-xs mt-2" *ngIf="categoryForm.get('name')?.hasError('required') && categoryForm.get('name')?.touched">Name is required</p>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">Description (Optional)</label>
              <textarea formControlName="description" rows="4" class="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white transition-all resize-none" placeholder="Briefly describe this category..."></textarea>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4">
          <button type="button" routerLink="/categories" class="px-8 py-4 rounded-full font-bold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
            Cancel
          </button>
          <button type="submit" [disabled]="categoryForm.invalid" class="px-10 py-4 rounded-full font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-200 dark:shadow-none flex items-center gap-2">
            <mat-icon class="text-[20px] w-[20px] h-[20px]">{{ isEditMode ? 'save' : 'check' }}</mat-icon>
            {{ isEditMode ? 'Update Category' : 'Create Category' }}
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
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  categoryForm: FormGroup;
  isEditMode = false;
  categoryId?: string;
  isSubmitting = false;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  ngOnInit() {
    this.categoryId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.categoryId && this.route.snapshot.url[0].path === 'edit') {
      this.isEditMode = true;
      this.loadCategory();
    }
  }

  loadCategory() {
    if (!this.categoryId) return;
    this.categoryService.getCategoryById(this.categoryId).subscribe(category => {
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description
      });
      this.cdr.detectChanges(); // Prévenir NG0100
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    this.isSubmitting = true;
    this.cdr.detectChanges(); // Prévenir NG0100
    
    const categoryData = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      this.categoryService.updateCategory(this.categoryId, categoryData).subscribe({
        next: () => {
          this.snackBar.open('Category updated!', 'Close', { duration: 3000 });
          this.router.navigate(['/categories']);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error updating category', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          this.snackBar.open('Category created!', 'Close', { duration: 3000 });
          this.router.navigate(['/categories']);
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error creating category', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
