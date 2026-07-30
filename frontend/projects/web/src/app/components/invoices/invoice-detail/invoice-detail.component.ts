import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
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
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data['data'] as { invoice: Invoice; lines: InvoiceLine[] };
    this.invoice = data.invoice;
    this.lines = data.lines;
  }

  // ── Facture edit form ────────────────────────────────────────────

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
      virement: 'Virement bancaire',
      cheque:   'Chèque',
      especes:  'Espèces',
      traite:   'Traite',
    };
    return map[raw?.toLowerCase()] ?? raw ?? 'Virement bancaire';
  }

  enterFactureEdit(): void {
    this.factureForm = this.fb.group({
      numero:             [this.invoice.numero, Validators.required],
      date:               [new Date(this.invoice.date), Validators.required],
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

  saveFacture(): void {
    if (this.factureForm.invalid) { this.factureForm.markAllAsTouched(); return; }
    this.savingFacture = true;
    const val = this.factureForm.value;
    const payload = {
      ...val,
      tva_rate: (val.tva_rate ?? 20) / 100,
      lines: val.lines.map((l: any) => ({
        product_id:    l.product_id || undefined,
        ref:           l.ref,
        designation:   l.designation,
        quantity:      l.quantity,
        unit_price_ht: l.unit_price_ht,
        discount_pct:  (l.discount_pct ?? 0) / 100,
      }))
    };
    this.invoiceService.update(this.invoice._id, payload).subscribe({
      next: (res: any) => {
        this.invoice = { ...this.invoice, ...res.invoice, client_id: this.invoice.client_id };
        this.lines = res.lines;
        this.editingFacture = false;
        this.savingFacture = false;
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Facture mise à jour', life: 3000 });
      },
      error: (err: any) => {
        this.savingFacture = false;
        const detail = err?.error?.message || 'Erreur lors de la mise à jour';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 4000 });
      }
    });
  }

  // ── Type toggle ──────────────────────────────────────────────────

  toggleType(): void {
    const next = this.invoice.type === 'proforma' ? 'facture' : 'proforma';
    this.switchingType = true;
    this.invoiceService.updateType(this.invoice._id, next).subscribe({
      next: () => {
        this.invoice = { ...this.invoice, type: next };
        this.switchingType = false;
        const label = next === 'facture' ? 'Facture' : 'Facture Proforma';
        this.editingFacture = false;
        this.messageService.add({ severity: 'success', summary: 'OK', detail: `Converti en ${label}`, life: 3000 });
      },
      error: () => { this.switchingType = false; }
    });
  }

  // ── Numero inline edit ───────────────────────────────────────────

  startEditNumero(): void {
    this.numeroInput = this.invoice.numero;
    this.editingNumero = true;
  }

  cancelEditNumero(): void { this.editingNumero = false; }

  saveNumero(): void {
    const trimmed = this.numeroInput.trim();
    if (!trimmed || trimmed === this.invoice.numero) { this.editingNumero = false; return; }
    this.savingNumero = true;
    this.invoiceService.updateNumero(this.invoice._id, trimmed).subscribe({
      next: () => {
        this.invoice = { ...this.invoice, numero: trimmed };
        this.editingNumero = false;
        this.savingNumero = false;
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Numéro mis à jour', life: 3000 });
      },
      error: (err) => {
        this.savingNumero = false;
        const detail = err?.error?.message || 'Erreur lors de la mise à jour';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 4000 });
      }
    });
  }

  // ── PDF ──────────────────────────────────────────────────────────

  async downloadPdf(): Promise<void> {
    if (this.langService.getCurrentLang() === 'ar') {
      const msg = this.translate.instant('pdf.arabicNotSupported');
      this.messageService.add({ severity: 'warn', summary: '⚠️', detail: msg, life: 4000 });
      return;
    }

    this.appService.getSettings().subscribe(async app => {
      const blob = await this.pdfService.generateInvoicePdf(this.invoice, this.lines, app);
      this.pdfService.downloadBlob(blob, `${this.invoice.numero}.pdf`);
    });
  }
}
