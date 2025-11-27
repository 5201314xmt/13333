import { Injectable, signal } from '@angular/core';

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

  private loadSettings() {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.notifications.set(parsed.notifications);
        this.automation.set(parsed.automation);
        this.integrations.set(parsed.integrations);
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
  }

  saveSettings() {
    try {
      const settingsToSave = {
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
