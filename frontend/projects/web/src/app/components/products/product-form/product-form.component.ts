import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../../../../libs/models/product.model';
import { ProductService } from '../../../../../../../libs/services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  product: Product | null = null;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private productService: ProductService,
  ) {}

  get isEdit(): boolean { return !!this.product; }

  ngOnInit(): void {
    this.product = this.route.snapshot.data['product'] ?? null;

    this.form = this.fb.group({
      ref:            [this.product?.ref ?? '',            Validators.required],
      designation:    [this.product?.designation ?? '',    Validators.required],
      unit_price_ht:  [this.product?.unit_price_ht ?? null, Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const data = this.form.value;
    const req = this.isEdit
      ? this.productService.update(this.product!._id, data)
      : this.productService.create(data);

    req.subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => { this.saving = false; }
    });
  }
}
