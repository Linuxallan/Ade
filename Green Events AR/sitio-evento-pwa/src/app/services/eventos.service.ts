import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

import {Observable} from 'rxjs';

import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  storageName: string = 'Participante';

  headers: any = {
    'Content-Type': 'application/json',
    'Evento': String(environment.EVENTO)
  };

  constructor(
    private http: HttpClient,
    private router: Router) {
  }

  buscarEvento(): Observable<any> {
    return this.http.get<any>(`${environment.API_DOMAIN}/evento/buscar`,
      {headers: this.headers});
  }

  validarIngreso(codigo: string, email: string): Observable<any> {
    const bodyObj: any = {};

    if (codigo) {
      bodyObj.codigo = codigo;
    }

    if (email) {
      bodyObj.email = email;
    }

    const body = JSON.stringify(bodyObj);

    return this.http.post<any>(`${environment.API_DOMAIN}/validar-ticket`,
      body, {headers: this.headers});
  }

  registrarTicket(data: any): void {
    localStorage.setItem(this.storageName, JSON.stringify(data));
    this.router.navigate(['evento']);
  }

  validarTicket(): boolean {
    const data = localStorage.getItem(this.storageName);
    return !!data;
  }

}
