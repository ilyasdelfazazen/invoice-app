import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Application } from '../models/application.model';
import { ApplicationService } from '../services/application.service';

@Injectable({ providedIn: 'root' })
export class ApplicationResolver implements Resolve<Application> {
  constructor(private service: ApplicationService) {}
  resolve(): Observable<Application> {
    return this.service.getSettings();
  }
}
