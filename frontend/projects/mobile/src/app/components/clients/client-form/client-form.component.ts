import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Client } from '../../../../../../../libs/models/client.model';
import { ClientService } from '../../../../../../../libs/services/client.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  clientId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private clientService: ClientService,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    const client = this.route.snapshot.data['client'] as Client | undefined;
    this.isEdit = !!client;
    this.clientId = client?._id || null;

    this.form = this.fb.group({
      name:        [client?.name || '',        Validators.required],
      company:     [client?.company || ''],
      address:     [client?.address || ''],
      city:        [client?.city || ''],
      ice:         [client?.ice || ''],
      code_client: [client?.code_client || ''],
      email:       [client?.email || '',       Validators.email],
      phone:       [client?.phone || ''],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.value;
    const req = this.isEdit
      ? this.clientService.update(this.clientId!, payload)
      : this.clientService.create(payload);

    req.subscribe({
      next: async () => {
        const t = await this.toast.create({ message: 'Client enregistré', duration: 3000, color: 'success' });
        t.present();
        this.router.navigate(['/clients']);
      },
      error: () => this.loading = false
    });
  }
}
