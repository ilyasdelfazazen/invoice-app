import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InvoicesListComponent } from './invoices-list/invoices-list.component';
import { InvoicesResolver } from '../../../../../../libs/resolvers/invoices.resolver';
import { InvoiceDetailResolver } from '../../../../../../libs/resolvers/invoice-detail.resolver';

const routes: Routes = [
  {
    path: '',
    component: InvoicesListComponent,
    resolve: { invoices: InvoicesResolver }
  },
  {
    path: 'new',
    loadChildren: () => import('./invoice-stepper/invoice-stepper.module').then(m => m.InvoiceStepperModule)
  },
  {
    path: ':id',
    loadChildren: () => import('./invoice-detail/invoice-detail.module').then(m => m.InvoiceDetailModule),
    resolve: { data: InvoiceDetailResolver }
  }
];

@NgModule({
  declarations: [InvoicesListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ButtonModule, InputTextModule, TableModule, SkeletonModule, ConfirmDialogModule, TagModule, DropdownModule, CalendarModule,
  ],
  providers: [ConfirmationService]
})
export class InvoicesModule {}
