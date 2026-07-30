import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { InvoiceDetailComponent } from './invoice-detail.component';
import { InvoiceDetailResolver } from '../../../../../../../libs/resolvers/invoice-detail.resolver';

const routes: Routes = [
  {
    path: '',
    component: InvoiceDetailComponent,
    resolve: { data: InvoiceDetailResolver }
  }
];

@NgModule({
  declarations: [InvoiceDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InvoiceDetailModule {}
