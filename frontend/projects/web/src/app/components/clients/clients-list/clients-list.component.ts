import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Client } from '../../../../../../../libs/models/client.model';
import { ClientService } from '../../../../../../../libs/services/client.service';
import { TranslateService } from '@ngx-translate/core';

type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit, OnDestroy {
  private allClients: Client[] = [];
  displayed: Client[] = [];
  loading = false;
  searchTerm = '';

  sortField: 'name' | 'company' | 'city' | '' = '';
  sortDir: SortDir = 'asc';

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private clientService: ClientService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.allClients = this.route.snapshot.data['clients'] as Client[];
    this.applySort();

    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => this.fetchClients(term));
  }

  onSearch(term: string): void { this.search$.next(term); }

  fetchClients(search?: string): void {
    this.loading = true;
    this.clientService.getClients(search).subscribe({
      next: c => { this.allClients = c; this.applySort(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  setSort(field: 'name' | 'company' | 'city'): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.applySort();
  }

  private applySort(): void {
    let list = [...this.allClients];
    if (this.sortField) {
      const f = this.sortField;
      const dir = this.sortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => ((a[f] ?? '') < (b[f] ?? '') ? -1 : 1) * dir);
    }
    this.displayed = list;
  }

  confirmDelete(client: Client): void {
    this.translate.get('clients.deleteConfirm').subscribe(msg => {
      this.confirmationService.confirm({
        message: msg,
        accept: () => this.delete(client._id)
      });
    });
  }

  private delete(id: string): void {
    this.clientService.delete(id).subscribe(() => {
      this.allClients = this.allClients.filter(c => c._id !== id);
      this.applySort();
      this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Client supprimé', life: 3000 });
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
