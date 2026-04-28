import { Category } from './category.model';

export interface Recipe {
  _id?: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  preparationTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image?: string;
  category: Category | string;
  createdAt?: Date;
  updatedAt?: Date;
}
