import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormGroup} from '@angular/forms';
import {EventosService} from '../../services/eventos.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';
import {GlobalService, REGIONES_AWS} from '../../shared/globals.shared';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-editar-evento',
  templateUrl: './editar-evento.component.html',
  styleUrls: ['./editar-evento.component.css'],
  providers: [GlobalService]
})
export class EditarEventoComponent implements OnInit {

  form: FormGroup;

  imagenPre: any;
  submitted = false;
  isEdicion = false;

  constructor(private cd: ChangeDetectorRef,
              private eventosService: EventosService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService,
              private router: Router,
              private route: ActivatedRoute,
              private global: GlobalService) {
  }

  ngOnInit(): void {
    this.form = this.global.getFormEvento();
    this.agregarExperiencia();

    this.route.params.subscribe((pathParams) => {
      console.log(pathParams);
      if (pathParams.id) {
        this.isEdicion = true;
        this.cargar(pathParams.id);
      }
    });
  }

  cargar(id: string): void {
    this.spinner.show();
    this.eventosService.buscar(id).subscribe(
      (next: any) => {
        if (next.estado === 'Publicado') {
          this.form = this.global.getFormEvento(next);

          for (const exp of next.experiencias) {
            this.global.agregarExperiencia(this.expFormArray, exp);
          }

          this.imagenPre = next.urlHeader;
          this.spinner.hide();
        } else {
          this.toastr.warning('Solo puede editar eventos Publicados')
          this.router.navigate(['/eventos']);
        }
      },
      (error: any) => {
        if (!this.global.errorSesion(error)) {
          console.log(error);
          this.toastr.error('Ocurrio un error al cargar el evento.');
          this.spinner.hide();
          this.router.navigate(['/eventos']);
        }
      }
    );
  }

  agregarExperiencia(): void {
    this.global.agregarExperiencia(this.expFormArray);
  }

  async actualizar(): Promise<void> {
    this.submitted = true;
    if (this.form.valid) {
      this.spinner.show();
      try {
        let data: any = {...this.form.value};

        data = await this.eventosService.subirArhivos(data);
        console.log(data);

        const response = await this.eventosService.editarEvento(data);
        console.log(response);

        this.toastr.success('Se ha iniciado correctamente la actualización del evento');
        this.spinner.hide();

        await this.router.navigate(['/eventos']);

      } catch (err) {
        this.spinner.hide();
        if (err.status === 409) {
          this.toastr.error('Ya existe un evento con el codigo ingresado');
        } else {
          this.toastr.error('Ocurrio un error al crear el evento');
        }
      }
    } else {
      this.toastr.warning('Complete correctamente el formulario de creación')
    }
  }

  onFileChange(event: any, tipo: string, index?: number) {
    this.spinner.show();
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsArrayBuffer(file);
      reader.addEventListener('loadend', async (ev: any) => {
        if (tipo === 'modelo') {
          this.expFormArray.controls[index].patchValue({
            modelo: reader.result
          });
        } else {
          this.form.patchValue({
            imagen: reader.result
          });
        }

        this.spinner.hide();
        this.cd.markForCheck();
      });

      if (tipo === 'imagen') {
        const reader2 = new FileReader();
        const [file2] = event.target.files;
        reader2.readAsDataURL(file2);

        reader2.onload = () => {
          this.imagenPre = reader2.result;
        }
      }
    } else {
      this.spinner.hide();
    }
  }

  eliminarExperiencia(index: number) {
    this.expFormArray.removeAt(index);
  }

  volver(): void {
    this.router.navigate(['/eventos']);
  }

  get f(): any {
    return this.form.controls;
  }

  get expFormArray(): FormArray {
    return this.form.controls.experiencias as FormArray;
  }

  get dominio(): string {
    return environment.DOMINIO;
  }

  get regiones(): any[] {
    return REGIONES_AWS;
  }

}
