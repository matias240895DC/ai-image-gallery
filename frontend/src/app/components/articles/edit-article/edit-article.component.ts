import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Global } from '../../../services/Global';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.css']
})
export class EditArticleComponent implements OnInit {
  public article: any;
  public status: string | null = null;
  public message: string = '';
  public loadingData: boolean = true;
  public submitting: boolean = false;
  public imageSelected: File | null = null;
  public imagePreview: string | null = null;
  public url: string = Global.url;
  private _id: string = '';

  constructor(
    private _articleService: ArticleService,
    private _authService: AuthService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) {
    this.article = {
      title: '',
      content: ''
    };
  }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this._id = params['id'];
      this.getArticle(this._id);
    });
  }

  getArticle(id: string) {
    this._articleService.getArticle(id).subscribe({
      next: (response) => {
        if (response.article) {
          this.article = response.article;
        }
        this.loadingData = false;
        this._cdr.detectChanges();
      },
      error: (error) => {
        console.error('[EditArticle] Error fetching:', error);
        this.status = 'error';
        this.message = 'No se pudo cargar el artículo';
        this.loadingData = false;
        this._cdr.detectChanges();
      }
    });
  }

  fileChangeEvent(event: any) {
    this.imageSelected = (event.target.files[0] as File);
    if (this.imageSelected) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this._cdr.detectChanges();
      };
      reader.readAsDataURL(this.imageSelected);
    }
  }

  removeImage() {
    this.imageSelected = null;
    this.imagePreview = null;
    this._cdr.detectChanges();
  }

  goBack() {
    this._router.navigate(['/manage-articles']);
  }

  onSubmit() {
    this.submitting = true;
    const token = this._authService.getToken();
    if (!token) return;

    let articleToSave;
    if (this.imageSelected) {
      articleToSave = new FormData();
      articleToSave.append('title', this.article.title);
      articleToSave.append('content', this.article.content);
      articleToSave.append('image', this.imageSelected, this.imageSelected.name);
    } else {
      articleToSave = {
          title: this.article.title,
          content: this.article.content
      };
    }

    this._articleService.updateArticle(this._id, articleToSave, token).subscribe({
      next: (response) => {
        if (response.article) {
          this.status = 'success';
          this._cdr.detectChanges();
          setTimeout(() => this._router.navigate(['/manage-articles']), 1500);
        }
      },
      error: (error) => {
        this.status = 'error';
        this.message = error.error.message || 'Error al actualizar el artículo';
        this.submitting = false;
        this._cdr.detectChanges();
        console.error('[EditArticle] Error updating:', error);
      }
    });
  }
}
