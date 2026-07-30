import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Invoice, InvoiceLine } from '../models/invoice.model';
import { InvoiceService } from '../services/invoice.service';

@Injectable({ providedIn: 'root' })
export class InvoiceDetailResolver implements Resolve<{ invoice: Invoice; lines: InvoiceLine[] }> {
  constructor(private service: InvoiceService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<{ invoice: Invoice; lines: InvoiceLine[] }> {
    return this.service.getById(route.paramMap.get('id')!);
  }
}
