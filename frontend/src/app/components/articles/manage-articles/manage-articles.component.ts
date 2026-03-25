import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { AppNavAllowedDirective } from '../../../directives/app-nav-allowed.directive';

@Component({
  selector: 'app-manage-articles',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AppNavAllowedDirective],
  templateUrl: './manage-articles.component.html',
  styleUrls: ['./manage-articles.component.css']
})
export class ManageArticlesComponent implements OnInit {
  public articles: any[] = [];
  public loading: boolean = true;
  public error: boolean = false;

  // Pagination & Search
  public page: number = 1;
  public totalPages: number = 1;
  public search: string = '';
  public limit: number = 10;

  constructor(
    private _articleService: ArticleService,
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles() {
    this.loading = true;
    this.error = false;
    const user = this._authService.getUser();
    
    // El ID en el localStorage está bajo la propiedad 'id' según el backend
    const userId = user?.id || user?._id;
    
    if (!userId) {
      this.loading = false;
      return;
    }

    this._articleService.getArticlesByUser(userId, this.page, this.limit, this.search).subscribe({
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
        console.error('[ManageArticles] Error:', err);
        this.loading = false;
        if (err.status === 404) {
          this.articles = [];
          this.totalPages = 1;
          this.error = false;
        } else {
          this.error = true;
        }
        this._cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.page = 1;
    this.loadArticles();
  }

  changePage(delta: number) {
    const nextPage = this.page + delta;
    if (nextPage < 1 || nextPage > this.totalPages) return;
    this.page = nextPage;
    this.loadArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteArticle(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      const token = this._authService.getToken();
      if (!token) return;

      this._articleService.deleteArticle(id, token).subscribe({
        next: () => {
          this.loadArticles();
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar el artículo');
        }
      });
    }
  }
}
