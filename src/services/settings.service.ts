import { Injectable, signal } from '@angular/core';

export interface ScpAccount {
  id: number;
  login: string;
  password: '•••'; // Display only
  status: 'Active' | 'Inactive';
}

export interface NotificationSettings {
  telegramToken: string;
  chatId: string;
}

export interface AutomationSettings {
  interval: number;
  action: 'pause' | 'limit' | 'notify';
  enabled: boolean;
}

export interface IntegrationSettings {
  qbitUser: string;
  qbitPass: string;
  vertexPath: string;
  apiEndpoint: string;
}

const SETTINGS_KEY = 'netcup-sentinel-settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  scpAccounts = signal<ScpAccount[]>([]);
  
  notifications = signal<NotificationSettings>({
    telegramToken: '',
    chatId: ''
  });
  
  automation = signal<AutomationSettings>({
    interval: 300,
    action: 'pause',
    enabled: true
  });
  
  integrations = signal<IntegrationSettings>({
    qbitUser: 'admin',
    qbitPass: '',
    vertexPath: '/etc/vertex/config.json',
    apiEndpoint: 'http://localhost:8000/api'
  });

  constructor() {
    this.loadSettings();
  }

  addScpAccount(login: string) {
    this.scpAccounts.update(accounts => {
      const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
      const newAccount: ScpAccount = { id: newId, login, password: '•••', status: 'Inactive' };
      return [...accounts, newAccount];
    });
  }

  removeScpAccount(accountId: number) {
    this.scpAccounts.update(accounts => accounts.filter(a => a.id !== accountId));
  }

  private loadSettings() {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.scpAccounts) this.scpAccounts.set(parsed.scpAccounts);
        if (parsed.notifications) this.notifications.set(parsed.notifications);
        if (parsed.automation) this.automation.set(parsed.automation);
        if (parsed.integrations) this.integrations.set(parsed.integrations);
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
  }

  saveSettings() {
    try {
      const settingsToSave = {
        scpAccounts: this.scpAccounts(),
        notifications: this.notifications(),
        automation: this.automation(),
        integrations: this.integrations()
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }
}
