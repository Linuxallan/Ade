import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Router} from '@angular/router';

import {ToastrService} from 'ngx-toastr';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {AuthInterceptor} from './auth.interceptor';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthInterceptor,
              private toastr: ToastrService,
              private router: Router,
              private spinner: NgxSpinnerService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('request HttpRequest', request);
    console.log('next HttpHandler', next)
    const newReq = request.clone();
    return next.handle(request).pipe(catchError(err => {
      console.log('next.handle', request);
      console.log('error interceptor', err);
      if (err.status === 401 && (err.error.message === 'Unauthorized' || err.error.message === 'The incoming token has expired')) {

        localStorage.clear();
        this.spinner.hide();
        this.toastr.warning('Su sesión ha caducado.');
        this.router.navigate(['/login']);

      } else if (err.status === 502 || err.status === 501) {
        this.toastr.error('Ocurrio un error en la peticion de información al servidor, favor vuelva a intentar.');
        // this.toastr.error('Su sesión ha caducado.');
        // window.location.href = `${environment.URL_SIGNOUT}?callback=${environment.URL_AUTH}&code=${environment.CLIENT_ID}`;
      }

      const error: HttpErrorResponse = err;
      error.error.message = error.error.message || error.statusText;
      return throwError(error);
    }));
  }
}
