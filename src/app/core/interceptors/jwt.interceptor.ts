import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');
  const url = req.url.toLowerCase();
  const isLoginEndpoint = url.includes('/auth/login');
  const isPublicRegisterEndpoint = url.endsWith('/auth/register');
  const isPublicAuthEndpoint = isLoginEndpoint || isPublicRegisterEndpoint;

  const request = isPublicAuthEndpoint || !token
    ? req
    : req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

  return next(request).pipe(
    catchError((error: unknown) => {
      // Sesion vencida o invalida: limpiar y volver al login correspondiente (el 403 lo muestra cada pantalla).
      if (error instanceof HttpErrorResponse && error.status === 401 && !isPublicAuthEndpoint && token) {
        authService.logout();
        const currentUrl = router.url;
        const loginRoute = currentUrl.startsWith('/sifen') ? '/sifen/login' : '/auth';
        if (!currentUrl.startsWith(loginRoute)) {
          router.navigate([loginRoute], { queryParams: { returnUrl: currentUrl } });
        }
      }

      return throwError(() => error);
    })
  );
};
