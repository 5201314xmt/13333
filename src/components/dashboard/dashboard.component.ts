import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ManagedVps } from '../../models/vps.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private apiService = inject(ApiService);
  managedVpsList = this.apiService.managedVpsList;
  loading = this.apiService.loading;

  stats = computed(() => {
    const vpsList = this.managedVpsList();
    
    const totalUpload = vpsList
      .filter(vps => vps.qbittorrent?.status === 'ONLINE')
      .reduce((sum, vps) => sum + (vps.qbittorrent?.upload || 0), 0);
      
    const totalDownload = vpsList
      .filter(vps => vps.qbittorrent?.status === 'ONLINE')
      .reduce((sum, vps) => sum + (vps.qbittorrent?.download || 0), 0);

    return {
      totalVps: vpsList.length,
      throttledVps: vpsList.filter(vps => vps.scp.status === 'Throttled').length,
      totalUpload: totalUpload.toFixed(1),
      totalDownload: totalDownload.toFixed(1),
      activeTorrents: 1340, // Mocked for now
    };
  });

  toggleQbit(ip: string) {
    this.apiService.toggleQbit(ip);
  }

  toggleVertex(ip: string) {
    this.apiService.toggleVertex(ip);
  }
}
