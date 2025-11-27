import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TrafficRecord {
  date: string;
  instance: string;
  ip: string;
  vertexAlias: string;
  upload: number; // in GB
  download: number; // in GB
}

@Component({
  selector: 'app-traffic-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './traffic-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrafficStatsComponent {
  
  // Mock Data
  private allTraffic = signal<TrafficRecord[]>([
    { date: '2024-07-29', instance: 'VPS-DE-01', ip: '192.168.1.101', vertexAlias: 'Vertex-Main', upload: 250, download: 80 },
    { date: '2024-07-29', instance: 'VPS-DE-02', ip: '192.168.1.102', vertexAlias: 'Vertex-Main', upload: 1200, download: 300 },
    { date: '2024-07-29', instance: 'VPS-FIN-01', ip: '192.168.2.55', vertexAlias: 'Vertex-Backup', upload: 310, download: 95 },
    { date: '2024-07-28', instance: 'VPS-DE-01', ip: '192.168.1.101', vertexAlias: 'Vertex-Main', upload: 240, download: 75 },
    { date: '2024-07-28', instance: 'VPS-DE-02', ip: '192.168.1.102', vertexAlias: 'Vertex-Main', upload: 1150, download: 280 },
    { date: '2024-07-28', instance: 'VPS-FIN-01', ip: '192.168.2.55', vertexAlias: 'Vertex-Backup', upload: 300, download: 90 },
    { date: '2024-07-27', instance: 'VPS-DE-01', ip: '192.168.1.101', vertexAlias: 'Vertex-Main', upload: 260, download: 85 },
  ]);

  // Filter Signals
  startDate = signal('');
  endDate = signal('');
  keyword = signal('');
  
  // Computed property for filtered traffic
  filteredTraffic = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    const search = this.keyword().toLowerCase();
    
    return this.allTraffic().filter(record => {
      const recordDate = new Date(record.date);
      const isAfterStart = !start || recordDate >= new Date(start);
      const isBeforeEnd = !end || recordDate <= new Date(end);
      const matchesKeyword = !search ||
        record.instance.toLowerCase().includes(search) ||
        record.ip.toLowerCase().includes(search) ||
        record.vertexAlias.toLowerCase().includes(search);
        
      return isAfterStart && isBeforeEnd && matchesKeyword;
    });
  });
  
  // Computed properties for total upload/download
  totalUpload = computed(() => {
    return this.filteredTraffic().reduce((sum, record) => sum + record.upload, 0);
  });
  
  totalDownload = computed(() => {
    return this.filteredTraffic().reduce((sum, record) => sum + record.download, 0);
  });

  formatBytes(gb: number): string {
    if (gb > 1024) {
      return (gb / 1024).toFixed(2) + ' TB';
    }
    return gb.toFixed(2) + ' GB';
  }
}