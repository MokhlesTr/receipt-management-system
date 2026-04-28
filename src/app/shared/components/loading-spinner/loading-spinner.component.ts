import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="loader-overlay" *ngIf="loading">
      <div class="loader-content">
        <div class="pan-loader">
          <div class="pan"></div>
          <div class="pan-handle"></div>
          <div class="egg"></div>
        </div>
        <div class="loader-text">
          <span class="text-slate-900 dark:text-white font-bold font-display text-xl">Preparing something delicious...</span>
          <div class="dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem 2rem;
      width: 100%;
    }
    .loader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }
    .pan-loader {
      position: relative;
      width: 120px;
      height: 120px;
    }
    .pan {
      position: absolute;
      bottom: 20px;
      width: 80px;
      height: 15px;
      background: #334155;
      border-radius: 0 0 15px 15px;
      animation: pan-flip 1.5s infinite ease-in-out;
    }
    .pan-handle {
      position: absolute;
      bottom: 25px;
      left: 75px;
      width: 40px;
      height: 8px;
      background: #334155;
      border-radius: 4px;
      transform-origin: left center;
      animation: pan-flip 1.5s infinite ease-in-out;
    }
    .egg {
      position: absolute;
      bottom: 35px;
      left: 20px;
      width: 25px;
      height: 25px;
      background: #fbbf24;
      border-radius: 50%;
      box-shadow: 0 0 0 8px #f8fafc;
      animation: egg-toss 1.5s infinite ease-in-out;
    }
    .dark .egg { box-shadow: 0 0 0 8px #171717; }
    .dark .pan, .dark .pan-handle { background: #64748b; }

    @keyframes pan-flip {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-10deg) translateY(10px); }
    }

    @keyframes egg-toss {
      0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
      50% { transform: translateY(-60px) scale(0.9) rotate(180deg); opacity: 0.8; }
    }

    .loader-text {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .dots span {
      animation: dot-blink 1.4s infinite both;
      font-size: 1.5rem;
      font-weight: bold;
      color: #ea580c;
    }
    .dots span:nth-child(2) { animation-delay: 0.2s; }
    .dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes dot-blink {
      0%, 80%, 100% { opacity: 0; }
      40% { opacity: 1; }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() loading: boolean = false;
}
