import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { CommonModule } from '@angular/common';
import { Global } from '../../../services/Global';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  public article: any;
  public loading: boolean = true;
  public url: string = Global.url;

  constructor(
    private _route: ActivatedRoute,
    private _articleService: ArticleService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      let id = params['id'];
      this.getArticle(id);
    });
  }

  getArticle(id: string) {
    this._articleService.getArticle(id).subscribe({
      next: (response) => {
        if (response.article) {
          this.article = response.article;
        }
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }
}
