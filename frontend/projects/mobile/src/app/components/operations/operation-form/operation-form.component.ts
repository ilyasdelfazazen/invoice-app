import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Operation } from '../../../../../../../libs/models/operation.model';
import { OperationService } from '../../../../../../../libs/services/operation.service';

@Component({
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss']
})
export class OperationFormComponent implements OnInit {
  form!: FormGroup;
  operation: Operation | null = null;
  saving = false;

  get isEdit(): boolean { return !!this.operation; }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private operationService: OperationService
  ) {}

  ngOnInit(): void {
    this.operation = this.route.snapshot.data['operation'] ?? null;

    const dateVal = this.operation?.date
      ? new Date(this.operation.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    this.form = this.fb.group({
      name:     [this.operation?.name    ?? '', Validators.required],
      amount:   [this.operation?.amount  ?? null, [Validators.required, Validators.min(0)]],
      date:     [dateVal, Validators.required],
      context:  [this.operation?.context  ?? ''],
      category: [this.operation?.category ?? 'business'],
      status:   [this.operation?.status   ?? 'open'],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const data = this.form.value;
    const req = this.isEdit
      ? this.operationService.update(this.operation!._id, data)
      : this.operationService.create(data);

    req.subscribe({
      next: () => this.router.navigate(['/operations']),
      error: () => { this.saving = false; }
    });
  }
}
