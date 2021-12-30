export class LoginModel {
  usuario: string;
  password: string;

  constructor(obj ?: any) {
    this.usuario = obj && obj.usuario || '';
    this.password = obj && obj.password || '';
  }
}
