import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <a routerLink="/" class="flex items-center gap-2">
              <div class="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
                <mat-icon>restaurant</mat-icon>
              </div>
              <span class="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">Recipe<span class="text-orange-600">Hub</span></span>
            </a>
            
            <nav class="hidden md:flex items-center gap-1">
              <a routerLink="/recipes" routerLinkActive="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" [routerLinkActiveOptions]="{exact: false}" class="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all">Recipes</a>
              <a routerLink="/categories" routerLinkActive="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" class="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all">Categories</a>
            </nav>
          </div>

          <div class="flex items-center gap-4">
            <button (click)="toggleTheme()" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400 transition-colors">
              <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            
            <a routerLink="/recipes/new" class="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-100 dark:shadow-none transform hover:scale-105 active:scale-95">
              <mat-icon class="text-[20px] w-[20px] h-[20px]">add</mat-icon>
              <span>New Recipe</span>
            </a>

            <!-- Mobile Menu Toggle (Simplified) -->
            <button class="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 transition-colors">
              <mat-icon>menu</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class NavbarComponent {
  isDarkMode = document.documentElement.classList.contains('dark');

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark');
  }
}
