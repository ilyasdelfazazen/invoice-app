import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Application } from '../../../../../../libs/models/application.model';
import { ApplicationService } from '../../../../../../libs/services/application.service';
import { AuthService } from '../../../../../../libs/services/auth.service';
import { LanguageService, Lang } from '../../../../../../libs/services/language.service';
import { ThemeService } from '../../../../../../libs/services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  appForm!: FormGroup;
  passwordForm!: FormGroup;
  savingApp = false;
  savingPassword = false;
  isDark = false;
  currentLang: Lang = 'fr';
  activeTab = 'company';

  logoPreview: string | null = null;

  languages: { label: string; value: Lang; flag: string }[] = [
    { label: 'Français',   value: 'fr', flag: 'fr' },
    { label: 'English',    value: 'en', flag: 'gb' },
    { label: 'العربية',    value: 'ar', flag: 'sa' },
    { label: 'Nederlands', value: 'nl', flag: 'nl' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appService: ApplicationService,
    private authService: AuthService,
    public langService: LanguageService,
    public themeService: ThemeService,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    const app = this.route.snapshot.data['app'] as Application;
    this.isDark = this.themeService.isDark();
    this.currentLang = this.langService.getCurrentLang();
    this.logoPreview = app.logo || null;

    this.appForm = this.fb.group({
      name:      [app.name,      Validators.required],
      logo:      [app.logo      ?? ''],
      telephone: [app.telephone ?? ''],
      email:     [app.email     ?? '', Validators.email],
      address:   [app.address   ?? ''],
      ice:       [app.ice       ?? ''],
      rc:        [app.rc        ?? ''],
      if:        [app.if        ?? ''],
      cnss:      [app.cnss      ?? ''],
      tp:        [app.tp        ?? ''],
      bank_name: [app.bank_name ?? ''],
      bank_rib:  [app.bank_rib  ?? ''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  onLogoSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.logoPreview = base64;
      this.appForm.patchValue({ logo: base64 });
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoPreview = null;
    this.appForm.patchValue({ logo: '' });
  }

  async saveApp(): Promise<void> {
    if (this.appForm.invalid) { this.appForm.markAllAsTouched(); return; }
    this.savingApp = true;
    this.appService.updateSettings(this.appForm.value).subscribe({
      next: async () => {
        this.savingApp = false;
        const t = await this.toast.create({ message: 'Informations société mises à jour', duration: 3000, color: 'success' });
        t.present();
      },
      error: async (err: any) => {
        this.savingApp = false;
        const t = await this.toast.create({ message: err?.error?.message || 'Erreur lors de la sauvegarde', duration: 4000, color: 'danger' });
        t.present();
      }
    });
  }

  async changePassword(): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.passwordForm.get('confirmPassword')?.setErrors({ mismatch: true });
      return;
    }
    this.savingPassword = true;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: async () => {
        this.passwordForm.reset();
        this.savingPassword = false;
        const t = await this.toast.create({ message: 'Mot de passe mis à jour', duration: 3000, color: 'success' });
        t.present();
      },
      error: async (err: any) => {
        this.savingPassword = false;
        const t = await this.toast.create({ message: err?.error?.message || 'Mot de passe actuel incorrect', duration: 4000, color: 'danger' });
        t.present();
      }
    });
  }

  setLanguage(lang: Lang): void {
    this.currentLang = lang;
    this.langService.setLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDark(): void {
    this.themeService.toggleDark();
    this.isDark = this.themeService.isDark();
  }
}
