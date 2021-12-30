import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {IngresoComponent} from './components/ingreso/ingreso.component';
import {EventoComponent} from './components/evento/evento.component';
import {RoleGuardService} from './services/role-guard.service';

const routes: Routes = [
  {path: '', redirectTo: 'ingreso', pathMatch: 'full'},
  {path: 'ingreso', component: IngresoComponent},
  {path: 'evento', component: EventoComponent, canActivate: [RoleGuardService]}
  // {path: 'evento', component: EventoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
