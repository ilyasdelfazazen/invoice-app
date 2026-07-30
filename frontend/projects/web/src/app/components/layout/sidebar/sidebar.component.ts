import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../../libs/services/auth.service';
import { ApplicationService } from '../../../../../../../libs/services/application.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;

  appLogo = 'assets/defaultImages/logo.png';
  appName = 'SCE';

  navItems: NavItem[] = [
    { label: 'nav.dashboard',  icon: 'pi pi-home',      route: '/dashboard' },
    { label: 'nav.invoices',   icon: 'pi pi-file-edit', route: '/invoices' },
    { label: 'nav.clients',    icon: 'pi pi-users',     route: '/clients' },
    { label: 'nav.products',   icon: 'pi pi-box',       route: '/products' },
    { label: 'nav.operations', icon: 'pi pi-wallet',    route: '/operations' },
    { label: 'nav.settings',   icon: 'pi pi-cog',       route: '/settings' },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private appService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.appLogo = this.appService.getCachedLogo() ?? 'assets/defaultImages/logo.png';
    this.appName = this.appService.getCachedName();
    this.appService.getSettings().subscribe(app => {
      this.appLogo = app.logo || 'assets/defaultImages/logo.png';
      this.appName = app.name || 'SCE';
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
