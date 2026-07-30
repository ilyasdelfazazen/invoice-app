import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Operation } from '../../../../../../../libs/models/operation.model';
import { OperationService } from '../../../../../../../libs/services/operation.service';
import { PdfService } from '../../../../../../../libs/services/pdf.service';
import { LanguageService } from '../../../../../../../libs/services/language.service';

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
  dateFrom = '';
  dateTo = '';

  selectedOps: Operation[] = [];
  exportingPdf = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private operationService: OperationService,
    private translate: TranslateService,
    private alert: AlertController,
    private toast: ToastController,
    private pdfService: PdfService,
    private langService: LanguageService
  ) {}

  ngOnInit(): void {
    this.allOps = this.route.snapshot.data['operations'] as Operation[];
    this.applyFilters();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.reload());
  }

  toggleSortName(): void {
    this.sortName = this.sortName === '' ? 'asc' : this.sortName === 'asc' ? 'desc' : '';
    this.applyFilters();
  }

  toggleSortPrice(): void {
    this.sortPrice = this.sortPrice === '' ? 'asc' : this.sortPrice === 'asc' ? 'desc' : '';
    this.applyFilters();
  }

  onDateChange(): void { this.applyFilters(); }

  clearDates(): void { this.dateFrom = ''; this.dateTo = ''; this.applyFilters(); }

  private applyFilters(): void {
    let list = [...this.allOps];

    if (this.dateFrom) {
      const from = new Date(this.dateFrom).getTime();
      list = list.filter(o => new Date(o.date).getTime() >= from);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(o => new Date(o.date).getTime() <= to.getTime());
    }

    if (this.sortName === 'asc')   list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    if (this.sortName === 'desc')  list.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    if (this.sortPrice === 'asc')  list.sort((a, b) => a.amount - b.amount);
    if (this.sortPrice === 'desc') list.sort((a, b) => b.amount - a.amount);

    this.displayed = list;
  }

  markAsPaid(op: Operation): void {
    this.operationService.markAsPaid(op._id).subscribe(() => this.reload());
  }

  async confirmDelete(op: Operation): Promise<void> {
    const a = await this.alert.create({
      header: this.translate.instant('common.confirmDelete'),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('common.delete'),
          role: 'destructive',
          handler: () => {
            this.operationService.delete(op._id).subscribe(() => {
              this.allOps = this.allOps.filter(o => o._id !== op._id);
              this.applyFilters();
            });
          }
        }
      ]
    });
    await a.present();
  }

  reload(): void {
    this.loading = true;
    const filters: any = {};
    if (this.searchControl.value) filters.search   = this.searchControl.value;
    if (this.statusFilter)        filters.status   = this.statusFilter;
    if (this.categoryFilter)      filters.category = this.categoryFilter;
    this.operationService.getOperations(filters).subscribe({
      next: data => { this.allOps = data; this.applyFilters(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFilterChange(): void { this.reload(); }

  statusColor(status: string): string {
    return status === 'paid' ? 'success' : 'warning';
  }

  isSelected(op: Operation): boolean {
    return this.selectedOps.some(o => o._id === op._id);
  }

  toggleSelect(op: Operation): void {
    if (this.isSelected(op)) {
      this.selectedOps = this.selectedOps.filter(o => o._id !== op._id);
    } else {
      this.selectedOps = [...this.selectedOps, op];
    }
  }

  get allSelected(): boolean {
    return this.displayed.length > 0 && this.displayed.every(o => this.isSelected(o));
  }

  toggleSelectAll(): void {
    this.selectedOps = this.allSelected ? [] : [...this.displayed];
  }

  async exportPdf(): Promise<void> {
    if (this.langService.getCurrentLang() === 'ar') {
      const t = await this.toast.create({ message: this.translate.instant('pdf.arabicNotSupported'), duration: 4000, color: 'warning' });
      t.present();
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
    this.exportingPdf = true;
    try {
      const blob = await this.pdfService.generateOperationsPdf(this.selectedOps, labels);
      const filename = `operations-${new Date().toISOString().slice(0, 10)}.pdf`;
      const base64 = await this.blobToBase64(blob);
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: filename,
        url: writeResult.uri,
        dialogTitle: 'Enregistrer ou partager le PDF',
      });
    } catch {
      const t = await this.toast.create({ message: 'Erreur lors de la génération du PDF', duration: 4000, color: 'danger' });
      t.present();
    } finally {
      this.exportingPdf = false;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
