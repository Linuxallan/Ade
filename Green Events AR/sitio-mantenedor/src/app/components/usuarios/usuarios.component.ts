import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';

import {UsuariosService} from '../../services/usuarios.service';
import {UsuarioModel} from '../../models/usuario.model';
import {GlobalService} from '../../shared/globals.shared';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  providers: [GlobalService]
})
export class UsuariosComponent implements OnInit {

  @ViewChild('modalCrearUsuario') mdlCrearUsuario: TemplateRef<any>;
  @ViewChild('modalEditarUsuario') mdlEditarUsuario: TemplateRef<any>;
  @ViewChild('modalConfirmarEliminar') mdlConfirmarEliminar: TemplateRef<any>;

  modalRef: NgbModalRef;

  usuarios: UsuarioModel[] = [];
  usuario: UsuarioModel = null;

  constructor(private usuariosService: UsuariosService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService,
              private ngbModal: NgbModal,
              private global: GlobalService) {
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.spinner.show();
    this.usuariosService.listar().subscribe(
      (next: UsuarioModel[]) => {
        this.usuarios = next;
        this.spinner.hide();
      },
      (error: any) => {
        this.spinner.hide();
        console.log(error);
        if (!this.global.errorSesion(error)) {
          this.toastr.error('Ocurrio un error al cargar los usuarios.');
        }
      }
    );
  }

  guardar(): void {
    this.spinner.show();
    this.usuariosService.guardar(this.usuario).subscribe(
      (next: any) => {
        this.spinner.hide();
        this.toastr.success('Usuario creado correctamente.');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      (error: any) => {
        this.spinner.hide();
        console.log(error);

        if (!this.global.errorSesion(error)) {
          if (error.status === 409) {
            this.toastr.warning('Usuario ya se encuentra registrado.');
          } else {
            this.toastr.error('Ocurrio un error al crear el usuario.');
          }
        }
      }
    );
  }

  actualizar(): void {
    this.spinner.show();
    this.usuariosService.actualizar(this.usuario).subscribe(
      (next: any) => {
        this.spinner.hide();
        this.toastr.success('Usuario creado correctamente.');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      (error: any) => {
        this.spinner.hide();
        console.log(error);

        if (!this.global.errorSesion(error)) {
          if (error.status === 409) {
            this.toastr.warning('Usuario no se encuentra registrado.');
          } else {
            this.toastr.error('Ocurrio un error al crear el usuario.');
          }
        }
      }
    );
  }

  eliminarUsuario(): void {
    this.spinner.show();
    this.usuariosService.eliminar(this.usuario).subscribe(
      (next: any) => {
        this.spinner.hide();
        this.toastr.success('Usuario eliminado correctamente.');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      (error: any) => {
        this.spinner.hide();

        if (error.status === 409) {
          this.toastr.warning('Usuario no se encuentra registrado.');
        } else {
          this.toastr.error('Ocurrio un error al crear el usuario.');
        }
        console.log(error);
      }
    );
  }

  abrirModal(accion: string, usuario ?: UsuarioModel): void {
    if (usuario) {
      this.usuario = {...usuario};
    } else {
      this.usuario = new UsuarioModel();
    }

    if (accion === 'crear') {
      this.modalRef = this.ngbModal.open(this.mdlCrearUsuario, {backdrop: 'static', size: 'mg'});
    } else if (accion === 'editar') {
      this.modalRef = this.ngbModal.open(this.mdlEditarUsuario, {backdrop: 'static', size: 'mg'});
    } else {
      this.modalRef = this.ngbModal.open(this.mdlConfirmarEliminar, {backdrop: 'static', size: 'mg'});
    }
  }

  cerrarModal(): void {
    this.modalRef.close();
  }

}
