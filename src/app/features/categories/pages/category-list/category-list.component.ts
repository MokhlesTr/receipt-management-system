import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
            <span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Manage
          </span>
          <h1 class="text-3xl font-bold font-display text-slate-900 dark:text-white">Categories</h1>
        </div>
        <a routerLink="/categories/new" class="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors shadow-sm">
          <mat-icon class="text-[20px] w-[20px] h-[20px]">add</mat-icon> Add Category
        </a>
      </div>

      <app-loading-spinner [loading]="isLoading"></app-loading-spinner>

      <!-- Content -->
      <div *ngIf="!isLoading" class="bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border border-slate-100 dark:border-neutral-700 overflow-hidden">
        <div *ngIf="categories.length === 0" class="p-16 text-center">
          <div class="w-20 h-20 bg-slate-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-4xl text-slate-400">category</mat-icon>
          </div>
          <h3 class="text-xl font-bold font-display text-slate-900 dark:text-white mb-2">No categories yet</h3>
          <p class="text-slate-500">Create your first category to start organizing recipes.</p>
        </div>

        <div *ngIf="categories.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-neutral-900/50 border-b border-slate-200 dark:border-neutral-700">
                <th class="py-4 px-6 font-display font-semibold text-slate-900 dark:text-white">Name</th>
                <th class="py-4 px-6 font-display font-semibold text-slate-900 dark:text-white">Description</th>
                <th class="py-4 px-6 font-display font-semibold text-slate-900 dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categories; let last = last" [class.border-b]="!last" class="border-slate-100 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                <td class="py-4 px-6 font-semibold text-slate-900 dark:text-white">{{ cat.name }}</td>
                <td class="py-4 px-6 text-slate-500 dark:text-neutral-400">{{ cat.description }}</td>
                <td class="py-4 px-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button *ngIf="cat._id" [routerLink]="['/categories/edit', cat._id]" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-orange-100 hover:text-orange-600 transition-colors flex items-center justify-center">
                      <mat-icon class="text-[18px] w-[18px] h-[18px]">edit</mat-icon>
                    </button>
                    <button *ngIf="cat._id" (click)="deleteCategory(cat._id)" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center">
                      <mat-icon class="text-[18px] w-[18px] h-[18px]">delete</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  isLoading = true;
  displayedColumns: string[] = ['name', 'description', 'actions'];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteCategory(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Deleting this category might affect recipes using it!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(id).subscribe({
          next: () => {
            this.categories = this.categories.filter(c => c._id !== id);
            this.cdr.detectChanges();
            Swal.fire('Deleted!', 'Category has been deleted.', 'success');
          },
          error: () => this.snackBar.open('Error deleting category', 'Close', { duration: 3000 })
        });
      }
    });
  }
}
