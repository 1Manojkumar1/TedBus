import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly isOpen = signal<boolean>(false);
  readonly options = signal<ConfirmDialogOptions>({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
  });

  private resolveCallback: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    this.options.set({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'warning',
      ...options,
    });
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  handleConfirm(): void {
    this.isOpen.set(false);
    if (this.resolveCallback) {
      this.resolveCallback(true);
      this.resolveCallback = null;
    }
  }

  handleCancel(): void {
    this.isOpen.set(false);
    if (this.resolveCallback) {
      this.resolveCallback(false);
      this.resolveCallback = null;
    }
  }
}
