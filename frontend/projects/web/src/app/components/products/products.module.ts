import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductsResolver } from '../../../../../../libs/resolvers/products.resolver';

const routes: Routes = [
  {
    path: '',
    component: ProductsListComponent,
    resolve: { products: ProductsResolver }
  }
];

@NgModule({
  declarations: [ProductsListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule, InputTextModule, TableModule, SkeletonModule, ConfirmDialogModule,
  ],
  providers: [ConfirmationService]
})
export class ProductsModule {}
