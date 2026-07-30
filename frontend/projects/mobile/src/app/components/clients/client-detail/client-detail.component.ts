import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../../../../../libs/models/client.model';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  client!: Client;

  constructor(private route: ActivatedRoute, public router: Router) {}

  ngOnInit(): void {
    this.client = this.route.snapshot.data['client'] as Client;
  }
}
