import { Injectable, signal, computed } from '@angular/core';
import { ManagedVps, ScpMonitor, VpsStatusMap, QbittorrentInstance, VertexDownloader } from '../models/vps.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // --- PRIVATE STATE ---
  private managedVps = signal<ManagedVps[]>([]);

  // --- PUBLIC READ-ONLY STATE ---
  public managedVpsList = this.managedVps.asReadonly();
  
  constructor() {
    this.initializeState();
    // Simulate the automation check loop
    setInterval(() => this.runAutomationCheck(), 10000); // Check every 10 seconds
  }

  private async initializeState() {
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
  }

  private async runAutomationCheck() {
    console.log('Running automation check...');
    const newScpStatus = await this.getVpsStatus(true); // Get updated, potentially changed status

    this.managedVps.update(currentVpsList => {
      return currentVpsList.map(vps => {
        const newStatus = newScpStatus.find(s => s.ip === vps.ip);
        if (!newStatus) return vps; // Should not happen

        const wasThrottled = vps.scp.status === 'Throttled';
        const isThrottled = newStatus.status === 'Throttled';
        
        const updatedVps = { ...vps, scp: newStatus };

        // State change: Healthy -> Throttled
        if (isThrottled && !wasThrottled) {
          console.log(`VPS ${vps.name} is now throttled. Applying policies.`);
          if (updatedVps.qbittorrent) {
            updatedVps.qbittorrent = { ...updatedVps.qbittorrent, status: 'PAUSED_BY_AUTOMATION' };
          }
          if (updatedVps.vertex) {
            updatedVps.vertex = { ...updatedVps.vertex, enabled: false };
          }
        }

        // State change: Throttled -> Healthy
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
  
  // --- Public methods for manual interaction from components ---

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

  // --- MOCK BACKEND DATA FETCHING ---

  // Simulates fetching from the backend API described by the user
  private async getVpsStatus(randomize: boolean = false): Promise<ScpMonitor[]> {
    // This state can be flipped by the automation check to simulate throttling
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

    await new Promise(resolve => setTimeout(resolve, 250)); // Simulate network delay

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
      { ip: '10.0.0.5', vpsName: 'Non-Netcup-Seedbox', status: 'ONLINE', upload: 150.0, download: 45.0, todayUpload: '500 GB', todayDownload: '150 GB' }, // This one should be ignored
    ];
  }

  private getVertexDownloaders(): VertexDownloader[] {
    return [
      { ip: '192.168.1.101', alias: 'VPS-DE-01', id: 'vtx-001', enabled: true },
      { ip: '192.168.1.102', alias: 'VPS-DE-02', id: 'vtx-002', enabled: true },
      { ip: '10.0.0.8', alias: 'Non-Netcup-Downloader', id: 'vtx-003', enabled: true }, // This one should be ignored
    ];
  }
}
