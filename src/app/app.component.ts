import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthComponent} from "./component/auth/auth.component";
import {HeaderComponent} from "./component/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ecommerce-frontend';
}
