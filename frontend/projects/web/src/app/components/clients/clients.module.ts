import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { ClientsListComponent } from './clients-list/clients-list.component';

const routes: Routes = [{ path: '', component: ClientsListComponent }];

@NgModule({
  declarations: [ClientsListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    TableModule, ButtonModule, InputTextModule,
    ConfirmDialogModule, SkeletonModule, PaginatorModule,
  ],
  providers: [ConfirmationService]
})
export class ClientsModule {}
