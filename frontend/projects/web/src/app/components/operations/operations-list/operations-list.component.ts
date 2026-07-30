import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../../libs/services/language.service';
import { Operation } from '../../../../../../../libs/models/operation.model';
import { OperationService } from '../../../../../../../libs/services/operation.service';
import { PdfService } from '../../../../../../../libs/services/pdf.service';

type SortDir = 'asc' | 'desc' | '';

@Component({
  selector: 'app-operations-list',
  templateUrl: './operations-list.component.html',
  styleUrls: ['./operations-list.component.scss']
})
export class OperationsListComponent implements OnInit {
  private allOps: Operation[] = [];
  displayed: Operation[] = [];
  loading = false;

  searchControl = new FormControl('');
  statusFilter = '';
  categoryFilter = '';

  sortName: SortDir = '';
  sortPrice: SortDir = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  statusOptions = [
    { label: 'Tous les statuts', value: '' },
    { label: 'Ouvert', value: 'open' },
    { label: 'Payé', value: 'paid' },
  ];

  categoryOptions = [
    { label: 'Tous', value: '' },
    { label: 'Personnel', value: 'personal' },
    { label: 'Professionnel', value: 'business' },
  ];

  selectedOps: Operation[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private operationService: OperationService,
    private confirmService: ConfirmationService,
    private translate: TranslateService,
    private pdfService: PdfService,
    private langService: LanguageService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.allOps = this.route.snapshot.data['operations'] as Operation[];
    this.applyClientFilters();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.reload());
  }

  toggleSortName(): void {
    this.sortName = this.sortName === '' ? 'asc' : this.sortName === 'asc' ? 'desc' : '';
    this.applyClientFilters();
  }

  toggleSortPrice(): void {
    this.sortPrice = this.sortPrice === '' ? 'asc' : this.sortPrice === 'asc' ? 'desc' : '';
    this.applyClientFilters();
  }

  onDateChange(): void { this.applyClientFilters(); }

  clearDates(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.applyClientFilters();
  }

  private applyClientFilters(): void {
    let list = [...this.allOps];

    if (this.dateFrom) {
      const from = this.dateFrom.getTime();
      list = list.filter(o => new Date(o.date).getTime() >= from);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(o => new Date(o.date).getTime() <= to.getTime());
    }

    if (this.sortName === 'asc')  list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    if (this.sortName === 'desc') list.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    if (this.sortPrice === 'asc')  list.sort((a, b) => a.amount - b.amount);
    if (this.sortPrice === 'desc') list.sort((a, b) => b.amount - a.amount);

    this.displayed = list;
  }

  markAsPaid(op: Operation): void {
    this.operationService.markAsPaid(op._id).subscribe(() => this.reload());
  }

  confirmDelete(op: Operation): void {
    this.confirmService.confirm({
      message: this.translate.instant('common.confirmDelete'),
      accept: () => {
        this.operationService.delete(op._id).subscribe(() => {
          this.allOps = this.allOps.filter(o => o._id !== op._id);
          this.applyClientFilters();
        });
      }
    });
  }

  reload(): void {
    this.loading = true;
    const filters: any = {};
    if (this.searchControl.value) filters.search   = this.searchControl.value;
    if (this.statusFilter)        filters.status   = this.statusFilter;
    if (this.categoryFilter)      filters.category = this.categoryFilter;
    this.operationService.getOperations(filters).subscribe({
      next: data => { this.allOps = data; this.applyClientFilters(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFilterChange(): void { this.reload(); }

  statusSeverity(status: string): 'success' | 'warning' {
    return status === 'paid' ? 'success' : 'warning';
  }

  exportPdf(): void {
    if (this.langService.getCurrentLang() === 'ar') {
      const msg = this.translate.instant('pdf.arabicNotSupported');
      this.messageService.add({ severity: 'warn', summary: '⚠️', detail: msg, life: 4000 });
      return;
    }
    const labels = {
      title:    this.translate.instant('operations.pdfTitle'),
      date:     this.translate.instant('operations.date'),
      name:     this.translate.instant('operations.name'),
      context:  this.translate.instant('operations.context'),
      mode:     this.translate.instant('operations.category'),
      amount:   this.translate.instant('operations.amount'),
      status:   this.translate.instant('operations.status'),
      personal: this.translate.instant('operations.personal'),
      business: this.translate.instant('operations.business'),
      total:    this.translate.instant('common.total'),
      open:     this.translate.instant('operations.status_open'),
      paid:     this.translate.instant('operations.status_paid'),
    };
    this.pdfService.generateOperationsPdf(this.selectedOps, labels).then(blob => {
      this.pdfService.downloadBlob(blob, `operations-${new Date().toISOString().slice(0,10)}.pdf`);
    });
  }
}
