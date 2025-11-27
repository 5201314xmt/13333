import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  source: 'SCP' | 'qBittorrent' | 'Vertex' | 'System';
  message: string;
}

@Component({
  selector: 'app-system-logs',
  imports: [CommonModule, FormsModule],
  templateUrl: './system-logs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemLogsComponent {
  private allLogs = signal<LogEntry[]>([
    { timestamp: '2024-07-29 10:30:15', level: 'INFO', source: 'SCP', message: 'Checked VPS-DE-01, status: Healthy' },
    { timestamp: '2024-07-29 10:29:45', level: 'WARN', source: 'SCP', message: 'Checked VPS-DE-02, status: Throttled. Applying automation policy.' },
    { timestamp: '2024-07-29 10:29:46', level: 'INFO', source: 'qBittorrent', message: 'Pausing all torrents on VPS-DE-02.' },
    { timestamp: '2024-07-29 10:28:00', level: 'INFO', source: 'Vertex', message: 'Disabled downloader Vertex-Backup as per schedule.' },
    { timestamp: '2024-07-29 10:25:00', level: 'INFO', source: 'System', message: 'Scheduled task runner initiated.' },
    { timestamp: '2024-07-29 10:20:00', level: 'ERROR', source: 'qBittorrent', message: 'Failed to connect to qBittorrent API on VPS-FIN-02.' },
    { timestamp: '2024-07-29 10:15:10', level: 'INFO', source: 'SCP', message: 'Checked VPS-FIN-01, status: Healthy' },
  ]);
  
  keyword = signal('');

  filteredLogs = computed(() => {
    const search = this.keyword().toLowerCase();
    if (!search) return this.allLogs();

    return this.allLogs().filter(log => 
      log.message.toLowerCase().includes(search) ||
      log.source.toLowerCase().includes(search) ||
      log.level.toLowerCase().includes(search)
    );
  });

  getLevelClass(level: 'INFO' | 'WARN' | 'ERROR'): string {
    switch(level) {
      case 'INFO': return 'text-blue-400';
      case 'WARN': return 'text-yellow-400';
      case 'ERROR': return 'text-red-500';
      default: return 'text-gray-400';
    }
  }
}