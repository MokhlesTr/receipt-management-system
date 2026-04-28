import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Recipe } from '../../../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <mat-card class="recipe-card h-100">
      <img mat-card-image [src]="getRecipeImage()" [alt]="recipe.name" class="recipe-image">
      <mat-card-header>
        <mat-card-title>{{ recipe.name }}</mat-card-title>
        <mat-card-subtitle>{{ getCategoryName() }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="recipe-info">
          <span><mat-icon inline>schedule</mat-icon> {{ recipe.preparationTime }} min</span>
          <span [class]="'difficulty ' + recipe.difficulty.toLowerCase()">{{ recipe.difficulty }}</span>
        </div>
        <p class="description">{{ recipe.description | slice:0:100 }}{{ recipe.description.length > 100 ? '...' : '' }}</p>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button color="primary" [routerLink]="['/recipes', recipe._id]">VIEW</button>
        <button mat-icon-button color="accent" [routerLink]="['/recipes/edit', recipe._id]" title="Edit">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button color="warn" (click)="onDelete()" title="Delete">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .recipe-card {
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      border-radius: var(--border-radius-lg);
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: var(--glass-border);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      margin-bottom: 1rem;
    }
    .recipe-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: var(--shadow-lg);
      border: 1px solid rgba(255, 87, 34, 0.3);
    }
    .recipe-image {
      height: 220px;
      object-fit: cover;
      transition: transform 0.6s ease;
    }
    .recipe-card:hover .recipe-image {
      transform: scale(1.08);
    }
    mat-card-header {
      padding-top: 1.5rem;
    }
    mat-card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }
    mat-card-subtitle {
      color: var(--primary-color);
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .recipe-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1.25rem 0;
      font-size: 0.95rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .recipe-info mat-icon {
      vertical-align: middle;
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      margin-right: 4px;
      color: var(--primary-color);
    }
    .difficulty {
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }
    .easy { background: rgba(76, 175, 80, 0.1); color: #2e7d32; border: 1px solid rgba(76, 175, 80, 0.2); }
    .medium { background: rgba(255, 152, 0, 0.1); color: #e65100; border: 1px solid rgba(255, 152, 0, 0.2); }
    .hard { background: rgba(244, 67, 54, 0.1); color: #c62828; border: 1px solid rgba(244, 67, 54, 0.2); }
    .description {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }
    mat-card-content {
      flex-grow: 1;
    }
    mat-card-actions {
      padding: 8px 16px 16px;
      background: rgba(255,255,255,0.4);
      border-top: 1px solid rgba(0,0,0,0.04);
    }
  `]
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recipe;
  @Output() delete = new EventEmitter<string>();

  getCategoryName(): string {
    if (this.recipe.category && typeof this.recipe.category === 'object') {
      return this.recipe.category.name;
    }
    return 'Uncategorized';
  }

  getRecipeImage(): string {
    if (!this.recipe.image || this.recipe.image === 'no-photo.jpg') {
      return 'https://placehold.co/600x400?text=Recipe+Image';
    }
    return this.recipe.image;
  }

  onDelete() {
    if (this.recipe._id) {
      this.delete.emit(this.recipe._id);
    }
  }
}
