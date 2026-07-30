import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { OperationDetailComponent } from './operation-detail.component';

const routes: Routes = [{ path: '', component: OperationDetailComponent }];

@NgModule({
  declarations: [OperationDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ButtonModule,
    TagModule,
  ]
})
export class OperationDetailModule {}
