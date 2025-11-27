export interface VpsInfo {
  name: string;
  throttled: boolean;
}

export interface VpsStatusMap {
  [ip: string]: VpsInfo;
}

export interface ScpMonitor {
  name: string;
  ip: string;
  status: 'Healthy' | 'Throttled';
  lastCheck: string;
}

export interface QbittorrentInstance {
  ip: string;
  vpsName: string;
  status: 'ONLINE' | 'PAUSED' | 'PAUSED_BY_AUTOMATION';
  upload: number; // MB/s
  download: number; // MB/s
  todayUpload: string;
  todayDownload: string;
}

export interface VertexDownloader {
  ip: string;
  alias: string;
  id: string;
  enabled: boolean;
}

// A unified model representing a single, managed VPS and its associated services.
export interface ManagedVps {
  ip: string;
  name: string;
  scp: ScpMonitor;
  qbittorrent?: QbittorrentInstance;
  vertex?: VertexDownloader;
}
