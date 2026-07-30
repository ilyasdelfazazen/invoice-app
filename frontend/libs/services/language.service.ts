import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'fr' | 'en' | 'ar' | 'nl';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(private translate: TranslateService) {}

  init(): void {
    const saved = (localStorage.getItem('lang') as Lang) || 'fr';
    this.setLanguage(saved);
  }

  setLanguage(lang: Lang): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  getCurrentLang(): Lang {
    return (localStorage.getItem('lang') as Lang) || 'fr';
  }
}
