import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Client } from '../../../../../../../libs/models/client.model';
import { Product } from '../../../../../../../libs/models/product.model';
import { InvoiceService } from '../../../../../../../libs/services/invoice.service';
import { ApplicationService } from '../../../../../../../libs/services/application.service';
import { calculateLine, calculateTotals } from '../../../../../../../libs/utils/invoice.utils';

@Component({
  selector: 'app-invoice-stepper',
  templateUrl: './invoice-stepper.component.html',
  styleUrls: ['./invoice-stepper.component.scss']
})
export class InvoiceStepperComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  products: Product[] = [];
  currentStep = 0;
  saving = false;

  headerForm!: FormGroup;
  linesForm!: FormGroup;

  steps: { label: string }[] = [];
  private langSub!: Subscription;

  paymentModes = [
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
    private appService: ApplicationService,
    private translate: TranslateService
  ) {}

  get lines(): FormArray { return this.linesForm.get('lines') as FormArray; }

  get totals() {
    return calculateTotals(
      this.lines.controls.map(c => ({ line_total_ht: c.get('line_total_ht')?.value ?? 0 })),
      (this.linesForm.get('tva_rate')?.value ?? 20) / 100
    );
  }

  private buildSteps(): void {
    this.steps = [
      { label: this.translate.instant('invoices.stepClient') },
      { label: this.translate.instant('invoices.stepLines') },
      { label: this.translate.instant('invoices.stepSummary') },
    ];
  }

  ngOnDestroy(): void { this.langSub?.unsubscribe(); }

  ngOnInit(): void {
    this.buildSteps();
    this.langSub = this.translate.onLangChange.subscribe(() => this.buildSteps());

    this.clients = this.route.snapshot.data['clients'] as Client[];
    this.products = this.route.snapshot.data['products'] as Product[];

    this.headerForm = this.fb.group({
      client_id:           ['', Validators.required],
      type:                ['proforma', Validators.required],
      numero:              ['', Validators.required],
      bl_number:           [''],
      payment_mode:        [''],
      payment_conditions:  [''],
      bank_name:           ['', Validators.required],
      bank_rib:            ['', Validators.required],
      notes:               [''],
    });

    this.appService.getSettings().subscribe(app => {
      this.headerForm.patchValue({
        bank_name: app.bank_name || '',
        bank_rib:  app.bank_rib  || '',
      });
    });

    this.linesForm = this.fb.group({
      tva_rate: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
      lines: this.fb.array([this.buildLine()])
    });
  }

  buildLine(): FormGroup {
    return this.fb.group({
      product_id:     ['', Validators.required],
      ref:            [''],
      designation:    [''],
      unit_price_ht:  [0, [Validators.required, Validators.min(0)]],
      quantity:       [1, [Validators.required, Validators.min(1)]],
      discount_pct:   [0, [Validators.min(0), Validators.max(100)]],
      discount_amount:[0],
      line_total_ht:  [0],
    });
  }

  addLine(): void { this.lines.push(this.buildLine()); }

  removeLine(i: number): void { if (this.lines.length > 1) this.lines.removeAt(i); }

  onProductSelect(lineIndex: number, productId: string): void {
    const product = this.products.find(p => p._id === productId);
    if (!product) return;
    const ctrl = this.lines.at(lineIndex);
    ctrl.patchValue({ ref: product.ref, designation: product.designation, unit_price_ht: product.unit_price_ht });
    this.recalcLine(lineIndex);
  }

  recalcLine(i: number): void {
    const ctrl = this.lines.at(i);
    const result = calculateLine(
      ctrl.get('quantity')?.value,
      ctrl.get('unit_price_ht')?.value,
      (ctrl.get('discount_pct')?.value ?? 0) / 100
    );
    ctrl.patchValue({ ...result }, { emitEvent: false });
  }

  next(): void {
    if (this.currentStep === 0 && this.headerForm.invalid) { this.headerForm.markAllAsTouched(); return; }
    if (this.currentStep === 1 && this.linesForm.invalid) { this.linesForm.markAllAsTouched(); return; }
    this.currentStep++;
  }

  prev(): void { this.currentStep--; }

  submit(): void {
    this.saving = true;
    const payload = {
      ...this.headerForm.value,
      tva_rate: (this.linesForm.get('tva_rate')?.value ?? 20) / 100,
      lines: this.lines.value.map((l: any) => ({
        product_id: l.product_id,
        designation: l.designation,
        ref: l.ref,
        quantity: l.quantity,
        unit_price_ht: l.unit_price_ht,
        discount_pct: (l.discount_pct ?? 0) / 100,
      }))
    };
    this.invoiceService.create(payload).subscribe({
      next: res => this.router.navigate(['/invoices', res.invoice._id]),
      error: () => { this.saving = false; }
    });
  }
}
