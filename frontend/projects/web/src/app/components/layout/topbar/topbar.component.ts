import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LanguageService, Lang } from '../../../../../../../libs/services/language.service';
import { ThemeService } from '../../../../../../../libs/services/theme.service';

interface LangOption { code: Lang; flag: string; label: string; }

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentPageKey = 'nav.dashboard';

  languages: LangOption[] = [
    { code: 'fr', flag: 'fr', label: 'FR' },
    { code: 'en', flag: 'gb', label: 'EN' },
    { code: 'ar', flag: 'sa', label: 'AR' },
    { code: 'nl', flag: 'nl', label: 'NL' },
  ];

  private routeTitleMap: Record<string, string> = {
    '/dashboard':   'nav.dashboard',
    '/invoices':    'nav.invoices',
    '/clients':     'nav.clients',
    '/products':    'nav.products',
    '/operations':  'nav.operations',
    '/settings':    'nav.settings',
  };

  constructor(
    public lang: LanguageService,
    public theme: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setTitle(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.setTitle(e.urlAfterRedirects));
  }

  private setTitle(url: string): void {
    const match = Object.keys(this.routeTitleMap)
      .sort((a, b) => b.length - a.length)
      .find(k => url.startsWith(k));
    this.currentPageKey = match ? this.routeTitleMap[match] : 'nav.dashboard';
  }

  setLang(code: Lang): void {
    this.lang.setLanguage(code);
  }

}
