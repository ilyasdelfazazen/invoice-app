import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
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

  readonly appStoreUrl = 'https://apps.apple.com/app/id000000000';

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
    private appService: ApplicationService,
    private authService: AuthService,
    public langService: LanguageService,
    public themeService: ThemeService,
    private messageService: MessageService,
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

  saveApp(): void {
    if (this.appForm.invalid) { this.appForm.markAllAsTouched(); return; }
    this.savingApp = true;
    this.appService.updateSettings(this.appForm.value).subscribe({
      next: () => {
        this.savingApp = false;
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Informations société mises à jour', life: 3000 });
      },
      error: (err: any) => {
        this.savingApp = false;
        const detail = err?.error?.message || 'Erreur lors de la sauvegarde';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 4000 });
      }
    });
  }

  changePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.passwordForm.get('confirmPassword')?.setErrors({ mismatch: true });
      return;
    }
    this.savingPassword = true;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.savingPassword = false;
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Mot de passe mis à jour', life: 3000 });
      },
      error: (err: any) => {
        this.savingPassword = false;
        const detail = err?.error?.message || 'Mot de passe actuel incorrect';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 4000 });
      }
    });
  }

  setLanguage(lang: Lang): void {
    this.currentLang = lang;
    this.langService.setLanguage(lang);
  }

  toggleDark(): void {
    this.themeService.toggleDark();
    this.isDark = this.themeService.isDark();
  }
}
