import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';

import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels} from '@techiediaries/ngx-qrcode';

import {EventosService} from '../../services/eventos.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css']
})
export class EventoComponent implements OnInit {

  @ViewChild('modalExperiencia') mdlExperiencia: TemplateRef<any>;
  modalRef: NgbModalRef;

  evento: any = {};
  experienciaSel: any;

  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;

  constructor(private eventosService: EventosService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService,
              private ngbModal: NgbModal) {
  }

  ngOnInit(): void {
    this.cargarEvento();
  }

  cargarEvento(): void {
    this.spinner.show();
    this.eventosService.buscarEvento().subscribe(
      (next: any) => {
        console.log(next);

        for (const exp of next.experiencias) {
          exp.url = `${environment.URL_SITIO}/experiencias/${exp.index}/index.html`;
        }

        this.evento = next;
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.toastr.warning('No es posible cargar los datos de evento');
        this.spinner.hide();
      }
    );
  }

  abrirModal(experiencia: any): void {
    this.experienciaSel = experiencia;
    this.modalRef = this.ngbModal.open(this.mdlExperiencia, {backdrop: 'static', size: 'xl'});
  }

  cerrarModal(): void {
    this.modalRef.close();
  }

  abrirExperiencia(): void {
    console.log(this.experienciaSel.url);
    window.open(this.experienciaSel.url, '_blank');
  }

}
