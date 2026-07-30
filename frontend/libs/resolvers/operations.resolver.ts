import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Operation } from '../models/operation.model';
import { OperationService } from '../services/operation.service';

@Injectable({ providedIn: 'root' })
export class OperationsResolver implements Resolve<Operation[]> {
  constructor(private service: OperationService) {}
  resolve(): Observable<Operation[]> {
    return this.service.getOperations();
  }
}
