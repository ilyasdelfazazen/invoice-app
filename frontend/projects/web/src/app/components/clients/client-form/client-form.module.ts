import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { ClientFormComponent } from './client-form.component';

const routes: Routes = [{ path: '', component: ClientFormComponent }];

@NgModule({
  declarations: [ClientFormComponent],
  imports: [
    CommonModule, ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ButtonModule, InputTextModule, PanelModule, DividerModule,
  ]
})
export class ClientFormModule {}
