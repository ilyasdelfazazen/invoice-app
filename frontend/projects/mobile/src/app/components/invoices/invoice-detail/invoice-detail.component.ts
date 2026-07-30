import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Invoice, InvoiceLine } from '../../../../../../../libs/models/invoice.model';
import { InvoiceService } from '../../../../../../../libs/services/invoice.service';
import { PdfService } from '../../../../../../../libs/services/pdf.service';
import { ApplicationService } from '../../../../../../../libs/services/application.service';
import { LanguageService } from '../../../../../../../libs/services/language.service';
import { calculateLine, calculateTotals } from '../../../../../../../libs/utils/invoice.utils';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  invoice!: Invoice;
  lines: InvoiceLine[] = [];

  editingNumero = false;
  numeroInput = '';
  savingNumero = false;

  switchingType = false;

  editingFacture = false;
  savingFacture = false;
  factureForm!: FormGroup;

  generatingPdf = false;

  paymentModeOptions = [
    { label: 'Virement bancaire', value: 'Virement bancaire' },
    { label: 'Chèque',            value: 'Chèque' },
    { label: 'Espèces',           value: 'Espèces' },
    { label: 'Traite',            value: 'Traite' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private invoiceService: InvoiceService,
    private pdfService: PdfService,
    private appService: ApplicationService,
    private langService: LanguageService,
    private translate: TranslateService,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data['data'] as { invoice: Invoice; lines: InvoiceLine[] };
    this.invoice = data.invoice;
    this.lines = data.lines;
  }

  get factureLines(): FormArray { return this.factureForm?.get('lines') as FormArray; }

  get factureTotals() {
    if (!this.factureForm) return { total_ht: 0, tva_amount: 0, total_ttc: 0 };
    return calculateTotals(
      this.factureLines.controls.map(c => ({ line_total_ht: c.get('line_total_ht')?.value ?? 0 })),
      (this.factureForm.get('tva_rate')?.value ?? 20) / 100
    );
  }

  private normalizePaymentMode(raw: string): string {
    const map: Record<string, string> = {
      virement: 'Virement bancaire', cheque: 'Chèque', especes: 'Espèces', traite: 'Traite',
    };
    return map[raw?.toLowerCase()] ?? raw ?? 'Virement bancaire';
  }

  enterFactureEdit(): void {
    this.factureForm = this.fb.group({
      numero:             [this.invoice.numero, Validators.required],
      date:               [new Date(this.invoice.date).toISOString().split('T')[0], Validators.required],
      payment_mode:       [this.normalizePaymentMode(this.invoice.payment_mode)],
      payment_conditions: [this.invoice.payment_conditions],
      bank_name:          [this.invoice.bank_name],
      bank_rib:           [this.invoice.bank_rib],
      notes:              [this.invoice.notes],
      tva_rate:           [Math.round(this.invoice.tva_rate * 100)],
      lines: this.fb.array(this.lines.map(l => this.buildFactureLine(l)))
    });
    this.editingFacture = true;
  }

  buildFactureLine(l?: InvoiceLine): FormGroup {
    return this.fb.group({
      product_id:     [l?.product_id ?? ''],
      ref:            [l?.ref ?? ''],
      designation:    [l?.designation ?? '', Validators.required],
      unit_price_ht:  [l?.unit_price_ht ?? 0, [Validators.required, Validators.min(0)]],
      quantity:       [l?.quantity ?? 1, [Validators.required, Validators.min(1)]],
      discount_pct:   [Math.round((l?.discount_pct ?? 0) * 100)],
      discount_amount:[l?.discount_amount ?? 0],
      line_total_ht:  [l?.line_total_ht ?? 0],
    });
  }

  addFactureLine(): void { this.factureLines.push(this.buildFactureLine()); }

  removeFactureLine(i: number): void {
    if (this.factureLines.length > 1) this.factureLines.removeAt(i);
  }

  recalcFactureLine(i: number): void {
    const ctrl = this.factureLines.at(i);
    const result = calculateLine(
      ctrl.get('quantity')?.value,
      ctrl.get('unit_price_ht')?.value,
      (ctrl.get('discount_pct')?.value ?? 0) / 100
    );
    ctrl.patchValue({ ...result }, { emitEvent: false });
  }

  cancelFactureEdit(): void { this.editingFacture = false; }

  async saveFacture(): Promise<void> {
    if (this.factureForm.invalid) { this.factureForm.markAllAsTouched(); return; }
    this.savingFacture = true;
    const val = this.factureForm.value;
    const payload = {
      ...val,
      tva_rate: (val.tva_rate ?? 20) / 100,
      lines: val.lines.map((l: any) => ({
        product_id: l.product_id || undefined,
        ref: l.ref,
        designation: l.designation,
        quantity: l.quantity,
        unit_price_ht: l.unit_price_ht,
        discount_pct: (l.discount_pct ?? 0) / 100,
      }))
    };
    this.invoiceService.update(this.invoice._id, payload).subscribe({
      next: async (res: any) => {
        this.invoice = { ...this.invoice, ...res.invoice, client_id: this.invoice.client_id };
        this.lines = res.lines;
        this.editingFacture = false;
        this.savingFacture = false;
        const t = await this.toast.create({ message: 'Facture mise à jour', duration: 3000, color: 'success' });
        t.present();
      },
      error: async (err: any) => {
        this.savingFacture = false;
        const t = await this.toast.create({ message: err?.error?.message || 'Erreur', duration: 4000, color: 'danger' });
        t.present();
      }
    });
  }

  toggleType(): void {
    const next = this.invoice.type === 'proforma' ? 'facture' : 'proforma';
    this.switchingType = true;
    this.invoiceService.updateType(this.invoice._id, next).subscribe({
      next: async () => {
        this.invoice = { ...this.invoice, type: next };
        this.switchingType = false;
        this.editingFacture = false;
        const label = next === 'facture' ? 'Facture' : 'Facture Proforma';
        const t = await this.toast.create({ message: `Converti en ${label}`, duration: 3000, color: 'success' });
        t.present();
      },
      error: () => { this.switchingType = false; }
    });
  }

  startEditNumero(): void { this.numeroInput = this.invoice.numero; this.editingNumero = true; }
  cancelEditNumero(): void { this.editingNumero = false; }

  async saveNumero(): Promise<void> {
    const trimmed = this.numeroInput.trim();
    if (!trimmed || trimmed === this.invoice.numero) { this.editingNumero = false; return; }
    this.savingNumero = true;
    this.invoiceService.updateNumero(this.invoice._id, trimmed).subscribe({
      next: async () => {
        this.invoice = { ...this.invoice, numero: trimmed };
        this.editingNumero = false;
        this.savingNumero = false;
        const t = await this.toast.create({ message: 'Numéro mis à jour', duration: 3000, color: 'success' });
        t.present();
      },
      error: async (err) => {
        this.savingNumero = false;
        const t = await this.toast.create({ message: err?.error?.message || 'Erreur', duration: 4000, color: 'danger' });
        t.present();
      }
    });
  }

  async downloadPdf(): Promise<void> {
    if (this.langService.getCurrentLang() === 'ar') {
      const t = await this.toast.create({ message: this.translate.instant('pdf.arabicNotSupported'), duration: 4000, color: 'warning' });
      t.present();
      return;
    }

    this.generatingPdf = true;
    this.appService.getSettings().subscribe(async app => {
      try {
        const blob = await this.pdfService.generateInvoicePdf(this.invoice, this.lines, app);
        const filename = `${this.invoice.numero.replace(/\//g, '-')}.pdf`;
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
        this.generatingPdf = false;
      }
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
