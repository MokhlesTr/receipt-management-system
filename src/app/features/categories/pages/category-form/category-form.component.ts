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
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
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
