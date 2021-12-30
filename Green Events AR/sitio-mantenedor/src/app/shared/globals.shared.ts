import {Injectable} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

export const REGIONES_AWS: any[] = [
  {nombre: 'Africa (Cape Town)', codigo: 'af-south-1'},
  {nombre: 'Asia Pacific (Hong Kong)', codigo: 'ap-east-1'},
  {nombre: 'Asia Pacific (Mumbai)', codigo: 'ap-south-1'},
  {nombre: 'Asia Pacific (Osaka-Local)', codigo: 'ap-northeast-3'},
  {nombre: 'Asia Pacific (Seoul)', codigo: 'ap-northeast-2'},
  {nombre: 'Asia Pacific (Singapore)', codigo: 'ap-southeast-1'},
  {nombre: 'Asia Pacific (Sydney)', codigo: 'ap-southeast-2'},
  {nombre: 'Asia Pacific (Tokyo)', codigo: 'ap-northeast-1'},
  {nombre: 'Canada (Central)', codigo: 'ca-central-1'},
  {nombre: 'Europe (Frankfurt)', codigo: 'eu-central-1'},
  {nombre: 'Europe (Ireland)', codigo: 'eu-west-1'},
  {nombre: 'Europe (London)', codigo: 'eu-west-2'},
  {nombre: 'Europe (Milan)', codigo: 'eu-south-1'},
  {nombre: 'Europe (Paris)', codigo: 'eu-west-3'},
  {nombre: 'Europe (Stockholm)', codigo: 'eu-north-1'},
  {nombre: 'Middle East (Bahrain)', codigo: 'me-south-1'},
  {nombre: 'South America (São Paulo)', codigo: 'sa-east-1'},
  {nombre: 'US East (N. Virginia)', codigo: 'us-east-1'},
  {nombre: 'US East (Ohio)', codigo: 'us-east-2'},
  {nombre: 'US West (N. California)', codigo: 'us-west-1'},
  {nombre: 'US West (Oregon)', codigo: 'us-west-2'}
];

@Injectable()
export class GlobalService {

  constructor(private formBuilder: FormBuilder) {
  }

  getFormEvento(evento ?: any): FormGroup {
    if (evento) {
      return this.formBuilder.group({
        id: [evento.id],
        titulo: [evento.titulo, Validators.required],
        descripcion: [evento.descripcion, Validators.required],
        region: [evento.region],
        dominio: [evento.dominio],
        token: [evento.token, Validators.required],
        apiKey: [evento.apiKey, Validators.required],
        imagenIn: [''],
        imagen: '',
        experiencias: this.formBuilder.array([])
      });
    } else {
      return this.formBuilder.group({
        id: ['', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9-]+$'),
          Validators.minLength(6),
          Validators.maxLength(20)
        ]],
        titulo: ['', Validators.required],
        descripcion: ['', Validators.required],
        region: ['us-east-1', Validators.required],
        dominio: ['', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9-]+$'),
          Validators.minLength(6),
          Validators.maxLength(20)
        ]],
        token: ['', Validators.required],
        apiKey: ['', Validators.required],
        imagenIn: ['', Validators.required],
        imagen: '',
        experiencias: this.formBuilder.array([])
      });
    }
  }

  agregarExperiencia(formArray: FormArray, experiencia ?: any): void {
    if (experiencia) {
      formArray.push(this.formBuilder.group({
        nombre: [experiencia.nombre, Validators.required],
        descripcion: [experiencia.descripcion, Validators.required],
        modeloIn: [''],
        modelo: ''
      }));
    } else {
      formArray.push(this.formBuilder.group({
        nombre: ['', Validators.required],
        descripcion: ['', Validators.required],
        modeloIn: ['', Validators.required],
        modelo: ''
      }));
    }
  }

  errorSesion(e: any): boolean {
    return e && e.status === 401
      && e.error
      && (e.error.message !== 'Unauthorized' || e.error.message !== 'The incoming token has expired');
  }

}
