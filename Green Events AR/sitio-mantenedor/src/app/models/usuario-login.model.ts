export class UsuarioLoginModel {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  userData: any;

  constructor(obj ?: any) {
    this.idToken = obj && obj.idToken || null;
    this.accessToken = obj && obj.accessToken || null;
    this.refreshToken = obj && obj.refreshToken || null;
    this.userData = obj && obj.userData || null;
  }
}
