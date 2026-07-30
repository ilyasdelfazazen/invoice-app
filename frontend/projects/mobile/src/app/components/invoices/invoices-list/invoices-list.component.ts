import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
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
  sortName: SortDir = '';
  dateFrom: string | null = null;
  dateTo: string | null = null;
  showDateModal = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private invoiceService: InvoiceService,
    private alertCtrl: AlertController,
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
    this.dateTo = null;
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

  typeLabel(type: string): string {
    return type === 'facture'
      ? this.translate.instant('invoices.typeFacture')
      : this.translate.instant('invoices.typeProforma');
  }

  async confirmDelete(invoice: Invoice): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: this.translate.instant('common.confirmDelete'),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('common.delete'), role: 'destructive',
          handler: () => {
            this.invoiceService.delete(invoice._id).subscribe(() => {
              this.allInvoices = this.allInvoices.filter(i => i._id !== invoice._id);
              this.applyClientFilters();
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
