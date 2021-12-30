export class EventoModel {

  id: string;
  titulo: string;
  fecha: string;
  estado: string;

  constructor(obj?: any) {
    this.id = obj && obj.id || '';
    this.titulo = obj && obj.titulo || '';
    this.fecha = obj && obj.fecha || '';
    this.estado = obj && obj.estado || '';
  }

}
