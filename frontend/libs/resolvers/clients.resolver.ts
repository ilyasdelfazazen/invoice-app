import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { ClientService } from '../services/client.service';

@Injectable({ providedIn: 'root' })
export class ClientsResolver implements Resolve<Client[]> {
  constructor(private service: ClientService) {}
  resolve(): Observable<Client[]> {
    return this.service.getClients();
  }
}
