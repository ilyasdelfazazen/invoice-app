import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Operation } from '../models/operation.model';
import { OperationService } from '../services/operation.service';

@Injectable({ providedIn: 'root' })
export class OperationDetailResolver implements Resolve<Operation> {
  constructor(private service: OperationService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Operation> {
    return this.service.getById(route.paramMap.get('id')!);
  }
}
