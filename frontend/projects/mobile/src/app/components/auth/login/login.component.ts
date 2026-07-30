import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../../../../../libs/services/auth.service';
import { ApplicationService } from '../../../../../../../libs/services/application.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  appLogo = 'assets/defaultImages/logo.png';
  appName = 'Specialty Coffee Equipment';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private appService: ApplicationService,
    private toast: ToastController
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const cached = this.appService.getCachedLogo();
    if (cached) this.appLogo = cached;
    this.appName = this.appService.getCachedName();

    this.appService.getPublicBranding().subscribe({
      next: b => {
        if (b.logo) { this.appLogo = b.logo; localStorage.setItem('app_logo', b.logo); }
        if (b.name) { this.appName = b.name; localStorage.setItem('app_name', b.name); }
      },
      error: () => {}
    });
  }

  get lastLogin(): string | null {
    const raw = this.auth.getLastLogin();
    if (!raw) return null;
    return new Date(raw).toLocaleString();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, password } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: (err) => {
        this.loading = false;
        this.error = err.status === 401 ? 'auth.invalidCredentials' : 'errors.generic';
      }
    });
  }
}
