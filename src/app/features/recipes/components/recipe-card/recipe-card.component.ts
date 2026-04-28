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
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
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
