import {Component} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sitio-evento-pwa';

  constructor(private update: SwUpdate) {
    this.updateClient();
  }

  updateClient(): void {
    if (!this.update.isEnabled) {
      console.log('Not enabled');
    }
    this.update.available.subscribe(update => {
      console.log('Update!!!!!');
      location.reload();
    });
  }

}
