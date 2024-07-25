import { Routes } from '@angular/router';
import { AboutComponent } from "./component/about/about.component";
import { AuthComponent } from "./component/auth/auth.component";
import { CartComponent } from "./component/cart/cart.component";
import { ContactComponent } from "./component/contact/contact.component";
import { HomeComponent } from "./component/home/home.component";
import { NotfoundComponent } from "./component/notfound/notfound.component";
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
import { AdminGuard } from './utils/admin.guard';
import { authGuardGuard } from "./utils/auth-guard.guard";



export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, title: "Dashboard", canActivate: [AdminGuard], children: [
    { path: 'users', component: UsersComponent, title: "Users", canActivate: [AdminGuard] },
    { path: 'categories', component: CategoriesComponent, title: "Categories", canActivate: [AdminGuard] },
    { path: 'subcategories', component: SubcategoriesComponent, title: "Subcategories", canActivate: [AdminGuard] },
    { path: 'products', component: ProductsComponent, title: "Products", canActivate: [AdminGuard] },
    { path: 'cart', component: CartComponent, title: "Cart", canActivate: [AdminGuard] },
    { path: 'orders', component: OrdersComponent, title: "orders", canActivate: [AdminGuard] },
    { path: 'users/:id', component: UsersDetailsComponent, title: "UserDetails", canActivate: [AdminGuard] },
    { path: "products/:id", component: ProductDetailsComponent, title: "product Details", canActivate: [AdminGuard] }
  ]},
  { path: '', component: HomeComponent ,title: "Home"},
  { path: 'products', component: ProductListComponent ,title: "Products"},
  { path: 'categories/:categoryTitle/:subCategoryName', component: ProductListComponent,
    data: {title: 'Sub_Category: :subCategoryName'}
  },
  { path: 'categories/:categoryTitle', component: ProductListComponent,
    data: {title: 'Category: :categoryTitle'}
  },
  { path: 'search', component: ResultSearchComponent,
    data: {title: 'Sub_Category: :subCategoryName'}
  },
  { path:'user/profile',component:ProfileComponent,title: "Profile", canActivate: [authGuardGuard] },
  { path: 'about', component: AboutComponent,title: "About"},
  { path: 'contact', component: ContactComponent,title: "Contact"},
  { path: 'login', component: AuthComponent, data: { action: 'login' } },
  { path: 'register', component: AuthComponent, data: { action: 'register' } },

  { path: 'logout', component: AuthComponent, title: "Logout"},
  // { path: 'user/login', component: AuthComponent,title: "Authontication", canActivate: [noAuthGuard] },
  { path: 'products/:id',component: PageDetailsComponent,title: "Product Details"},
  { path: 'products/seller/:id',component: ProductDetailsComponent,title: "Product Details"},
  { path: 'cart',component: CartComponent,title: "Cart"},
  { path: 'notfound', component: NotfoundComponent,title: "Not Found"},
  { path: '**', redirectTo: '/notfound' }
];
