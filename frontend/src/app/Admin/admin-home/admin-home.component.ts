import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { StatsService } from '../../Services/stats-admin/stats.service';
import { DashboardService } from '../../Services/Dashboard/dashboard.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [AdminSidebarComponent, CommonModule, BaseChartDirective],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit, OnDestroy {

  stats: any = {};
  refreshSub: Subscription | undefined;
  private readonly refreshMs = 300000;

  // Chart Configs for ng2-charts
  ordersChartConfig: ChartConfiguration = { type: 'line', data: { labels: [], datasets: [{ label: 'Orders', data: [], borderColor: '#0D8DD7', backgroundColor: 'rgba(13, 141, 215, 0.1)', borderWidth: 2, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } } };
  revenueChartConfig: ChartConfiguration = { type: 'line', data: { labels: [], datasets: [{ label: 'Revenue (DNT)', data: [], borderColor: '#D70D0D', backgroundColor: 'rgba(215, 13, 13, 0.1)', borderWidth: 2, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } } };
  usersChartConfig: ChartConfiguration = { type: 'line', data: { labels: [], datasets: [{ label: 'New Users', data: [], borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 2, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } } };
  categoryChartConfig: ChartConfiguration = {
    type: 'doughnut',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#D70D0D', '#0D8DD7', '#fbcb09', '#22c55e', '#a855f7'] }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#ffffff' } }
      }
    }
  };
  topProductsChartConfig: ChartConfiguration = { type: 'bar', data: { labels: [], datasets: [{ label: 'Units Sold', data: [], backgroundColor: '#fbcb09', borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } } };
  applicationsChartConfig: ChartConfiguration = {
    type: 'doughnut',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#fbcb09', '#22c55e', '#D70D0D'] }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#ffffff' } }
      }
    }
  };

  // Line chart — Orders
  ordersChart: any = { series: [], chart: { type: 'line' }, xaxis: { categories: [] } };

  // Area chart — Revenue
  revenueChart: any = { series: [], chart: { type: 'area' }, xaxis: { categories: [] } };

  // Donut — Products by category
  categoryChart: any = { series: [], labels: [], chart: { type: 'donut' } };

  // Bar — Top products
  topProductsChart: any = { series: [], chart: { type: 'bar' }, xaxis: { categories: [] } };

  // Line — New users
  usersChart: any = { series: [], chart: { type: 'line' }, xaxis: { categories: [] } };

  // Donut — Job applications
  applicationsChart: any = { series: [], labels: [], chart: { type: 'donut' } };

  constructor(private stats_service: StatsService, private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.stats_service.getstats().subscribe({
      next: (res) => {
        this.stats = res
        console.log('nice', res)
      },
      error: (err) => {
        console.log("error")
      }
    })
    this.loadAll();
    // Keep data reasonably fresh without making the dashboard feel like it reloads constantly.
    this.refreshSub = interval(this.refreshMs).subscribe(() => this.loadAll());
  }

  export(): void {
    this.stats_service.exportfile().subscribe({
      next: (blob: Blob) => {
        console.log('exportfile response (Blob):', blob);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stats.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.log('Export failed', err)
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadAll(): void {
    // Stats
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        console.log('getStats response:', res);
        this.stats = res ?? { totalUsers: 0, totalOrders: 0, totalRevenue: 0, totalProducts: 0 };
      },
      error: (err) => console.error('getStats failed:', err)
    });

    // Orders per day
    this.dashboardService.getOrdersPerDay().subscribe({
      next: (res) => {
        console.log('getOrdersPerDay response:', res);
        const rows = Array.isArray(res) ? res : [];
        this.ordersChart = {
          series: [{ name: 'Orders', data: rows.map((r: any) => Number(r.count ?? 0)) }],
          chart: { type: 'line', height: 250, toolbar: { show: false }, animations: { enabled: true } },
          stroke: { curve: 'smooth', width: 3 },
          colors: ['#0D8DD7'],
          xaxis: { categories: rows.map((r: any) => String(r.date ?? '')) },
          grid: { borderColor: '#f1f1f1' },
          tooltip: { theme: 'light' }
        };
        // Reassign config object so ng2-charts detects the update immediately.
        this.ordersChartConfig = {
          ...this.ordersChartConfig,
          data: {
            labels: rows.map((r: any) => String(r.date ?? '')),
            datasets: [{
              ...(this.ordersChartConfig.data?.datasets?.[0] ?? {}),
              label: 'Orders',
              data: rows.map((r: any) => Number(r.count ?? 0))
            }]
          }
        };
      },
      error: (err) => console.error('getOrdersPerDay failed:', err)
    });

    // Revenue per day
    this.dashboardService.getRevenuePerDay().subscribe({
      next: (res) => {
        console.log('getRevenuePerDay response:', res);
        const rows = Array.isArray(res) ? res : [];
        this.revenueChart = {
          series: [{ name: 'Revenue (DNT)', data: rows.map((r: any) => Number(r.revenue ?? 0)) }],
          chart: { type: 'area', height: 250, toolbar: { show: false }, animations: { enabled: true } },
          stroke: { curve: 'smooth', width: 3 },
          fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
          colors: ['#D70D0D'],
          xaxis: { categories: rows.map((r: any) => String(r.date ?? '')) },
          grid: { borderColor: '#f1f1f1' }
        };
        this.revenueChartConfig = {
          ...this.revenueChartConfig,
          data: {
            labels: rows.map((r: any) => String(r.date ?? '')),
            datasets: [{
              ...(this.revenueChartConfig.data?.datasets?.[0] ?? {}),
              label: 'Revenue (DNT)',
              data: rows.map((r: any) => Number(r.revenue ?? 0))
            }]
          }
        };
      },
      error: (err) => console.error('getRevenuePerDay failed:', err)
    });

    // Products by category
    this.dashboardService.getProductsByCategory().subscribe({
      next: (res) => {
        console.log('getProductsByCategory response:', res);
        const rows = Array.isArray(res) ? res : [];
        this.categoryChart = {
          series: rows.map((r: any) => Number(r.count ?? 0)),
          labels: rows.map((r: any) => String(r.category ?? 'Unknown')),
          chart: { type: 'donut', height: 250 },
          colors: ['#D70D0D', '#0D8DD7', '#fbcb09', '#22c55e', '#a855f7'],
          legend: { position: 'bottom' }
        };
        // Update ng2-charts config with a new object so Angular/Chart.js reliably re-renders.
        this.categoryChartConfig = {
          ...this.categoryChartConfig,
          data: {
            labels: rows.map((r: any) => String(r.category ?? 'Unknown')),
            datasets: [{
              data: rows.map((r: any) => Number(r.count ?? 0)),
              backgroundColor: ['#D70D0D', '#0D8DD7', '#fbcb09', '#22c55e', '#a855f7']
            }]
          }
        };
      },
      error: (err) => console.error('getProductsByCategory failed:', err)
    });

    // Top products
    this.dashboardService.getTopProducts().subscribe({
      next: (res) => {
        console.log('getTopProducts response:', res);
        const rows = Array.isArray(res) ? res : [];
        this.topProductsChart = {
          series: [{ name: 'Units Sold', data: rows.map((r: any) => Number(r.total_sold ?? 0)) }],
          chart: { type: 'bar', height: 250, toolbar: { show: false } },
          colors: ['#fbcb09'],
          xaxis: { categories: rows.map((r: any) => String(r.name ?? 'Unknown')) },
          plotOptions: { bar: { borderRadius: 6, horizontal: false } },
          grid: { borderColor: '#f1f1f1' }
        };
        this.topProductsChartConfig = {
          ...this.topProductsChartConfig,
          data: {
            labels: rows.map((r: any) => String(r.name ?? 'Unknown')),
            datasets: [{
              ...(this.topProductsChartConfig.data?.datasets?.[0] ?? {}),
              label: 'Units Sold',
              data: rows.map((r: any) => Number(r.total_sold ?? 0))
            }]
          }
        };
      },
      error: (err) => console.error('getTopProducts failed:', err)
    });

    // Users per day
    this.dashboardService.getUsersPerDay().subscribe({
      next: (res) => {
        console.log('getUsersPerDay response:', res);
        const rows = Array.isArray(res) ? res : [];
        this.usersChart = {
          series: [{ name: 'New Users', data: rows.map((r: any) => Number(r.count ?? 0)) }],
          chart: { type: 'line', height: 250, toolbar: { show: false } },
          stroke: { curve: 'smooth', width: 3 },
          colors: ['#22c55e'],
          xaxis: { categories: rows.map((r: any) => String(r.date ?? '')) },
          grid: { borderColor: '#f1f1f1' }
        };
        this.usersChartConfig = {
          ...this.usersChartConfig,
          data: {
            labels: rows.map((r: any) => String(r.date ?? '')),
            datasets: [{
              ...(this.usersChartConfig.data?.datasets?.[0] ?? {}),
              label: 'New Users',
              data: rows.map((r: any) => Number(r.count ?? 0))
            }]
          }
        };
      },
      error: (err) => console.error('getUsersPerDay failed:', err)
    });

    // Applications by status
    this.dashboardService.getApplicationsByStatus().subscribe({
      next: (res) => {
        console.log('getApplicationsByStatus response:', res);
        const rows = Array.isArray(res) ? res : [];
        this.applicationsChart = {
          series: rows.map((r: any) => Number(r.count ?? 0)),
          labels: rows.map((r: any) => String(r.status ?? 'Unknown')),
          chart: { type: 'donut', height: 250 },
          colors: ['#fbcb09', '#22c55e', '#D70D0D'],
          legend: { position: 'bottom' }
        };
        // Update ng2-charts config with a new object so Angular/Chart.js reliably re-renders.
        this.applicationsChartConfig = {
          ...this.applicationsChartConfig,
          data: {
            labels: rows.map((r: any) => String(r.status ?? 'Unknown')),
            datasets: [{
              data: rows.map((r: any) => Number(r.count ?? 0)),
              backgroundColor: ['#fbcb09', '#22c55e', '#D70D0D']
            }]
          }
        };
      },
      error: (err) => console.error('getApplicationsByStatus failed:', err)
    });
  }
}
