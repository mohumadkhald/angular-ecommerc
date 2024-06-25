import { Routes } from '@angular/router';
import {AuthComponent} from "./component/auth/auth.component";
import {HomeComponent} from "./component/home/home.component";
import {authGuardGuard} from "./utils/auth-guard.guard";
import {AboutComponent} from "./component/about/about.component";
import {ContactComponent} from "./component/contact/contact.component";
import {ProductDetailsComponent} from "./component/product-details/product-details.component";
import {CartComponent} from "./component/cart/cart.component";
import {NotfoundComponent} from "./component/notfound/notfound.component";
import {ProfileComponent} from "./component/profile/profile.component";
import {noAuthGuard} from "./utils/no-auth.guard";
import {ProductListComponent} from "./component/product-list/product-list.component";
import { PageDetailsComponent } from './component/page-details/page-details.component';
import { HeaderComponent } from './component/header/header.component';



export const routes: Routes = [
  { path: '', component: HomeComponent ,title: "Home"},
  { path: 'products', component: ProductListComponent ,title: "Products"},
  { path: 'products/:subCategoryName', component: ProductListComponent },
  { path:'user/profile',component:ProfileComponent,title: "Profile", canActivate: [authGuardGuard] },
  { path: 'about', component: AboutComponent,title: "About"},
  { path: 'contact', component: ContactComponent,title: "Contact"},
  { path: 'login', component: AuthComponent, data: { action: 'login' } },
  { path: 'logout', component: AuthComponent, title: "Logout"},
  // { path: 'user/login', component: AuthComponent,title: "Authontication", canActivate: [noAuthGuard] },
  { path: 'product/details/:id',component: PageDetailsComponent,title: "Product Details"},
  { path: 'cart',component: CartComponent,title: "Cart"},
  { path: 'notfound', component: NotfoundComponent,title: "Not Found"},
  { path: '**', redirectTo: '/notfound' }
];
