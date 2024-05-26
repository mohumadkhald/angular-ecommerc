import { Routes } from '@angular/router';
import {AuthComponent} from "./component/auth/auth.component";

export const routes: Routes = [
  { path: 'user/login', component: AuthComponent, title: "Authentication" },
];
