import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import api from './api.service';
import { Category } from '../models/category.model';
import { ApiResponse } from '../models/api-response.model';
import { CONFIG } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${CONFIG.apiUrl}/categories`;

  getAllCategories(): Observable<Category[]> {
    return from(api.get<ApiResponse<Category[]>>('/categories')).pipe(
      map(res => res.data.data),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return throwError(() => error);
      })
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return from(api.get<ApiResponse<Category>>(`/categories/${id}`)).pipe(
      map(res => res.data.data)
    );
  }

  createCategory(category: Category): Observable<Category> {
    return from(api.post<ApiResponse<Category>>('/categories', category)).pipe(
      map(res => res.data.data)
    );
  }

  updateCategory(id: string, category: Category): Observable<Category> {
    return from(api.put<ApiResponse<Category>>(`/categories/${id}`, category)).pipe(
      map(res => res.data.data)
    );
  }

  deleteCategory(id: string): Observable<any> {
    return from(api.delete(`/categories/${id}`)).pipe(
      map(res => res.data)
    );
  }
}
