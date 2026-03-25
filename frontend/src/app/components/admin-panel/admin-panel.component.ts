import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BrandingService, BrandingSettings } from '../../services/branding.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  public activeTab: 'logs' | 'users' | 'content' | 'branding' = 'logs';
  public logs: any[] = [];
  public users: any[] = [];
  public adminArticles: any[] = [];
  public adminAiImages: any[] = [];
  public isLoadingLogs = false;
  public isLoadingUsers = false;
  public isLoadingAdminArticles = false;
  public isLoadingAdminAiImages = false;
  public errorMsg = '';

  // Pagination & Search
  public logsPage = 1;
  public logsLimit = 10;
  public logsTotalPages = 1;
  public logsSearch = '';
  public logsStatusFilter: 'all' | 'allowed' | 'denied' = 'all';

  public usersPage = 1;
  public usersLimit = 10;
  public usersTotalPages = 1;
  public usersSearch = '';
  public contentArticlesPage = 1;
  public contentArticlesLimit = 10;
  public contentArticlesTotalPages = 1;
  public contentArticlesSearch = '';
  public contentAiPage = 1;
  public contentAiLimit = 10;
  public contentAiTotalPages = 1;
  public contentAiSearch = '';
  public branding: BrandingSettings = {
    projectName: 'Proyecto',
    projectSuffix: '1',
    homeTagline: 'Explora artículos y contenido de IA',
    logoDataUrl: '',
    primaryColor: '#6366f1',
    accentColor: '#f43f5e',
    backgroundColor: '#0b1120',
    titleFontSizePx: 28,
    paragraphFontSizePx: 16,

    galleryHeaderSubtitle: 'Explora nuestras colecciones de artículos y arte digital',
    galleryRecentTitle: 'Artículos Recientes',
    galleryRecentSubtitle: 'Lo último en nuestra biblioteca de conocimientos',
    galleryAiTitle: 'Arte IA',
    galleryAiSubtitle: 'Creaciones abstractas generadas con inteligencia artificial',

    termsTitle: 'Términos y Condiciones de Uso',
    termsLastUpdated: 'Última actualización: 23 de marzo de 2026',
    termsBackText: 'Volver a la Galería',

    termsSection1Title: '1. Aceptación de los Términos',
    termsSection1Body:
      'Al acceder y utilizar este sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso.',
    termsSection2Title: '2. Uso del Generador de Imágenes IA',
    termsSection2Intro:
      'Nuestra herramienta de IA está diseñada para fines creativos. Queda terminantemente prohibido:',
    termsSection2Bullet1: 'Generar contenido violento, pornográfico o de odio.',
    termsSection2Bullet2: 'Utilizar prompts que vulneren la privacidad de terceros.',
    termsSection2Bullet3: 'Intentar saltarse los filtros de seguridad del sistema.',
    termsSection3Title: '3. Suspensión de Cuenta',
    termsSection3BodyHtml:
      '<strong>IMPORTANTE:</strong> El uso inapropiado del sistema, especialmente del generador de IA, puede resultar en la <strong>desactivación inmediata</strong> de su cuenta por parte de un administrador sin previo aviso.',
    termsSection4Title: '4. Propiedad Intelectual',
    termsSection4Body:
      'Los artículos y contenidos creados por los usuarios son responsabilidad de los mismos. La plataforma se reserva el derecho de eliminar cualquier contenido que infrinja leyes vigentes.',
  };
  public brandingSaved = false;

  constructor(
    private _authService: AuthService,
    private _brandingService: BrandingService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.branding = { ...this._brandingService.getCurrent() };
    this.loadLogs();
  }

  setTab(tab: 'logs' | 'users' | 'content' | 'branding') {
    this.activeTab = tab;
    if (tab === 'logs' && this.logs.length === 0) this.loadLogs();
    if (tab === 'users' && this.users.length === 0) this.loadUsers();
    if (tab === 'content' && this.adminArticles.length === 0) this.loadAdminArticles();
    if (tab === 'content' && this.adminAiImages.length === 0) this.loadAdminAiImages();
  }

  loadLogs() {
    this.isLoadingLogs = true;
    this.errorMsg = '';
    this._authService.getSecurityLogs(
      this.logsPage,
      this.logsLimit,
      this.logsSearch,
      this.logsStatusFilter === 'all' ? '' : this.logsStatusFilter
    ).subscribe({
      next: (res: any) => {
        this.logs = res.logs || [];
        this.logsTotalPages = res.totalPages || 1;
        this.isLoadingLogs = false;
        this._cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Error al cargar los logs.';
        this.isLoadingLogs = false;
        this._cdr.detectChanges();
      }
    });
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.errorMsg = '';
    this._authService.getUsers(this.usersPage, this.usersLimit, this.usersSearch).subscribe({
      next: (res: any) => {
        this.users = res.users || [];
        this.usersTotalPages = res.totalPages || 1;
        this.isLoadingUsers = false;
        this._cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Error al cargar los usuarios.';
        this.isLoadingUsers = false;
        this._cdr.detectChanges();
      }
    });
  }

  onSearchLogs() {
    this.logsPage = 1;
    this.loadLogs();
  }

  onLogsStatusFilterChange() {
    this.logsPage = 1;
    this.loadLogs();
  }

  onSearchUsers() {
    this.usersPage = 1;
    this.loadUsers();
  }

  changeLogsPage(delta: number) {
    this.logsPage += delta;
    this.loadLogs();
  }

  changeUsersPage(delta: number) {
    this.usersPage += delta;
    this.loadUsers();
  }

  loadAdminArticles() {
    this.isLoadingAdminArticles = true;
    this._authService.getAdminArticles(
      this.contentArticlesPage,
      this.contentArticlesLimit,
      this.contentArticlesSearch,
    ).subscribe({
      next: (res: any) => {
        this.adminArticles = res.articles || [];
        this.contentArticlesTotalPages = res.totalPages || 1;
        this.isLoadingAdminArticles = false;
        this._cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Error al cargar contenido de artículos.';
        this.isLoadingAdminArticles = false;
        this._cdr.detectChanges();
      },
    });
  }

  loadAdminAiImages() {
    this.isLoadingAdminAiImages = true;
    this._authService.getAdminAiImages(
      this.contentAiPage,
      this.contentAiLimit,
      this.contentAiSearch,
    ).subscribe({
      next: (res: any) => {
        this.adminAiImages = res.images || [];
        this.contentAiTotalPages = res.totalPages || 1;
        this.isLoadingAdminAiImages = false;
        this._cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Error al cargar contenido IA.';
        this.isLoadingAdminAiImages = false;
        this._cdr.detectChanges();
      },
    });
  }

  onSearchAdminArticles() {
    this.contentArticlesPage = 1;
    this.loadAdminArticles();
  }

  onSearchAdminAiImages() {
    this.contentAiPage = 1;
    this.loadAdminAiImages();
  }

  changeAdminArticlesPage(delta: number) {
    this.contentArticlesPage += delta;
    this.loadAdminArticles();
  }

  changeAdminAiPage(delta: number) {
    this.contentAiPage += delta;
    this.loadAdminAiImages();
  }

  saveBranding() {
    this.branding.projectName = this.branding.projectName?.trim() || 'Proyecto';
    this.branding.projectSuffix = this.branding.projectSuffix?.trim() || '1';
    this.branding.homeTagline = this.branding.homeTagline?.trim() || 'Explora artículos y contenido de IA';
    this.branding.titleFontSizePx = Math.max(12, Math.round(Number(this.branding.titleFontSizePx) || 28));
    this.branding.paragraphFontSizePx = Math.max(12, Math.round(Number(this.branding.paragraphFontSizePx) || 16));

    this._brandingService.update({ ...this.branding });
    this.brandingSaved = true;
    setTimeout(() => {
      this.brandingSaved = false;
      this._cdr.detectChanges();
    }, 2000);
  }

  resetBranding() {
    this._brandingService.reset();
    this.branding = { ...this._brandingService.getCurrent() };
  }

  onLogoChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files && target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'El logo debe ser una imagen.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.branding.logoDataUrl = String(reader.result || '');
      this.errorMsg = '';
      this._cdr.detectChanges();
    };
    reader.onerror = () => {
      this.errorMsg = 'No se pudo leer el archivo del logo.';
      this._cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  clearLogo() {
    this.branding.logoDataUrl = '';
  }

  toggleRole(u: any) {
    const newRole = u.role === 'superadmin' ? 'user' : 'superadmin';
    this._authService.updateUserRole(u._id, newRole).subscribe({
      next: (res: any) => {
        u.role = res.user.role;
        this._cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Error al cambiar el rol';
        this._cdr.detectChanges();
      }
    });
  }

  toggleStatus(u: any) {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    this._authService.updateUserStatus(u._id, newStatus).subscribe({
      next: (res: any) => {
        u.status = res.user.status;
        this._cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Error al cambiar el estado';
        this._cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'allowed' ? 'status-badge status-allowed' : 'status-badge status-denied';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-AR');
  }

  truncate(text: string, max = 80): string {
    return text && text.length > max ? text.substring(0, max) + '…' : text;
  }
}
