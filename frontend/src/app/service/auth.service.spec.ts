import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService, LOGGED_IN_USER_KEY } from './auth.service';
import { environment } from '../../environments/environment';

function base64url(value: unknown): string {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function token(payload: Record<string, unknown>): string {
  return [
    base64url({ alg: 'none', typ: 'JWT' }),
    base64url(payload),
    'signature',
  ].join('.');
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    aud: environment.googleClientId,
    sub: 'google-123',
    email: 'traveller@example.com',
    name: 'Test Traveller',
    picture: 'https://example.com/avatar.png',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => sessionStorage.clear());

  it('starts signed out', () => {
    expect(service.isloggedin()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('signs in with a valid Google ID token', () => {
    expect(service.signin(token(payload()))).toBe(true);
    expect(service.isloggedin()).toBe(true);
    expect(service.user()?.email).toBe('traveller@example.com');
    expect(service.firstname()).toBe('Test');

    const stored = JSON.parse(sessionStorage.getItem(LOGGED_IN_USER_KEY) ?? 'null');
    expect(stored?.googleId).toBe('google-123');
  });

  it('rejects a token for another client', () => {
    expect(service.signin(token(payload({ aud: 'someone-else.apps.googleusercontent.com' })))).toBe(false);
    expect(service.isloggedin()).toBe(false);
  });

  it('rejects an expired token', () => {
    expect(service.signin(token(payload({ exp: Math.floor(Date.now() / 1000) - 60 })))).toBe(false);
    expect(service.isloggedin()).toBe(false);
  });

  it('rejects a malformed credential', () => {
    expect(service.signin('not-a-jwt')).toBe(false);
    expect(service.isloggedin()).toBe(false);
  });

  it('clears the session on logout', () => {
    service.signin(token(payload()));
    service.logout();

    expect(service.isloggedin()).toBe(false);
    expect(sessionStorage.getItem(LOGGED_IN_USER_KEY)).toBeNull();
  });
});
