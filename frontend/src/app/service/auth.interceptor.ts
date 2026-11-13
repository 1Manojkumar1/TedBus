import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LOGGED_IN_USER_KEY } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = '';
  try {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY);
    if (raw) {
      token = JSON.parse(raw)?.credential ?? '';
    }
  } catch {
    token = '';
  }

  if (token && req.url.startsWith(environment.apiUrl)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
