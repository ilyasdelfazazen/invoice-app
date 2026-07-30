import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { InvoiceService } from '../services/invoice.service';
import { OperationService } from '../services/operation.service';
import { DashboardStats } from '../models/invoice.model';
import { OperationTotals } from '../models/operation.model';

export interface DashboardData {
  stats: DashboardStats;
  operationTotals: OperationTotals;
}

@Injectable({ providedIn: 'root' })
export class DashboardResolver implements Resolve<DashboardData> {
  constructor(
    private invoiceService: InvoiceService,
    private operationService: OperationService
  ) {}

  resolve(): Observable<DashboardData> {
    return forkJoin({
      stats: this.invoiceService.getDashboardStats(),
      operationTotals: this.operationService.getTotals()
    });
  }
}
