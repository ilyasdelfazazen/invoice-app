import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Invoice } from '../../../../../../../libs/models/invoice.model';
import { InvoiceService } from '../../../../../../../libs/services/invoice.service';

type SortDir = 'asc' | 'desc' | '';

@Component({
  selector: 'app-invoices-list',
  templateUrl: './invoices-list.component.html',
  styleUrls: ['./invoices-list.component.scss']
})
export class InvoicesListComponent implements OnInit {
  private allInvoices: Invoice[] = [];
  displayed: Invoice[] = [];
  loading = false;

  searchControl = new FormControl('');

  sortPrice: SortDir = '';
  sortName:  SortDir = '';
  dateFrom: Date | null = null;
  dateTo:   Date | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private invoiceService: InvoiceService,
    private confirmService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.allInvoices = this.route.snapshot.data['invoices'] as Invoice[];
    this.applyClientFilters();

    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyClientFilters());
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getInvoices().subscribe({
      next: data => { this.allInvoices = data; this.applyClientFilters(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggleSortPrice(): void {
    this.sortPrice = this.sortPrice === '' ? 'asc' : this.sortPrice === 'asc' ? 'desc' : '';
    this.applyClientFilters();
  }

  toggleSortName(): void {
    this.sortName = this.sortName === '' ? 'asc' : this.sortName === 'asc' ? 'desc' : '';
    this.applyClientFilters();
  }

  onDateChange(): void { this.applyClientFilters(); }

  clearDates(): void {
    this.dateFrom = null;
    this.dateTo   = null;
    this.applyClientFilters();
  }

  private applyClientFilters(): void {
    let list = [...this.allInvoices];

    if (this.dateFrom) {
      const from = new Date(this.dateFrom); from.setHours(0, 0, 0, 0);
      list = list.filter(i => new Date(i.date) >= from);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo); to.setHours(23, 59, 59, 999);
      list = list.filter(i => new Date(i.date) <= to);
    }

    const q = (this.searchControl.value ?? '').toLowerCase().trim();
    if (q) {
      list = list.filter(i =>
        i.numero.toLowerCase().includes(q) ||
        ((i.client_id as any)?.company ?? '').toLowerCase().includes(q)
      );
    }

    if (this.sortPrice === 'asc')  list.sort((a, b) => a.total_ttc - b.total_ttc);
    if (this.sortPrice === 'desc') list.sort((a, b) => b.total_ttc - a.total_ttc);

    const company = (i: Invoice) => ((i.client_id as any)?.company ?? '').toLowerCase();
    if (this.sortName === 'asc')  list.sort((a, b) => company(a).localeCompare(company(b)));
    if (this.sortName === 'desc') list.sort((a, b) => company(b).localeCompare(company(a)));

    this.displayed = list;
  }

  statusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    const map: Record<string, 'success' | 'secondary' | 'info' | 'warning' | 'danger'> = {
      draft: 'secondary', sent: 'info', paid: 'success', cancelled: 'danger'
    };
    return map[status] ?? 'secondary';
  }

  confirmDelete(invoice: Invoice): void {
    this.confirmService.confirm({
      message: this.translate.instant('common.confirmDelete'),
      accept: () => {
        this.invoiceService.delete(invoice._id).subscribe(() => {
          this.allInvoices = this.allInvoices.filter(i => i._id !== invoice._id);
          this.applyClientFilters();
        });
      }
    });
  }
}
