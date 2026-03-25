import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BrandingSettings {
  projectName: string;
  projectSuffix: string;
  homeTagline: string;
  logoDataUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  titleFontSizePx: number; // Tamaño base para h1 (h2/h3 se derivan)
  paragraphFontSizePx: number;

  // Textos principales de la Galería
  galleryHeaderSubtitle: string;
  galleryRecentTitle: string;
  galleryRecentSubtitle: string;
  galleryAiTitle: string;
  galleryAiSubtitle: string;

  // Textos de Términos y Condiciones
  termsTitle: string;
  termsLastUpdated: string;
  termsBackText: string;
  termsSection1Title: string;
  termsSection1Body: string;
  termsSection2Title: string;
  termsSection2Intro: string;
  termsSection2Bullet1: string;
  termsSection2Bullet2: string;
  termsSection2Bullet3: string;
  termsSection3Title: string;
  termsSection3BodyHtml: string;
  termsSection4Title: string;
  termsSection4Body: string;
}

const BRANDING_STORAGE_KEY = 'brandingSettings';

const DEFAULT_BRANDING: BrandingSettings = {
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

@Injectable({
  providedIn: 'root',
})
export class BrandingService {
  private _settings$ = new BehaviorSubject<BrandingSettings>(DEFAULT_BRANDING);
  public settings$ = this._settings$.asObservable();

  init() {
    const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!saved) {
      this.applyToDocument(DEFAULT_BRANDING);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<BrandingSettings>;
      const merged: BrandingSettings = { ...DEFAULT_BRANDING, ...parsed };
      this._settings$.next(merged);
      this.applyToDocument(merged);
    } catch {
      this._settings$.next(DEFAULT_BRANDING);
      this.applyToDocument(DEFAULT_BRANDING);
    }
  }

  getCurrent(): BrandingSettings {
    return this._settings$.value;
  }

  update(settings: BrandingSettings) {
    this._settings$.next(settings);
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(settings));
    this.applyToDocument(settings);
  }

  reset() {
    this.update(DEFAULT_BRANDING);
  }

  private applyToDocument(settings: BrandingSettings) {
    const root = document.documentElement;
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--primary-hover', this.darkenHex(settings.primaryColor, 0.15));
    root.style.setProperty('--accent', settings.accentColor);
    root.style.setProperty('--bg-dark', settings.backgroundColor);

    const projectTitle = `${settings.projectName}-${settings.projectSuffix}`.trim();
    document.title = projectTitle || 'Proyecto';

    // Titulares (h1/h2/h3) desde un solo valor configurado.
    const h1 = Number(settings.titleFontSizePx) || DEFAULT_BRANDING.titleFontSizePx;
    const h2 = Math.max(12, Math.round(h1 * 0.75));
    const h3 = Math.max(12, Math.round(h1 * 0.6));

    root.style.setProperty('--heading-h1-size', `${h1}px`);
    root.style.setProperty('--heading-h2-size', `${h2}px`);
    root.style.setProperty('--heading-h3-size', `${h3}px`);

    const p = Number(settings.paragraphFontSizePx) || DEFAULT_BRANDING.paragraphFontSizePx;
    root.style.setProperty('--paragraph-font-size', `${p}px`);
  }

  private darkenHex(hex: string, amount: number): string {
    const normalized = hex.replace('#', '');
    const bigint = parseInt(normalized, 16);
    if (Number.isNaN(bigint) || normalized.length !== 6) {
      return '#4f46e5';
    }

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    const darkerR = Math.max(0, Math.floor(r * (1 - amount)));
    const darkerG = Math.max(0, Math.floor(g * (1 - amount)));
    const darkerB = Math.max(0, Math.floor(b * (1 - amount)));

    return `#${[darkerR, darkerG, darkerB]
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')}`;
  }
}
