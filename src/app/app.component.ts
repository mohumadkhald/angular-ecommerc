import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { FooterComponent } from './component/footer/footer.component';
import { HeaderComponent } from './component/header/header.component';
import { AuthComponent } from './component/auth/auth.component';
import { ToastService } from './service/toast.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { BackendEventsService } from './service/backend-events.service';
import { NotificationService } from './service/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
  ],
})
export class AppComponent {
  title = 'commerce-frontend';
  constructor(
    public toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private backendEvents: BackendEventsService,
    private notificationService: NotificationService
  ) {}
  ngOnInit() {
    this.backendEvents.listenToBackendStatus();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let active = this.route.root;

        // Walk through the active route tree to the deepest child
        while (active.firstChild) {
          active = active.firstChild;
        }

        const routeConfig = active.snapshot.routeConfig;

        // console.log('---------------------------');
        // console.log('📌 Executed Route Path:', routeConfig?.path);
        // console.log('📌 Component:', routeConfig?.component?.name);
        // console.log('---------------------------');
      });

  }
  notify() {
    this.notificationService.showNotification(
      'Hello  👋',
      'This is your first desktop notification!'
    );
    console.log('Notification sent');
  }

}
