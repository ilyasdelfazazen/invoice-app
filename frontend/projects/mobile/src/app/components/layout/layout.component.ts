import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ActionSheetController } from '@ionic/angular';
import { AuthService } from '../../../../../../libs/services/auth.service';
import { ApplicationService } from '../../../../../../libs/services/application.service';
import { LanguageService, Lang } from '../../../../../../libs/services/language.service';
import { ThemeService } from '../../../../../../libs/services/theme.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  currentPageKey = 'nav.dashboard';
  appLogo: string | null = null;
  appName = 'SCE';

  private routeTitleMap: Record<string, string> = {
    '/dashboard':   'nav.dashboard',
    '/invoices':    'nav.invoices',
    '/clients':     'nav.clients',
    '/products':    'nav.products',
    '/operations':  'nav.operations',
    '/settings':    'nav.settings',
  };

  languages: { code: Lang; flag: string; label: string }[] = [
    { code: 'fr', flag: 'fr', label: 'FR' },
    { code: 'en', flag: 'gb', label: 'EN' },
    { code: 'ar', flag: 'sa', label: 'AR' },
    { code: 'nl', flag: 'nl', label: 'NL' },
  ];

  get currentFlag(): string {
    const l = this.languages.find(x => x.code === this.lang.getCurrentLang());
    return l ? `/assets/flags/${l.flag}.svg` : '/assets/flags/fr.svg';
  }

  constructor(
    private auth: AuthService,
    private router: Router,
    private appService: ApplicationService,
    private actionSheet: ActionSheetController,
    public lang: LanguageService,
    public theme: ThemeService
  ) {}

  ngOnInit(): void {
    this.appLogo = this.appService.getCachedLogo();
    this.appName = this.appService.getCachedName();
    this.appService.getSettings().subscribe(app => {
      this.appLogo = app.logo || null;
      this.appName = app.name || 'SCE';
    });

    this.setTitle(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
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

  async openLangPicker(): Promise<void> {
    const sheet = await this.actionSheet.create({
      buttons: this.languages.map(l => ({
        text: l.label,
        icon: `/assets/flags/${l.flag}.svg`,
        cssClass: l.code === this.lang.getCurrentLang() ? 'lang-active' : '',
        handler: () => this.setLang(l.code),
      })),
    });
    await sheet.present();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
