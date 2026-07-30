import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline, documentTextOutline, documentOutline, peopleOutline, cubeOutline,
  walletOutline, settingsOutline, sunnyOutline, moonOutline, addOutline, exitOutline,
  addCircleOutline, arrowBackOutline, arrowForwardOutline, arrowDownOutline,
  arrowUpOutline, barcodeOutline, briefcaseOutline, businessOutline, cafeOutline,
  calendarOutline, callOutline, cardOutline, cashOutline, chatboxOutline,
  checkmarkOutline, checkmarkCircleOutline, closeOutline, cloudUploadOutline,
  colorPaletteOutline, createOutline, calculatorOutline, downloadOutline, eyeOutline, flagOutline,
  gridOutline, idCardOutline, imageOutline, locationOutline, lockClosedOutline,
  mailOutline, mapOutline, pencilOutline, personOutline,
  personAddOutline, pricetagOutline, reloadOutline, searchOutline, shareSocialOutline,
  swapHorizontalOutline, textOutline, timeOutline, trashOutline, trendingUpOutline,
} from 'ionicons/icons';

addIcons({
  'home-outline': homeOutline, 'document-text-outline': documentTextOutline,
  'document-outline': documentOutline, 'people-outline': peopleOutline,
  'cube-outline': cubeOutline, 'wallet-outline': walletOutline,
  'settings-outline': settingsOutline, 'sunny-outline': sunnyOutline,
  'moon-outline': moonOutline, 'add-outline': addOutline,
  'add-circle-outline': addCircleOutline, 'arrow-back-outline': arrowBackOutline,
  'arrow-forward-outline': arrowForwardOutline, 'arrow-down-outline': arrowDownOutline,
  'arrow-up-outline': arrowUpOutline, 'barcode-outline': barcodeOutline,
  'briefcase-outline': briefcaseOutline, 'business-outline': businessOutline,
  'cafe-outline': cafeOutline, 'calendar-outline': calendarOutline,
  'call-outline': callOutline, 'card-outline': cardOutline,
  'cash-outline': cashOutline, 'chatbox-outline': chatboxOutline,
  'checkmark-outline': checkmarkOutline, 'checkmark-circle-outline': checkmarkCircleOutline,
  'close-outline': closeOutline, 'cloud-upload-outline': cloudUploadOutline,
  'color-palette-outline': colorPaletteOutline, 'create-outline': createOutline,
  'calculator-outline': calculatorOutline, 'download-outline': downloadOutline,
  'eye-outline': eyeOutline, 'flag-outline': flagOutline,
  'grid-outline': gridOutline, 'id-card-outline': idCardOutline,
  'image-outline': imageOutline, 'location-outline': locationOutline,
  'lock-closed-outline': lockClosedOutline, 'mail-outline': mailOutline,
  'map-outline': mapOutline, 'pencil-outline': pencilOutline,
  'person-outline': personOutline,
  'person-add-outline': personAddOutline, 'pricetag-outline': pricetagOutline,
  'reload-outline': reloadOutline, 'search-outline': searchOutline,
  'share-social-outline': shareSocialOutline, 'swap-horizontal-outline': swapHorizontalOutline,
  'text-outline': textOutline, 'time-outline': timeOutline,
  'trash-outline': trashOutline, 'trending-up-outline': trendingUpOutline,
  'exit-outline': exitOutline,
});

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { MessageService } from 'primeng/api';

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
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: TranslateHttpLoader },
      defaultLanguage: 'fr'
    }),
  ],
  providers: [
    MessageService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
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
