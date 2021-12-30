import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';

import {AuthService} from '../../services/auth.service';
import {UsuariosService} from '../../services/usuarios.service';
import {UsuarioLoginModel} from '../../models/usuario-login.model';

import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  inUsuario: string;
  inPassword: string;

  constructor(private authService: AuthService,
              private usuarioService: UsuariosService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  login() {
    this.spinner.show();
    this.usuarioService.login(this.inUsuario, this.inPassword).subscribe(
      (next: UsuarioLoginModel) => {
        const username = next.userData.usuario;
        const keyPrefix = `CognitoIdentityServiceProvider.${environment.CLIENT_ID}`;
        const idTokenKey = `${keyPrefix}.${username}.idToken`;
        const accessTokenKey = `${keyPrefix}.${username}.accessToken`;
        const refeshTokenKey = `${keyPrefix}.${username}.refreshToken`;
        const userDataKey = `${keyPrefix}.${username}.userData`;
        const lastUserKey = `${keyPrefix}.LastAuthUser`;
        localStorage.clear();
        localStorage.setItem(idTokenKey, next.idToken);
        localStorage.setItem(accessTokenKey, next.accessToken);
        localStorage.setItem(refeshTokenKey, next.refreshToken);
        localStorage.setItem(lastUserKey, username);
        localStorage.setItem(userDataKey, JSON.stringify(next.userData));

        this.router.navigate(['/eventos']);
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
        if (error.error && error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Error al iniciar sesión');
        }
      }
    );
  }

}
