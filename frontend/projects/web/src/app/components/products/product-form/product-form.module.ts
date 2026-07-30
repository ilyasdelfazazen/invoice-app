import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProductFormComponent } from './product-form.component';

const routes: Routes = [
  {
    path: '',
    component: ProductFormComponent
  }
];

@NgModule({
  declarations: [ProductFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule, InputTextModule, InputNumberModule, InputTextareaModule,
  ]
})
export class ProductFormModule {}
