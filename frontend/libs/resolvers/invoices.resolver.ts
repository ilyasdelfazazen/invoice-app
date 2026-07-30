import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { InvoiceService } from '../services/invoice.service';

@Injectable({ providedIn: 'root' })
export class InvoicesResolver implements Resolve<Invoice[]> {
  constructor(private service: InvoiceService) {}
  resolve(): Observable<Invoice[]> {
    return this.service.getInvoices();
  }
}
