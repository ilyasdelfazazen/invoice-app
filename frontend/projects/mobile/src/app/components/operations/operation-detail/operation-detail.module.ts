import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { OperationDetailComponent } from './operation-detail.component';
import { OperationDetailResolver } from '../../../../../../../libs/resolvers/operation-detail.resolver';

const routes: Routes = [
  {
    path: '',
    component: OperationDetailComponent,
    resolve: { operation: OperationDetailResolver }
  }
];

@NgModule({
  declarations: [OperationDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OperationDetailModule {}