import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Global } from '../../services/Global';
import { BrandingService } from '../../services/branding.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public articles: any[] = [];
  public loading: boolean = true;
  public loadError: string = '';
  public url: string = Global.url;
  public projectName = 'Proyecto';
  public homeTagline = 'Descubre lo último en tecnología e IA';

  constructor(
    private _articleService: ArticleService,
    private _brandingService: BrandingService
  ) {}

  ngOnInit(): void {
    const branding = this._brandingService.getCurrent();
    this.projectName = `${branding.projectName}-${branding.projectSuffix}`;
    this.homeTagline = branding.homeTagline;

    // Evita que la pantalla quede cargando indefinidamente.
    const loadingTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.loadError = 'No se pudo conectar con el servidor en este tiempo. Verifica que el backend esté corriendo (puerto 4009).';
      }
    }, 25000);

    this._articleService.getArticles().subscribe({
      next: (response) => {
        clearTimeout(loadingTimeout);
        if (response.articles) {
          this.articles = response.articles;
        }
        this.loading = false;
      },
      error: (error) => {
        clearTimeout(loadingTimeout);
        console.error(error);
        this.loading = false;
        this.loadError = 'Error al cargar artículos. Revisa backend/CORS o vuelve a intentar.';
      }
    });
  }
}
