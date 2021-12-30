import {Component, OnInit} from '@angular/core';

import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';

import {EventosService} from '../../services/eventos.service';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css']
})
export class IngresoComponent implements OnInit {

  titulo: string;

  codigo: string;
  email: string;

  tabActivate: string = 'email';

  constructor(
    private eventosService: EventosService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.cargarEvento();
  }

  cargarEvento(): void {
    this.spinner.show();
    this.eventosService.buscarEvento().subscribe(
      (next: any) => {
        console.log(next);
        this.titulo = next.titulo;
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.toastr.warning('No es posible cargar los datos de evento');
        this.spinner.hide();
      }
    );
  }

  ingresar(): void {
    if (this.tabActivate === 'email' && !this.email) {
      this.toastr.warning('Debes ingresar el correo electrónico');
    } else if (this.tabActivate === 'codigo' && !this.codigo) {
      this.toastr.warning('Debes ingresar el código de ticket');
    } else {
      this.spinner.show();
      this.eventosService.validarIngreso(this.codigo, this.email).subscribe(
        (next: any) => {
          this.eventosService.registrarTicket(next);
          this.spinner.hide();
        },
        (error: any) => {
          this.spinner.hide();
          if (error.status === 404) {
            this.toastr.error('Código ticket o correo electrónico no registrado en evento');
          } else {
            this.toastr.error('Ocurrio un error al validar el ingreso al evento.');
          }
        }
      );
    }
  }

  setTabActive(nombre: string): void {
    this.codigo = '';
    this.email = '';
    this.tabActivate = nombre;
  }

}
