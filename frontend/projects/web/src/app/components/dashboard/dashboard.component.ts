import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DashboardData } from '../../../../../../libs/resolvers/dashboard.resolver';
import { AuthService } from '../../../../../../libs/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  data!: DashboardData;
  lastLogin: string | null = null;

  typeChartData: any;
  typeChartOptions: any;
  operationsChartData: any;
  operationsChartOptions: any;

  openTotal = 0;
  paidTotal = 0;

  private langSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.data = this.route.snapshot.data['data'] as DashboardData;
    this.lastLogin = this.auth.getLastLogin()
      ? new Date(this.auth.getLastLogin()!).toLocaleString()
      : null;
    this.openTotal = this.data.operationTotals.open;
    this.paidTotal = this.data.operationTotals.paid;
    this.buildCharts();

    this.langSub = this.translate.onLangChange.subscribe(() => this.buildCharts());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private buildCharts(): void {
    const s = this.data.stats;
    this.typeChartData = {
      labels: [
        this.translate.instant('invoices.typeFacture'),
        this.translate.instant('invoices.typeProforma'),
      ],
      datasets: [{
        data: [s.totalFacture, s.totalProforma],
        backgroundColor: ['#0EA5E9', '#F97316'],
        borderWidth: 0,
      }]
    };
    const chartOpts = { plugins: { legend: { display: false } }, cutout: '68%' };
    this.typeChartOptions = chartOpts;

    this.operationsChartData = {
      labels: [
        this.translate.instant('operations.status_open'),
        this.translate.instant('operations.status_paid'),
      ],
      datasets: [{
        data: [this.data.operationTotals.countOpen, this.data.operationTotals.countPaid],
        backgroundColor: ['#F59E0B', '#22C55E'],
        borderWidth: 0,
      }]
    };
    this.operationsChartOptions = chartOpts;
  }
}
