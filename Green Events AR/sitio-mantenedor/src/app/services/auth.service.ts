import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {CognitoRefreshToken, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';

import {UsuarioModel} from '../models/usuario.model';

import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  /**
   * Retorna el CognitoUser logueado
   */
  getCurrentUser(): CognitoUser | null {
    return this.getUserPool().getCurrentUser();
  }

  /**
   * Retorna objeto CognitoUserPool
   */
  getUserPool() {
    return new CognitoUserPool({
      UserPoolId: environment.USER_POOL_ID,
      ClientId: environment.CLIENT_ID,
    });
  }

  /**
   * Devuelve el nombre de usuario logueado,
   * cadena vacía de lo contrario
   */
  getUsername(): string {
    const cognitoUser = this.getCurrentUser();
    if (cognitoUser !== null) {
      return cognitoUser.getUsername();
    } else {
      return '';
    }
  }

  /**
   * Devuelve el prefijo usado en el local storage
   */
  getKeyPrefixWithUsername(): string | null {
    const cognitoUser = this.getCurrentUser();
    if (cognitoUser === null) {
      return null;
    }
    const keyPrefix = `CognitoIdentityServiceProvider.${environment.CLIENT_ID}`;
    const username = cognitoUser.getUsername();
    return `${keyPrefix}.${username}`;
  }

  /**
   * Devuelve el id token de login en cognito
   */
  getIdToken(): string | null {
    const keyPrefixWithUsername = this.getKeyPrefixWithUsername();
    if (keyPrefixWithUsername === null) {
      return null;
    }
    const idTokenKey = `${keyPrefixWithUsername}.idToken`;
    return localStorage.getItem(idTokenKey);
  }

  /**
   * Devuelve el usuario logueado o null si no existe uno
   */
  getUserData(): any | null {
    const keyPrefixWithUsername = this.getKeyPrefixWithUsername();
    if (keyPrefixWithUsername === null) {
      return null;
    }
    const userDataKey = `${keyPrefixWithUsername}.userData`;
    const jsonUserData = localStorage.getItem(userDataKey);
    if (jsonUserData === null) {
      return null;
    }
    return JSON.parse(jsonUserData);
  }

  /**
   * Devuelve si está autenticado
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  refreshTokens(): Observable<any> {
    return new Observable(observer => {
      const cognitoUser: CognitoUser = this.getCurrentUser();
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.log(err);
        } else {
          const refreshToken = new CognitoRefreshToken({RefreshToken: session.getRefreshToken().token});
          cognitoUser.refreshSession(refreshToken, (error, result) => {
            if (error) {
              console.log(error);
              observer.error('Error al refrescar token.');
            } else {
              observer.next('Tokens actualizados correctamente.');
              observer.complete();
            }
          });
        }
      });
    });
  }

}
