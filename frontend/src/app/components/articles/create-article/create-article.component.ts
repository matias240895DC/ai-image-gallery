import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-article.component.html',
  styleUrls: ['./create-article.component.css']
})
export class CreateArticleComponent {
  public article: any;
  public status: string | null = null;
  public message: string = '';
  public submitting: boolean = false;
  public imageSelected: File | null = null;
  public imagePreview: string | null = null;

  constructor(
    private _articleService: ArticleService,
    private _authService: AuthService,
    private _router: Router
  ) {
    this.article = {
      title: '',
      content: ''
    };
  }

  fileChangeEvent(event: any) {
    this.imageSelected = (event.target.files[0] as File);
    if (this.imageSelected) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(this.imageSelected);
    }
  }

  removeImage() {
    this.imageSelected = null;
    this.imagePreview = null;
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
      articleToSave = this.article;
    }

    this._articleService.createArticle(articleToSave, token).subscribe({
      next: (response) => {
        if (response.article) {
          this.status = 'success';
          setTimeout(() => this._router.navigate(['/gallery']), 2000);
        }
      },
      error: (error) => {
        this.status = 'error';
        // Parsear errores del backend (pueden ser un objeto de validaciones o un {message: ""})
        if (error.error.title) {
          this.message = error.error.title;
        } else if (error.error.content) {
          this.message = error.error.content;
        } else {
          this.message = error.error.message || 'Error al crear el artículo';
        }
        this.submitting = false;
        console.error('[CreateArticle] Error:', error);
      }
    });
  }
}
