import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BrandingService, BrandingSettings } from '../../services/branding.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="terms-container">
      <header class="terms-header">
        <h1>{{ termsTitle }}</h1>
        <p>{{ termsLastUpdated }}</p>
      </header>

      <main class="terms-content">
        <section>
          <h2>{{ termsSection1Title }}</h2>
          <p>{{ termsSection1Body }}</p>
        </section>

        <section>
          <h2>{{ termsSection2Title }}</h2>
          <p>{{ termsSection2Intro }}</p>
          <ul>
            <li>{{ termsSection2Bullet1 }}</li>
            <li>{{ termsSection2Bullet2 }}</li>
            <li>{{ termsSection2Bullet3 }}</li>
          </ul>
        </section>

        <section>
          <h2>{{ termsSection3Title }}</h2>
          <p [innerHTML]="termsSection3BodyHtml"></p>
        </section>

        <section>
          <h2>{{ termsSection4Title }}</h2>
          <p>{{ termsSection4Body }}</p>
        </section>

        <div class="actions">
          <a routerLink="/gallery" class="btn-back">{{ termsBackText }}</a>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .terms-container {
      max-width: 800px;
      margin: 4rem auto;
      padding: 2rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      color: white;
    }
    .terms-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1rem;
    }
    .terms-header h1 { color: #6366f1; font-size: var(--heading-h1-size, 2rem); }
    .terms-header p { color: #94a3b8; font-size: var(--paragraph-font-size, 0.9rem); }
    section { margin-bottom: 2rem; }
    h2 { color: #f1f5f9; font-size: var(--heading-h2-size, 1.25rem); margin-bottom: 1rem; }
    p, li { color: #cbd5e1; line-height: 1.6; font-size: var(--paragraph-font-size, 16px); }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    .actions { margin-top: 3rem; text-align: center; }
    .btn-back {
      background: #6366f1;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.3s;
    }
    .btn-back:hover { background: #4f46e5; }
  `]
})
export class TermsComponent implements OnInit, OnDestroy {
  private _brandingSubscription: Subscription | null = null;

  public termsTitle = '';
  public termsLastUpdated = '';
  public termsBackText = '';

  public termsSection1Title = '';
  public termsSection1Body = '';

  public termsSection2Title = '';
  public termsSection2Intro = '';
  public termsSection2Bullet1 = '';
  public termsSection2Bullet2 = '';
  public termsSection2Bullet3 = '';

  public termsSection3Title = '';
  public termsSection3BodyHtml = '';

  public termsSection4Title = '';
  public termsSection4Body = '';

  constructor(private _brandingService: BrandingService) {}

  ngOnInit(): void {
    const applyBranding = (settings: BrandingSettings) => {
      this.termsTitle = settings.termsTitle;
      this.termsLastUpdated = settings.termsLastUpdated;
      this.termsBackText = settings.termsBackText;

      this.termsSection1Title = settings.termsSection1Title;
      this.termsSection1Body = settings.termsSection1Body;

      this.termsSection2Title = settings.termsSection2Title;
      this.termsSection2Intro = settings.termsSection2Intro;
      this.termsSection2Bullet1 = settings.termsSection2Bullet1;
      this.termsSection2Bullet2 = settings.termsSection2Bullet2;
      this.termsSection2Bullet3 = settings.termsSection2Bullet3;

      this.termsSection3Title = settings.termsSection3Title;
      this.termsSection3BodyHtml = settings.termsSection3BodyHtml;

      this.termsSection4Title = settings.termsSection4Title;
      this.termsSection4Body = settings.termsSection4Body;
    };

    applyBranding(this._brandingService.getCurrent());
    this._brandingSubscription = this._brandingService.settings$.subscribe({
      next: (settings) => applyBranding(settings),
    });
  }

  ngOnDestroy(): void {
    this._brandingSubscription?.unsubscribe();
  }
}
