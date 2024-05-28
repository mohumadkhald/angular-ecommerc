import { Routes } from '@angular/router';
import {AuthComponent} from "./component/auth/auth.component";
import {HomeComponent} from "./component/home/home.component";
import {authGuardGuard} from "./component/services/auth-guard.guard";
import {AboutComponent} from "./component/about/about.component";
import {ContactComponent} from "./component/contact/contact.component";
import {ProductDetailsComponent} from "./component/product-details/product-details.component";
import {CartComponent} from "./component/cart/cart.component";
import {NotfoundComponent} from "./component/notfound/notfound.component";
import {ProfileComponent} from "./component/profile/profile.component";
import {noAuthGuard} from "./component/services/no-auth.guard";
import {ProductListComponent} from "./component/product-list/product-list.component";



export const routes: Routes = [
  { path: '', component: HomeComponent ,title: "Home"},
  { path: 'products', component: ProductListComponent ,title: "Products"},
  { path: 'products/:subCategoryName', component: ProductListComponent },
  { path:'user/profile',component:ProfileComponent,title: "Profile", canActivate: [authGuardGuard] },
  { path: 'about', component: AboutComponent,title: "About"},
  { path: 'contact', component: ContactComponent,title: "Contact"},
  { path: 'user/login', component: AuthComponent,title: "Authontication", canActivate: [noAuthGuard] },
  { path: 'product/details/:id',component: ProductDetailsComponent,title: "Product Details"},
  { path: 'cart',component: CartComponent,title: "Cart"},
  { path: 'notfound', component: NotfoundComponent,title: "Not Found"},
  { path: '**', redirectTo: '/notfound' }
];
