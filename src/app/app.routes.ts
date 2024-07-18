import { Routes } from '@angular/router';
import {AuthComponent} from "./component/auth/auth.component";
import {HomeComponent} from "./component/home/home.component";
import {authGuardGuard} from "./utils/auth-guard.guard";
import {AboutComponent} from "./component/about/about.component";
import {ContactComponent} from "./component/contact/contact.component";
import {CartComponent} from "./component/cart/cart.component";
import {NotfoundComponent} from "./component/notfound/notfound.component";
import {ProfileComponent} from "./component/profile/profile.component";
import {ProductListComponent} from "./component/product-list/product-list.component";
import { PageDetailsComponent } from './component/page-details/page-details.component';
import { ResultSearchComponent } from './component/result-search/result-search.component';
import { CategoriesComponent } from './dashboard/categories/categories.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './dashboard/orders/orders.component';
import { ProductsComponent } from './dashboard/products/products.component';
import { SubcategoriesComponent } from './dashboard/subcategories/subcategories.component';
import { UsersComponent } from './dashboard/users/users.component';
import { AdminGuard } from './admin.guard';
import { UsersDetailsComponent } from './dashboard/users-details/users-details.component';



export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard], children: [
    { path: 'users', component: UsersComponent },
    { path: 'categories', component: CategoriesComponent },
    { path: 'subcategories', component: SubcategoriesComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'cart', component: CartComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'users/:id', component: UsersDetailsComponent}
  ]},
  { path: '', component: HomeComponent ,title: "Home"},
  { path: 'products', component: ProductListComponent ,title: "Products"},
  { path: 'categories/:categoryTitle/:subCategoryName', component: ProductListComponent,
    data: {title: 'Sub_Category: :subCategoryName'}
  },
  { path: 'categories/:categoryTitle', component: ProductListComponent,
    data: {title: 'Category: :categoryTitle'}
  },
  { path: 'categories/search/:categoryTitle/:productName', component: ResultSearchComponent,
    data: {title: 'Sub_Category: :subCategoryName'}
  },
  { path:'user/profile',component:ProfileComponent,title: "Profile", canActivate: [authGuardGuard] },
  { path: 'about', component: AboutComponent,title: "About"},
  { path: 'contact', component: ContactComponent,title: "Contact"},
  { path: 'login', component: AuthComponent, data: { action: 'login' } },
  { path: 'register', component: AuthComponent, data: { action: 'register' } },

  { path: 'logout', component: AuthComponent, title: "Logout"},
  // { path: 'user/login', component: AuthComponent,title: "Authontication", canActivate: [noAuthGuard] },
  { path: 'product/details/:id',component: PageDetailsComponent,title: "Product Details"},
  { path: 'cart',component: CartComponent,title: "Cart"},
  { path: 'notfound', component: NotfoundComponent,title: "Not Found"},
  { path: '**', redirectTo: '/notfound' }
];
