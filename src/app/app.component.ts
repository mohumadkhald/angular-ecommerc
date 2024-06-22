import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthComponent} from "./component/auth/auth.component";
import {HeaderComponent} from "./component/header/header.component";
import { FooterComponent } from "./component/footer/footer.component";

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
