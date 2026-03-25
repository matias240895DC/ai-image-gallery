import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CreateArticleComponent } from './components/articles/create-article/create-article.component';
import { IaGeneratorComponent } from './components/inteligence/ia-generator/ia-generator.component';
import { ManageArticlesComponent } from './components/articles/manage-articles/manage-articles.component';
import { ArticleGalleryComponent } from './components/articles/article-gallery/article-gallery.component';
import { ArticleDetailComponent } from './components/articles/article-detail/article-detail.component';
import { EditArticleComponent } from './components/articles/edit-article/edit-article.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { TermsComponent } from './components/terms/terms.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { navigationLockGuard } from './guards/navigation-lock.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'gallery', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'gallery', component: ArticleGalleryComponent },
  { path: 'article/:id', component: ArticleDetailComponent },
  { path: 'edit-article/:id', component: EditArticleComponent, canActivate: [navigationLockGuard, authGuard] },
  { path: 'create', component: CreateArticleComponent, canActivate: [navigationLockGuard, authGuard] },
  { path: 'ia-generator', component: IaGeneratorComponent, canActivate: [navigationLockGuard, authGuard] },
  { path: 'manage-articles', component: ManageArticlesComponent, canActivate: [navigationLockGuard, authGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [navigationLockGuard, adminGuard] },
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: 'gallery' }
];
