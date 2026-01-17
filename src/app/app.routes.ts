import { Routes } from '@angular/router';
import { AboutComponent } from "./component/about/about.component";
import { AuthComponent } from "./component/auth/auth.component";
import { CartComponent } from "./component/cart/cart.component";
import { ContactComponent } from "./component/contact/contact.component";
import { HomeComponent } from "./component/home/home.component";
import { NotfoundComponent } from "./component/notfound/notfound.component";
import { OrderComponent } from './component/order/order.component';
import { PageDetailsComponent } from './component/page-details/page-details.component';
import { ProductListComponent } from "./component/product-list/product-list.component";
import { ProfileComponent } from "./component/profile/profile.component";
import { ResultSearchComponent } from './component/result-search/result-search.component';
import { CategoriesComponent } from './dashboard/categories/categories.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './dashboard/orders/orders.component';
import { ProductDetailsComponent } from './dashboard/product-details/product-details.component';
import { ProductsComponent } from './dashboard/products/products.component';
import { SubcategoriesComponent } from './dashboard/subcategories/subcategories.component';
import { UsersDetailsComponent } from './dashboard/users-details/users-details.component';
import { UsersComponent } from './dashboard/users/users.component';
import { authGuardGuard } from "./utils/auth-guard.guard";
import { CatsComponent } from './component/cats/cats.component';
import { AdminGuard } from './utils/admin.guard';



export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, title: "Dashboard", canActivate: [AdminGuard], children: [
    { path: 'users', component: UsersComponent, title: "Users" },
    { path: 'categories', component: CategoriesComponent, title: "Categories" },
    { path: 'subcategories', component: SubcategoriesComponent, title: "Subcategories" },
    { path: 'products', component: ProductsComponent, title: "Products"},
    { path: 'cart', component: CartComponent, title: "Cart" },
    { path: 'orders', component: OrdersComponent, title: "orders", },
    { path: 'users/:id', component: UsersDetailsComponent, title: "UserDetails" },
    { path: "products/:id", component: ProductDetailsComponent, title: "product Details" }
  ]},
  { path: '', component: HomeComponent ,title: "Home"},
  // { path: 'products', component: ProductListComponent ,title: "Products"},
  { path: 'categories/:categoryTitle', component:CatsComponent},
  { path: 'categories/:categoryTitle/:subCategoryName', component: ProductListComponent},
  // { path: 'categories/:categoryTitle', component: ProductListComponent,
  //   data: {title: 'Category: :categoryTitle'}
  // },
  { path: 'search', component: ResultSearchComponent,
    data: {title: 'Sub_Category: :subCategoryName'}
  },
  { path:'user/profile',component:ProfileComponent,title: "Profile", canActivate: [authGuardGuard] },
  { path: 'about', component: AboutComponent,title: "About"},
  { path: 'contact', component: ContactComponent,title: "Contact"},
  { path: 'auth/:state', component: AuthComponent, title: 'Auth' },
  { path: 'auth', redirectTo: 'auth/login', pathMatch: 'full' }, // default to login
  // { path: 'register', component: AuthComponent, data: { action: 'register' }, title: 'Register' },

  { path: 'logout', component: AuthComponent, title: "Logout"},
  // { path: 'user/login', component: AuthComponent,title: "Authontication", canActivate: [noAuthGuard] },
  { path: 'categories/:categoryTitle/:subCategoryName/products/:id',component: PageDetailsComponent,title: "Product Details"},
  { path: 'products/seller/:id',component: ProductDetailsComponent,title: "Product Details"},
  { path: 'cart',component: CartComponent,title: "Cart"},
  { path: 'orders',component: OrderComponent,title: "Orders"},

  { path: 'notfound', component: NotfoundComponent,title: "Not Found"},
  { path: '**', redirectTo: '/notfound' }
];
