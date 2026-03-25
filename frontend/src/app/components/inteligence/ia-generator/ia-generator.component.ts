import { Component, ChangeDetectorRef } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ia-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ia-generator.component.html',
  styleUrls: ['./ia-generator.component.css']
})
export class IaGeneratorComponent {
  public prompt: string = '';
  public loading: boolean = false;
  public imageUrl: SafeUrl | null = null; // Cambio a SafeUrl
  public error: string | null = null;
  public waitingMessage: string = 'Nuestra IA está trabajando en tu creación...';
  public showTimerHint: boolean = false;
  private _waitInterval: any;

  constructor(
    private _articleService: ArticleService,
    private _authService: AuthService,
    private _sanitizer: DomSanitizer,
    private _cdr: ChangeDetectorRef
  ) {}

  generate() {
    this.loading = true;
    this.imageUrl = null;
    this.error = null;
    this.waitingMessage = 'Iniciando conexión con la IA...';
    this.showTimerHint = false;

    // Intervalo para cambiar el mensaje y dar feedback al usuario
    let seconds = 0;
    this._waitInterval = setInterval(() => {
      seconds += 1;
      if (seconds === 5) this.waitingMessage = 'Analizando tu prompt...';
      if (seconds === 10) this.waitingMessage = 'Generando pinceladas digitales...';
      if (seconds === 20) {
        this.waitingMessage = 'La IA está tardando un poco más de lo habitual...';
        this.showTimerHint = true;
      }
      if (seconds === 40) this.waitingMessage = 'Casi listo, optimizando la imagen...';
    }, 1000);

    const token = this._authService.getToken();
    if (!token) {
      this.loading = false;
      clearInterval(this._waitInterval);
      return;
    }

    this._articleService.generateImage(this.prompt, token).subscribe({
      next: (blob: Blob) => {
        console.log('[Frontend] Imagen recibida con tamaño:', blob.size);
        const objectUrl = URL.createObjectURL(blob);
        this.imageUrl = this._sanitizer.bypassSecurityTrustUrl(objectUrl);
        console.log('[Frontend] imageUrl configurado');
        this.loading = false;
        console.log('[Frontend] loading set to false');
        clearInterval(this._waitInterval);
        this._cdr.detectChanges(); // Forzar actualización de UI
      },
      error: (err) => {
        console.error('[Frontend] Error en la generación:', err);
        this.loading = false;
        clearInterval(this._waitInterval);
        this._cdr.detectChanges();

        if (err.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            try {
              const errorObj = JSON.parse(e.target.result);
              this.error = errorObj.message;
            } catch (pErr) {
              this.error = 'Error inesperado del servidor. Por favor reintenta.';
            }
          };
          reader.readAsText(err.error);
        } else {
          this.error = err.error?.message || 'Error de conexión con el servidor. Inténtalo de nuevo en unos minutos.';
        }
      }
    });
  }
}
