import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ClientDetailComponent } from './client-detail.component';

const routes: Routes = [{ path: '', component: ClientDetailComponent }];

@NgModule({
  declarations: [ClientDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ButtonModule, CardModule, DividerModule,
  ]
})
export class ClientDetailModule {}
