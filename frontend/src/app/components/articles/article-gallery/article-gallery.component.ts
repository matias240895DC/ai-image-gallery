import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Global } from '../../../services/Global';
import { BrandingService, BrandingSettings } from '../../../services/branding.service';

import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './article-gallery.component.html',
  styleUrls: ['./article-gallery.component.css']
})
export class ArticleGalleryComponent implements OnInit, OnDestroy {
  public articles: any[] = [];
  public aiImages: any[] = [];
  public loading: boolean = true;
  public loadingAi: boolean = true;
  public error: boolean = false;
  public errorAi: boolean = false;
  public url: string = Global.url;

  // Pagination & Search
  public page: number = 1;
  public totalPages: number = 1;
  public search: string = '';
  public limit: number = 10;

  // AI Pagination & Search
  public pageAi: number = 1;
  public totalPagesAi: number = 1;
  public searchAi: string = '';
  public limitAi: number = 10;

  public projectTitle: string = 'Proyecto';
  private _brandingSubscription: Subscription | null = null;

  public galleryHeaderSubtitle = '';
  public galleryRecentTitle = '';
  public galleryRecentSubtitle = '';
  public galleryAiTitle = '';
  public galleryAiSubtitle = '';

  constructor(
    public _articleService: ArticleService,
    private _cdr: ChangeDetectorRef,
    private _brandingService: BrandingService
  ) {}

  ngOnInit(): void {
    const applyBranding = (settings: BrandingSettings) => {
      this.projectTitle = `${settings.projectName}-${settings.projectSuffix}`.trim();
      this.galleryHeaderSubtitle = settings.galleryHeaderSubtitle;
      this.galleryRecentTitle = settings.galleryRecentTitle;
      this.galleryRecentSubtitle = settings.galleryRecentSubtitle;
      this.galleryAiTitle = settings.galleryAiTitle;
      this.galleryAiSubtitle = settings.galleryAiSubtitle;
    };

    // Inicializa con el branding actual
    applyBranding(this._brandingService.getCurrent());

    // Actualiza en vivo si el usuario cambia branding desde el admin
    this._brandingSubscription = this._brandingService.settings$.subscribe({
      next: (settings) => applyBranding(settings),
    });

    this.getArticles();
    this.getAiImages();
  }

  ngOnDestroy(): void {
    this._brandingSubscription?.unsubscribe();
  }

  getArticles() {
    this.loading = true;
    this.error = false;
    this._articleService.getArticles(this.page, this.limit, this.search).subscribe({
      next: (response) => {
        if (response && response.articles) {
          this.articles = response.articles;
          this.totalPages = response.totalPages || 1;
        } else {
          this.articles = [];
          this.totalPages = 1;
        }
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('[ArticleGallery] Error articles:', err);
        this.loading = false;
        this.error = true;
        this._cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.page = 1;
    this.getArticles();
  }

  changePage(delta: number) {
    const nextPage = this.page + delta;
    if (nextPage < 1 || nextPage > this.totalPages) return;
    this.page = nextPage;
    this.getArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getAiImages() {
    this.loadingAi = true;
    this.errorAi = false;
    this._articleService.getAiImages(this.pageAi, this.limitAi, this.searchAi).subscribe({
      next: (response) => {
        if (response && response.images) {
          this.aiImages = response.images;
          this.totalPagesAi = response.totalPages || 1;
        } else {
          this.aiImages = [];
          this.totalPagesAi = 1;
        }
        this.loadingAi = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('[ArticleGallery] Error AI:', err);
        this.loadingAi = false;
        this.errorAi = true;
        this._cdr.detectChanges();
      }
    });
  }

  onSearchAi() {
    this.pageAi = 1;
    this.getAiImages();
  }

  changePageAi(delta: number) {
    const nextPage = this.pageAi + delta;
    if (nextPage < 1 || nextPage > this.totalPagesAi) return;
    this.pageAi = nextPage;
    this.getAiImages();
    // No hacemos scroll up aquí para no perder el contexto de la sección AI
  }
}
