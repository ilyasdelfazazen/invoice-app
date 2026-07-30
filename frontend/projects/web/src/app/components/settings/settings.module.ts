import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SettingsComponent } from './settings.component';
import { ApplicationResolver } from '../../../../../../libs/resolvers/application.resolver';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    resolve: { app: ApplicationResolver }
  }
];

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule, InputTextModule, PasswordModule, DividerModule, ToggleButtonModule, TabViewModule, ToastModule,
  ],
  providers: [MessageService],
})
export class SettingsModule {}
