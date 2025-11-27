import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toastState = signal<ToastMessage | null>(null);
  private timer: any;

  show(message: string, type: ToastType = 'info', duration: number = 3000) {
    this.toastState.set({ message, type });
    
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    this.toastState.set(null);
  }
}