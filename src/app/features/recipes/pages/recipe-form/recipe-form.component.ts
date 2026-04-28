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
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss',
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
