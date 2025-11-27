import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { ManagedVps, ScpMonitor, VpsStatusMap, QbittorrentInstance, VertexDownloader } from '../models/vps.model';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // --- INJECTED SERVICES ---
  private settingsService = inject(SettingsService);

  // --- PRIVATE STATE ---
  private managedVps = signal<ManagedVps[]>([]);
  private _loading = signal<boolean>(true);
  private automationIntervalId: any;

  // --- PUBLIC READ-ONLY STATE ---
  public managedVpsList = this.managedVps.asReadonly();
  public loading = this._loading.asReadonly();
  
  constructor() {
    this.initializeState();
    
    // Effect to manage the automation lifecycle based on settings
    effect(() => {
      const automationSettings = this.settingsService.automation();
      
      // Always clear the previous interval when the effect re-runs
      if (this.automationIntervalId) {
        clearInterval(this.automationIntervalId);
      }

      // If automation is enabled, start a new interval with the configured duration
      if (automationSettings.enabled) {
        console.log(`Automation enabled. Checking every ${automationSettings.interval} seconds.`);
        this.automationIntervalId = setInterval(
          () => this.runAutomationCheck(),
          automationSettings.interval * 1000
        );
      } else {
        console.log('Automation disabled.');
      }
    });
  }

  private async initializeState() {
    this._loading.set(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const scpStatus = await this.getVpsStatus();
    const qbitInstances = this.getQbittorrentInstances();
    const vertexInstances = this.getVertexDownloaders();

    const vpsList = scpStatus.map(scp => {
      const vps: ManagedVps = {
        ip: scp.ip,
        name: scp.name,
        scp: scp,
        qbittorrent: qbitInstances.find(q => q.ip === scp.ip),
        vertex: vertexInstances.find(v => v.ip === scp.ip)
      };
      return vps;
    });

    this.managedVps.set(vpsList);
    this._loading.set(false);
  }

  private async runAutomationCheck() {
    console.log('Running automation check...');
    const newScpStatus = await this.getVpsStatus(true);

    this.managedVps.update(currentVpsList => {
      return currentVpsList.map(vps => {
        const newStatus = newScpStatus.find(s => s.ip === vps.ip);
        if (!newStatus) return vps;

        const wasThrottled = vps.scp.status === 'Throttled';
        const isThrottled = newStatus.status === 'Throttled';
        
        const updatedVps = { ...vps, scp: newStatus };

        if (isThrottled && !wasThrottled) {
          console.log(`VPS ${vps.name} is now throttled. Applying policies.`);
          if (updatedVps.qbittorrent) {
            updatedVps.qbittorrent = { ...updatedVps.qbittorrent, status: 'PAUSED_BY_AUTOMATION' };
          }
          if (updatedVps.vertex) {
            updatedVps.vertex = { ...updatedVps.vertex, enabled: false };
          }
        }

        if (!isThrottled && wasThrottled) {
           console.log(`VPS ${vps.name} is now healthy. Restoring services.`);
           if (updatedVps.qbittorrent?.status === 'PAUSED_BY_AUTOMATION') {
             updatedVps.qbittorrent = { ...updatedVps.qbittorrent, status: 'ONLINE' };
           }
           if (updatedVps.vertex) {
             updatedVps.vertex = { ...updatedVps.vertex, enabled: true };
           }
        }
        
        return updatedVps;
      });
    });
  }
  
  public toggleQbit(ip: string) {
    this.managedVps.update(list => list.map(vps => {
      if (vps.ip === ip && vps.qbittorrent && vps.qbittorrent.status !== 'PAUSED_BY_AUTOMATION') {
        const newStatus = vps.qbittorrent.status === 'ONLINE' ? 'PAUSED' : 'ONLINE';
        return { ...vps, qbittorrent: { ...vps.qbittorrent, status: newStatus } };
      }
      return vps;
    }));
  }

  public toggleVertex(ip: string) {
     this.managedVps.update(list => list.map(vps => {
      if (vps.ip === ip && vps.vertex) {
        return { ...vps, vertex: { ...vps.vertex, enabled: !vps.vertex.enabled } };
      }
      return vps;
    }));
  }

  private async getVpsStatus(randomize: boolean = false): Promise<ScpMonitor[]> {
    const mockThrottledState: { [key: string]: boolean } = {
        "192.168.1.102": false 
    };
    
    if (randomize && Math.random() > 0.5) {
        mockThrottledState["192.168.1.102"] = !mockThrottledState["192.168.1.102"];
    }

    const mockBackendResponse: VpsStatusMap = {
      "192.168.1.101": { name: "VPS-DE-01", throttled: false },
      "192.168.1.102": { name: "VPS-DE-02", throttled: mockThrottledState["192.168.1.102"] },
      "192.168.2.55": { name: "VPS-FIN-01", throttled: false },
    };

    await new Promise(resolve => setTimeout(resolve, 250));

    const now = new Date();
    const transformedData: ScpMonitor[] = Object.entries(mockBackendResponse).map(([ip, data], index): ScpMonitor => {
      const checkTime = new Date(now.getTime() - index * 1000 * 15); 
      return {
        ip: ip,
        name: data.name,
        status: data.throttled ? 'Throttled' : 'Healthy',
        lastCheck: `${checkTime.getFullYear()}-${String(checkTime.getMonth() + 1).padStart(2, '0')}-${String(checkTime.getDate()).padStart(2, '0')} ${String(checkTime.getHours()).padStart(2, '0')}:${String(checkTime.getMinutes()).padStart(2, '0')}:${String(checkTime.getSeconds()).padStart(2, '0')}`
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return transformedData;
  }

  private getQbittorrentInstances(): QbittorrentInstance[] {
    return [
      { ip: '192.168.1.101', vpsName: 'VPS-DE-01', status: 'ONLINE', upload: 50.3, download: 12.1, todayUpload: '250 GB', todayDownload: '80 GB' },
      { ip: '192.168.1.102', vpsName: 'VPS-DE-02', status: 'ONLINE', upload: 0, download: 0, todayUpload: '1.2 TB', todayDownload: '300 GB' },
      { ip: '192.168.2.55', vpsName: 'VPS-FIN-01', status: 'ONLINE', upload: 75.5, download: 22.1, todayUpload: '310 GB', todayDownload: '95 GB' },
      { ip: '10.0.0.5', vpsName: 'Non-Netcup-Seedbox', status: 'ONLINE', upload: 150.0, download: 45.0, todayUpload: '500 GB', todayDownload: '150 GB' },
    ];
  }

  private getVertexDownloaders(): VertexDownloader[] {
    return [
      { ip: '192.168.1.101', alias: 'VPS-DE-01', id: 'vtx-001', enabled: true },
      { ip: '192.168.1.102', alias: 'VPS-DE-02', id: 'vtx-002', enabled: true },
      { ip: '10.0.0.8', alias: 'Non-Netcup-Downloader', id: 'vtx-003', enabled: true },
    ];
  }
}
