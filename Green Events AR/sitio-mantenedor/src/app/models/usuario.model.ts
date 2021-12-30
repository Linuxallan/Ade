export class UsuarioModel {
  usuario: string;
  nombre: string;
  clave: string;
  email: string;

  constructor(obj ?: any) {
    this.usuario = obj && obj.usuario || null;
    this.nombre = obj && obj.nombre || null;
    this.email = obj && obj.email || null;
  }
}
