import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const url = req.url.toLowerCase();
  if (url.includes('/auth') || url.includes('/sifen') || url.includes('/fe')) {
    console.log('SIFEN INTERCEPTOR', req.url);
  }
  const isLoginEndpoint = url.includes('/auth/login');
  const isPublicRegisterEndpoint = url.endsWith('/auth/register');
  const isPublicAuthEndpoint = isLoginEndpoint || isPublicRegisterEndpoint;

  if (isPublicAuthEndpoint || !token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
