import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./component/footer/footer.component";
import { HeaderComponent } from './component/header/header.component';
import { AuthComponent } from './component/auth/auth.component';
import { ToastService } from './service/toast.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, AuthComponent, HeaderComponent, FooterComponent, CommonModule]
})
export class AppComponent {
  title = 'ecommerce-frontend';
  constructor(

    public toastService: ToastService,

  ) {}
}
