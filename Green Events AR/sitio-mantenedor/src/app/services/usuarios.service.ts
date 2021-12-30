import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';

import {UsuarioLoginModel} from '../models/usuario-login.model';
import {UsuarioModel} from '../models/usuario.model';

import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  headers: any = {'Content-Type': 'application/json'};

  constructor(private http: HttpClient) {

  }

  login(usuario: string, password: string): Observable<UsuarioLoginModel> {
    const url = environment.API_DOMAIN + '/cognito/login';

    const body = JSON.stringify({
      usuario,
      password,
    });

    return this.http.post<UsuarioLoginModel>(url, body, {headers: this.headers});
  }

  listar(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(`${environment.API_DOMAIN}/cognito/listar`);
  }

  guardar(usuario: UsuarioModel): Observable<any> {
    const url = environment.API_DOMAIN + '/cognito/crear-usuario';
    const body = JSON.stringify(usuario);

    return this.http.post<any>(url, body, {headers: this.headers});
  }

  actualizar(usuario: UsuarioModel): Observable<any> {
    const url = environment.API_DOMAIN + '/cognito/editar-usuario';
    const body = JSON.stringify(usuario);

    return this.http.post<any>(url, body, {headers: this.headers});
  }

  eliminar(usuario: UsuarioModel): Observable<any> {
    const url = environment.API_DOMAIN + '/cognito/eliminar-usuario';
    const body = JSON.stringify(usuario);

    return this.http.post<any>(url, body, {headers: this.headers});
  }

}
