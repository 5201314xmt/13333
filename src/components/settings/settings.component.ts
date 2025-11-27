import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { SettingsService, AutomationSettings } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private toastService = inject(ToastService);
  private settingsService = inject(SettingsService);
  
  // Expose signals from the service to the template
  notifications = this.settingsService.notifications;
  automation = this.settingsService.automation;
  integrations = this.settingsService.integrations;

  // Local state for UI management (e.g., forms)
  scpAccounts = signal([
    { id: 1, login: 'user123', password: '•••', status: 'Active' },
    { id: 2, login: 'user456', password: '•••', status: 'Inactive' }
  ]);
  showAddAccountForm = signal(false);
  newAccountLogin = signal('');
  newAccountPassword = signal('');

  addAccount() {
    const login = this.newAccountLogin().trim();
    const password = this.newAccountPassword().trim();

    if (!login || !password) {
      this.toastService.show('登录名和密码不能为空', 'error');
      return;
    }

    const newId = this.scpAccounts().length > 0 ? Math.max(...this.scpAccounts().map(a => a.id)) + 1 : 1;
    this.scpAccounts.update(accounts => [...accounts, { id: newId, login, password: '•••', status: 'Inactive' }]);

    this.toastService.show(`账号 ${login} 已添加`, 'success');

    this.newAccountLogin.set('');
    this.newAccountPassword.set('');
    this.showAddAccountForm.set(false);
  }

  removeAccount(accountId: number) {
    this.scpAccounts.update(accounts => accounts.filter(a => a.id !== accountId));
    this.toastService.show('账号已删除', 'success');
  }
  
  testNotification() {
    this.toastService.show('正在发送测试通知...', 'info');
    setTimeout(() => {
        this.toastService.show('测试通知发送成功!', 'success');
    }, 1500);
  }

  saveSettings() {
    this.settingsService.saveSettings();
    this.toastService.show('设置已保存！', 'success');
  }

  // --- Event Handlers for Settings Forms ---

  handleNotificationsInput(event: Event, field: 'telegramToken' | 'chatId') {
    const value = (event.target as HTMLInputElement).value;
    this.notifications.update(n => ({ ...n, [field]: value }));
  }

  handleAutomationToggle(event: Event) {
    const enabled = (event.target as HTMLInputElement).checked;
    this.automation.update(a => ({ ...a, enabled }));
  }

  handleAutomationInput(event: Event, field: 'interval') {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value)) {
      this.automation.update(a => ({ ...a, [field]: value }));
    }
  }

  handleAutomationSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value as AutomationSettings['action'];
    this.automation.update(a => ({ ...a, action: value }));
  }

  handleIntegrationsInput(event: Event, field: 'qbitUser' | 'qbitPass' | 'vertexPath' | 'apiEndpoint') {
    const value = (event.target as HTMLInputElement).value;
    this.integrations.update(i => ({ ...i, [field]: value }));
  }
}
