import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {EventosService} from './eventos.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(private eventosService: EventosService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.eventosService.validarTicket()) {
      return true;
    } else {
      this.router.navigate(['ingreso']);
      return false;
    }
  }
}
