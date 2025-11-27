import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TrafficStatsComponent } from './components/traffic-stats/traffic-stats.component';
import { SystemLogsComponent } from './components/system-logs/system-logs.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ToastComponent } from './components/toast/toast.component';

type Page = 'dashboard' | 'traffic' | 'logs' | 'settings';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DashboardComponent,
    TrafficStatsComponent,
    SystemLogsComponent,
    SettingsComponent,
    ToastComponent
  ]
})
export class AppComponent {
  currentPage = signal<Page>('dashboard');

  pages: { id: Page, name: string }[] = [
    { id: 'dashboard', name: '仪表盘' },
    { id: 'traffic', name: '流量统计' },
    { id: 'logs', name: '系统日志' },
    { id: 'settings', name: '配置管理' }
  ];

  changePage(page: Page) {
    this.currentPage.set(page);
  }
}