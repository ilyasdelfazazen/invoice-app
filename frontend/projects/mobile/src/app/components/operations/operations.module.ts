import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
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
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OperationsModule {}