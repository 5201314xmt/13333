import { Injectable, signal, effect, inject } from '@angular/core';
import { ToastService } from './toast.service';

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
  private toastService = inject(ToastService);
  private saveTimeout: any;
  private isInitialLoad = true;

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

    // Auto-save effect
    effect(() => {
        // This effect will run whenever any of these signals change.
        const settingsToSave = {
            scpAccounts: this.scpAccounts(),
            notifications: this.notifications(),
            automation: this.automation(),
            integrations: this.integrations()
        };

        // Debounce the save operation
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
                // Only show toast if it's not the initial load
                if (!this.isInitialLoad) {
                    this.toastService.show('设置已自动保存', 'success', 2000);
                }
                // Mark initial load as complete after the first "change" (which is the loading itself)
                this.isInitialLoad = false;
            } catch (e) {
                console.error('Failed to save settings to localStorage', e);
                this.toastService.show('无法保存设置', 'error');
            }
        }, 1000); // Wait 1 second after the last change
    });
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
}