import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  
  scpAccounts = signal([
    { id: 1, login: 'user123', password: '•••', status: 'Active' },
    { id: 2, login: 'user456', password: '•••', status: 'Inactive' }
  ]);
  
  notifications = signal({
    telegramToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
    chatId: '-1001234567890'
  });
  
  automation = signal({
    interval: 300,
    action: 'pause',
    enabled: true
  });
  
  integrations = signal({
    qbitUser: 'admin',
    qbitPass: '••••••••',
    vertexPath: '/etc/vertex/config.json',
    apiEndpoint: 'http://localhost:8000/api'
  });

  // State for the new account form
  showAddAccountForm = signal(false);
  newAccountLogin = signal('');
  newAccountPassword = signal('');

  addAccount() {
    const login = this.newAccountLogin().trim();
    const password = this.newAccountPassword().trim();

    if (!login || !password) {
      alert('登录名和密码不能为空');
      return;
    }

    const newId = this.scpAccounts().length > 0 ? Math.max(...this.scpAccounts().map(a => a.id)) + 1 : 1;
    this.scpAccounts.update(accounts => [...accounts, { id: newId, login, password: '•••', status: 'Inactive' }]);

    // Reset and hide form
    this.newAccountLogin.set('');
    this.newAccountPassword.set('');
    this.showAddAccountForm.set(false);
  }

  removeAccount(accountId: number) {
    this.scpAccounts.update(accounts => accounts.filter(a => a.id !== accountId));
  }
  
  testNotification() {
    alert('正在发送测试通知...');
  }

  saveSettings() {
    alert('设置已保存！');
  }
}
