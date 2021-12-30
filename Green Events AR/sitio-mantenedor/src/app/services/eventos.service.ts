import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';

import {EventoModel} from '../models/evento.model';

import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  headers: any = {'Content-Type': 'application/json'};

  constructor(private http: HttpClient) {
  }

  listar(): Observable<EventoModel[]> {
    return this.http.get<EventoModel[]>(`${environment.API_DOMAIN}/evento/listar`);
  }

  buscar(codigo: string): Observable<EventoModel[]> {
    return this.http.get<EventoModel[]>(`${environment.API_DOMAIN}/evento/buscar/${codigo}`);
  }

  eliminar(codigo: string): Observable<any> {
    return this.http.get<any>(`${environment.API_DOMAIN}/evento/eliminar/${codigo}`);
  }

  async validar(data: any): Promise<any> {
    const url = environment.API_DOMAIN + '/evento/validar';
    const body = JSON.stringify({
      id: data.id
    });

    return await this.http.post<any>(url, body, {headers: this.headers}).toPromise();
  }

  async crearEvento(data: any): Promise<any> {
    const url = environment.API_DOMAIN + '/evento/crear';
    const body = JSON.stringify(data);

    return await this.http.post<any>(url, body, {headers: this.headers}).toPromise();
  }

  async editarEvento(data: any): Promise<any> {
    const url = environment.API_DOMAIN + '/evento/editar';
    const body = JSON.stringify(data);

    return await this.http.post<any>(url, body, {headers: this.headers}).toPromise();
  }

  async subirArhivos(data: any): Promise<any> {
    const body: any = {
      id: data.id,
      totalExp: data.experiencias.length
    };

    const url = `${environment.API_DOMAIN}/evento/generar-urls`;
    const response: any = await this.http.post<any>(url, body, {responseType: 'json'}).toPromise();
    console.log(response);

    if (data.imagen) {
      await fetch(response.url, {
        method: 'PUT',
        body: new Blob([data.imagen], {type: 'binary/octet-stream'})
      });

      data.keyPath = response.path;
      data.keyHeader = response.key;
    }

    delete data.imagen;
    delete data.imagenIn;

    for (let i = 0; i < data.experiencias.length; i++) {
      if (data.experiencias[i].modelo) {
        await fetch(response.modelos[i].url, {
          method: 'PUT',
          body: new Blob([data.experiencias[i].modelo], {type: 'binary/octet-stream'})
        });

        data.experiencias[i].keyModelo = response.modelos[i].key;
      }

      data.experiencias[i].index = i;
      delete data.experiencias[i].modelo;
      delete data.experiencias[i].modeloIn;
    }

    return data;
  }

}
