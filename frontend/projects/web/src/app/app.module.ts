import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { PaginatorModule } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepsModule } from 'primeng/steps';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AuthInterceptor } from '../../../../libs/interceptors/auth.interceptor';
import { ErrorInterceptor } from '../../../../libs/interceptors/error.interceptor';
import { LanguageService } from '../../../../libs/services/language.service';
import { ThemeService } from '../../../../libs/services/theme.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

export function initApp(lang: LanguageService, theme: ThemeService): () => void {
  return () => {
    lang.init();
    theme.init();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: TranslateHttpLoader },
      defaultLanguage: 'fr'
    }),
    TableModule, ButtonModule, InputTextModule, DropdownModule, MultiSelectModule,
    CalendarModule, DialogModule, ConfirmDialogModule, ToastModule, SkeletonModule,
    ChartModule, PaginatorModule, CardModule, BadgeModule, TagModule,
    ToggleButtonModule, InputNumberModule, InputTextareaModule, SelectButtonModule,
    StepsModule, PanelModule, DividerModule, AutoCompleteModule,
  ],
  providers: [
    MessageService,
    ConfirmationService,
    ...provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [LanguageService, ThemeService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
