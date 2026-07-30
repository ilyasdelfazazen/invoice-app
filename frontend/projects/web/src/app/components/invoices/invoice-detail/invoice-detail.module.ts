import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { InvoiceDetailComponent } from './invoice-detail.component';

const routes: Routes = [{ path: '', component: InvoiceDetailComponent }];

@NgModule({
  declarations: [InvoiceDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ButtonModule, DividerModule, TableModule, DropdownModule,
    InputTextModule, InputNumberModule, CalendarModule, TooltipModule,
  ]
})
export class InvoiceDetailModule {}
