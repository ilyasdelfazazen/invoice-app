import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { InvoiceStepperComponent } from './invoice-stepper.component';
import { ClientsResolver } from '../../../../../../../libs/resolvers/clients.resolver';
import { ProductsResolver } from '../../../../../../../libs/resolvers/products.resolver';

const routes: Routes = [
  {
    path: '',
    component: InvoiceStepperComponent,
    resolve: { clients: ClientsResolver, products: ProductsResolver }
  }
];

@NgModule({
  declarations: [InvoiceStepperComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InvoiceStepperModule {}
