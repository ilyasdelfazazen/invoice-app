import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Operation } from '../../../../../../../libs/models/operation.model';

@Component({
  selector: 'app-operation-detail',
  templateUrl: './operation-detail.component.html',
  styleUrls: ['./operation-detail.component.scss']
})
export class OperationDetailComponent implements OnInit {
  operation!: Operation;

  constructor(private route: ActivatedRoute, public router: Router) {}

  ngOnInit(): void {
    this.operation = this.route.snapshot.data['operation'] as Operation;
  }

  statusSeverity(status: string): 'success' | 'warning' {
    return status === 'paid' ? 'success' : 'warning';
  }
}
