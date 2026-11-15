import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../service/auth.service';
import { ThemeService } from '../../service/theme.service';
import { TranslationService, SupportedLanguage } from '../../service/translation.service';
import { NotificationService } from '../../service/notification.service';
import { TranslatePipe } from '../../service/translate.pipe';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, MatMenuModule, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly auth = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly i18n = inject(TranslationService);
  readonly notificationService = inject(NotificationService);
  readonly showsetup = signal(false);

  private readonly router = inject(Router);
  private readonly googlecontainer = viewChild<ElementRef<HTMLDivElement>>('googlebtn');
  private renderedhost?: HTMLElement;

  constructor() {
    effect(() => {
      if (this.auth.isloggedin()) {
        const user = this.auth.user();
        const customerId = user?._id || user?.googleId || user?.email;
        this.notificationService
          .getNotifications({
            customerId,
            email: user?.email,
            limit: 5,
          })
          .subscribe({ error: () => {} });

        this.notificationService.getPreferences(customerId, user?.email).subscribe({
          next: (prefs) => {
            if (prefs?.preferredLanguage && prefs.preferredLanguage !== this.i18n.currentLanguage()) {
              this.i18n.setLanguage(prefs.preferredLanguage);
            }
          },
          error: () => {},
        });
      }
    });

    effect(() => {
      const host = this.googlecontainer()?.nativeElement;
      if (!host || this.auth.isloggedin() || !this.auth.configured) {
        return;
      }
      void this.rendergooglebutton(host);
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  selectLanguage(lang: SupportedLanguage) {
    this.i18n.setLanguage(lang);
    if (this.auth.isloggedin()) {
      const user = this.auth.user();
      if (user?.email) {
        this.notificationService
          .updatePreferences({
            customerId: user._id || user.googleId || user.email,
            email: user.email,
            preferredLanguage: lang,
          } as any)
          .subscribe({ error: () => {} });
      }
    }
  }

  handlelogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  private async rendergooglebutton(host: HTMLDivElement) {
    if (this.renderedhost === host) {
      return;
    }

    const ready = await this.auth.loadgoogle();
    if (!ready || this.renderedhost === host) {
      console.error('Google Identity Services could not be loaded');
      return;
    }

    const google = window.google;
    if (!google) {
      return;
    }

    google.accounts.id.initialize({
      client_id: this.auth.clientId,
      auto_select: false,
      callback: (response) => {
        if (this.auth.signin(response.credential)) {
          this.auth.synccustomer();
        } else {
          console.error('Google sign-in failed');
        }
      },
    });

    google.accounts.id.renderButton(host, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'left',
      width: 168,
    });

    this.renderedhost = host;
  }
}
