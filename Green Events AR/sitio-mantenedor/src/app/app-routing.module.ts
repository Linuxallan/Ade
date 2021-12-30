import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LoginComponent} from './components/login/login.component';
import {EventosComponent} from './components/eventos/eventos.component';
import {RoleGuardService} from './services/role-guard.service';
import {UsuariosComponent} from './components/usuarios/usuarios.component';
import {CrearEventoComponent} from './components/crear-evento/crear-evento.component';
import {EditarEventoComponent} from './components/editar-evento/editar-evento.component';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'eventos',
    component: EventosComponent,
    canActivate: [RoleGuardService]
  },
  {
    path: 'evento',
    component: CrearEventoComponent,
    canActivate: [RoleGuardService]
  },
  {
    path: 'evento/:id',
    component: EditarEventoComponent,
    canActivate: [RoleGuardService]
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [RoleGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
