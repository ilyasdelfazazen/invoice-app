import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { StepsModule } from 'primeng/steps';
import { DividerModule } from 'primeng/divider';
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
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule, InputTextModule, InputNumberModule, InputTextareaModule,
    DropdownModule, StepsModule, DividerModule,
  ]
})
export class InvoiceStepperModule {}
