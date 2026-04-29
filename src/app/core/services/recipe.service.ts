import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import api from './api.service';
import { Recipe } from '../models/recipe.model';
import { ApiResponse } from '../models/api-response.model';
import { CONFIG } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = `${CONFIG.apiUrl}/recipes`;

  getAllRecipes(): Observable<Recipe[]> {
    return from(api.get<ApiResponse<Recipe[]>>('/recipes')).pipe(
      map(res => res.data.data),
      catchError(error => {
        console.error('Error fetching recipes:', error);
        return throwError(() => error);
      })
    );
  }

  getRecipeById(id: string): Observable<Recipe> {
    return from(api.get<ApiResponse<Recipe>>(`/recipes/${id}`)).pipe(
      map(res => res.data.data)
    );
  }

  createRecipe(recipe: Recipe): Observable<Recipe> {
    return from(api.post<ApiResponse<Recipe>>('/recipes', recipe)).pipe(
      map(res => res.data.data)
    );
  }

  updateRecipe(id: string, recipe: Recipe): Observable<Recipe> {
    return from(api.put<ApiResponse<Recipe>>(`/recipes/${id}`, recipe)).pipe(
      map(res => res.data.data)
    );
  }

  deleteRecipe(id: string): Observable<any> {
    return from(api.delete(`/recipes/${id}`)).pipe(
      map(res => res.data)
    );
  }

  searchRecipes(name: string): Observable<Recipe[]> {
    return from(api.get<ApiResponse<Recipe[]>>('/recipes/search', { params: { name } })).pipe(
      map(res => res.data.data)
    );
  }

  filterRecipes(category?: string, difficulty?: string): Observable<Recipe[]> {
    const params: any = {};
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    return from(api.get<ApiResponse<Recipe[]>>('/recipes', { params })).pipe(
      map(res => res.data.data)
    );
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    return from(api.post<{success: boolean, url: string}>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).pipe(
      map(res => {

        const origin = CONFIG.apiUrl.replace('/api', '');
        return origin + res.data.url;
      })
    );
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath || imagePath === 'no-photo.jpg') {
      return 'https://placehold.co/800x600?text=Recipe';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    const origin = CONFIG.apiUrl.replace('/api', '');
    return origin + imagePath;
  }
}
