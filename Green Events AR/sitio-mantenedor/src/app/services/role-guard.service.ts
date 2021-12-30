import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';

import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(private auth: AuthService,
              private router: Router) {
  }

  /**
   * Método que determina si se puede acceder a la url
   * evalúando si existe usuario logueado y su id de perfil lo permite
   */
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.auth.isAuthenticated()) {
      this.auth.refreshTokens().subscribe();
      return true;
    } else {
      this.router.navigate(['login']);
    }
  }

}
