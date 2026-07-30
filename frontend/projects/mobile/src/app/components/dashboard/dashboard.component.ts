import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { DashboardData } from '../../../../../../libs/resolvers/dashboard.resolver';
import { AuthService } from '../../../../../../libs/services/auth.service';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typeChart') typeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('opsChart') opsChartRef!: ElementRef<HTMLCanvasElement>;

  data!: DashboardData;
  lastLogin: string | null = null;

  openTotal = 0;
  paidTotal = 0;

  private typeChartInstance?: Chart;
  private opsChartInstance?: Chart;
  private langSub!: Subscription;
  private chartsBuilt = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
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

    this.langSub = this.translate.onLangChange.subscribe(() => {
      if (this.chartsBuilt) this.buildCharts();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buildCharts();
      this.chartsBuilt = true;
    }, 100);
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.typeChartInstance?.destroy();
    this.opsChartInstance?.destroy();
  }

  private buildCharts(): void {
    const s = this.data.stats;

    if (this.typeChartInstance) this.typeChartInstance.destroy();
    this.typeChartInstance = new Chart(this.typeChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [
          this.translate.instant('invoices.typeFacture'),
          this.translate.instant('invoices.typeProforma'),
        ],
        datasets: [{ data: [s.totalFacture, s.totalProforma], backgroundColor: ['#0EA5E9', '#F97316'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '68%' }
    });

    if (this.opsChartInstance) this.opsChartInstance.destroy();
    this.opsChartInstance = new Chart(this.opsChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [
          this.translate.instant('operations.status_open'),
          this.translate.instant('operations.status_paid'),
        ],
        datasets: [{
          data: [this.data.operationTotals.countOpen, this.data.operationTotals.countPaid],
          backgroundColor: ['#F59E0B', '#22C55E'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '68%' }
    });
  }
}
