import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Customer, CustomerService } from './customer.service';

export const LOGGED_IN_USER_KEY = 'Loggedinuser';

export interface AuthUser {
  _id?: string;
  googleId?: string;
  credential?: string;
  name: string;
  email: string;
  picture?: string;
  phoneNumber?: string;
  gender?: string;
  dob?: string;
}

interface GoogleCredentialPayload {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  exp?: number;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly clientId = environment.googleClientId;
  readonly configured =
    this.clientId.endsWith('.apps.googleusercontent.com') &&
    !this.clientId.startsWith('YOUR_');

  private readonly userstate = signal<AuthUser | null>(this.readuser());
  readonly user = this.userstate.asReadonly();
  readonly isloggedin = computed(() => this.userstate() !== null);
  readonly firstname = computed(
    () => this.userstate()?.name?.trim().split(/\s+/)[0] || 'Account'
  );

  private readonly customerservice = inject(CustomerService);
  private googleload?: Promise<boolean>;

  /** Validates a Google ID token and starts the session. */
  signin(credential: string): boolean {
    const payload = decodejwt(credential);
    if (!payload?.sub || !payload.email) {
      return false;
    }

    if (payload.aud !== this.clientId) {
      console.error('Google sign-in rejected: token was issued for another client');
      return false;
    }

    if (payload.exp !== undefined && payload.exp * 1000 <= Date.now()) {
      console.error('Google sign-in rejected: token has expired');
      return false;
    }

    const email = payload.email;
    const user: AuthUser = {
      googleId: payload.sub,
      name: payload.name?.trim() || email.split('@')[0],
      email,
      picture: payload.picture,
      credential,
    };

    sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
    this.userstate.set(user);
    return true;
  }

  /**
   * Creates or finds the customer in MongoDB so the session carries the
   * database `_id` that bookings are linked to. If the API is unreachable the
   * user stays signed in locally.
   */
  synccustomer(): void {
    const current = this.userstate();
    if (!current) {
      return;
    }

    this.customerservice
      .addcustomermongo({
        name: current.name,
        email: current.email,
        googleId: current.googleId,
        picture: current.picture,
      })
      .subscribe({
        next: (customer) => this.mergecustomer(customer),
        error: (error) => {
          console.warn('Could not sync the account with the Tedbus API', error);
        },
      });
  }

  logout(): void {
    sessionStorage.removeItem(LOGGED_IN_USER_KEY);
    this.userstate.set(null);
    window.google?.accounts.id.disableAutoSelect();
  }

  /** Resolves once the Google Identity Services script is available. */
  loadgoogle(): Promise<boolean> {
    if (window.google?.accounts?.id) {
      return Promise.resolve(true);
    }

    if (this.googleload) {
      return this.googleload;
    }

    this.googleload = new Promise<boolean>((resolve) => {
      let waited = 0;
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          resolve(true);
          return;
        }

        waited += 100;
        if (waited >= 10000) {
          clearInterval(timer);
          this.googleload = undefined;
          resolve(false);
        }
      }, 100);
    });

    return this.googleload;
  }

  private mergecustomer(customer: Customer): void {
    const current = this.userstate();
    if (!current || !customer?._id) {
      return;
    }

    const merged: AuthUser = {
      ...current,
      _id: customer._id,
      name: customer.name || current.name,
      picture: customer.profilePicture || current.picture,
      credential: current.credential,
    };

    sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(merged));
    this.userstate.set(merged);
  }

  private readuser(): AuthUser | null {
    const userjson = sessionStorage.getItem(LOGGED_IN_USER_KEY);
    if (!userjson) {
      return null;
    }

    try {
      const parsed = JSON.parse(userjson) as AuthUser;
      if (!parsed || typeof parsed !== 'object' || !parsed.email) {
        sessionStorage.removeItem(LOGGED_IN_USER_KEY);
        return null;
      }
      return parsed;
    } catch {
      sessionStorage.removeItem(LOGGED_IN_USER_KEY);
      return null;
    }
  }
}

function decodejwt(token: string): GoogleCredentialPayload | null {
  const encoded = token.split('.')[1];
  if (!encoded) {
    return null;
  }

  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );
    const binary = atob(padded);
    const json = decodeURIComponent(
      Array.from(binary)
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json) as GoogleCredentialPayload;
  } catch {
    return null;
  }
}
