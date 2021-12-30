// angular
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
// utils
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(' - Interceptor URL: ' + req.url);

    let agregaTokenURL = true;

    if (req.url.split('maps.googleapis.com').length > 1) {
      agregaTokenURL = false;
      console.log(' - Se excluye token a la URL: ' + req.url);
    }
    let request = req;

    if (agregaTokenURL) {
      const idToken = this.authService.getIdToken();

      if (idToken) {
        request = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${idToken}`)
        });
        console.log('AuthInterceptor: authorization agregado a peticion.');
      }
    }
    return next.handle(request);
  }

}
