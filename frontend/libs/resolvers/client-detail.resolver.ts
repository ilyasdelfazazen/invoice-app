import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { ClientService } from '../services/client.service';

@Injectable({ providedIn: 'root' })
export class ClientDetailResolver implements Resolve<Client> {
  constructor(private service: ClientService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Client> {
    return this.service.getClientById(route.paramMap.get('id')!);
  }
}
