import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {LOCALE_ID, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {NgxSpinnerModule} from 'ngx-spinner';
import {ToastrModule} from 'ngx-toastr';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {LoginComponent} from './components/login/login.component';
import {EventosComponent} from './components/eventos/eventos.component';
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {UsuariosComponent} from './components/usuarios/usuarios.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AuthInterceptor} from './interceptors/auth.interceptor';
import {ErrorInterceptor} from './interceptors/error.interceptor';
import {CrearEventoComponent} from './components/crear-evento/crear-evento.component';
import {EditarEventoComponent} from './components/editar-evento/editar-evento.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EventosComponent,
    HeaderComponent,
    FooterComponent,
    UsuariosComponent,
    CrearEventoComponent,
    EditarEventoComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      closeButton: true,
    }),
    BrowserAnimationsModule,
    NgbModule
  ],
  providers: [{
    provide: LOCALE_ID,
    useValue: 'es-CL'
  },
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
