import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { OperationsListComponent } from './operations-list/operations-list.component';
import { OperationsResolver } from '../../../../../../libs/resolvers/operations.resolver';

const routes: Routes = [
  {
    path: '',
    component: OperationsListComponent,
    resolve: { operations: OperationsResolver }
  }
];

@NgModule({
  declarations: [OperationsListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ButtonModule, InputTextModule, TableModule, SkeletonModule, ConfirmDialogModule,
    TagModule, DropdownModule, TooltipModule, CalendarModule,
  ],
  providers: [ConfirmationService]
})
export class OperationsModule {}
