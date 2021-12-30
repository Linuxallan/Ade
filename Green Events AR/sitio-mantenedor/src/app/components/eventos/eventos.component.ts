import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {EventosService} from '../../services/eventos.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {EventoModel} from '../../models/evento.model';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {GlobalService} from '../../shared/globals.shared';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css'],
  providers: [GlobalService]
})
export class EventosComponent implements OnInit, OnDestroy {

  @ViewChild('modalConfirmarEliminar') mdlConfirmarEliminar: TemplateRef<any>;

  eventos: EventoModel[];
  evento: EventoModel;

  modalRef: NgbModalRef;
  interval: any;

  constructor(private eventosService: EventosService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService,
              private router: Router,
              private ngbModal: NgbModal,
              private global: GlobalService) {
  }

  ngOnInit(): void {
    this.cargarEventos(true);

    this.interval = setInterval(() => {
      this.cargarEventos(false);
    }, 60000);
    // }, 300000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  cargarEventos(primera: boolean): void {
    if (primera) {
      this.spinner.show();
    }
    this.eventosService.listar().subscribe(
      (next: EventoModel[]) => {
        this.eventos = next;

        if (primera) {
          this.spinner.hide();
        }
      },
      (error: any) => {
        if (primera) {
          this.spinner.hide();
        }

        console.log(error);
        if (!this.global.errorSesion(error)) {
          this.toastr.error('Ocurrio un error al cargar los usuarios.');
        }
      }
    );
  }

  abrirEditar(evento: any): void {
    if (evento.estado === 'Publicado') {
      this.router.navigate([`/evento/${evento.id}`]);
    } else {
      this.toastr.warning('Solo puede editar eventos Publicados');
    }
  }

  eliminarEvento(): void {
    this.spinner.show();
    this.eventosService.eliminar(this.evento.id).subscribe(
      (next: any) => {
        console.log(next);

        this.modalRef.close();
        this.spinner.hide();

        this.toastr.success('Evento terminado correctamente');
        this.cargarEventos(true);
      },
      (error: any) => {
        console.log(error);
        if (!this.global.errorSesion(error)) {
          this.spinner.hide();
          this.toastr.error('Ocurrio un error al cargar los usuarios.');
        }
      }
    );
  }

  abrirConfirmar(evento: EventoModel): void {
    if (evento.estado === 'Publicado') {
      this.evento = evento;
      this.modalRef = this.ngbModal.open(this.mdlConfirmarEliminar, {backdrop: 'static', size: 'mg'});
    } else {
      this.toastr.warning('Solo puede eliminar eventos Publicados');
    }
  }

  cerrarModal(): void {
    this.modalRef.close();
  }

}
