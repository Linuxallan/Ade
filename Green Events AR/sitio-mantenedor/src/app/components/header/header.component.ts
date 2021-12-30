import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input()
  tab: string;
  nombreUsuario: string;

  constructor(private authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    const userData: any = this.authService.getUserData();
    this.nombreUsuario = userData.nombre;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
