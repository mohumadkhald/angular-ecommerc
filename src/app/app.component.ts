import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./component/footer/footer.component";
import { HeaderComponent } from './component/header/header.component';
import { AuthComponent } from './component/auth/auth.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, AuthComponent, HeaderComponent, FooterComponent]
})
export class AppComponent {
  title = 'ecommerce-frontend';
}
