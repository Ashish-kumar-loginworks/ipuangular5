import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/shared/home/home.component';
import { UserComponent } from './components/shared/user/user.component';
import { GalleryComponent } from './components/shared/gallery/gallery.component';
import { NotificationsComponent } from './components/shared/notifications/notifications.component';
import { PublishComponent } from './components/shared/publish/publish.component';
import { UserDetailsComponent } from './components/shared/user-details/user-details.component';
import { SettingsComponent } from './components/shared/settings/settings.component';


import { AuthenticationService } from './services/authentication.service';

export const AppRoutes: Routes = [
    {

        path: '',
        redirectTo: "/login",
        pathMatch: 'full'
    },
    {

        path: 'signup',
        component: SignupComponent,
        data: { title: 'Sign Up' }
    },
    {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login' }
    },
    {
        path: 'welcome',
        component: WelcomeComponent,
        data: { title: 'Welcome' },
        canActivate: [AuthenticationService]
    },
    {
        path: '',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
        children: [
            {
                path: 'dashboard',
                canActivate: [AuthenticationService],
                component: HomeComponent
            },
            {
                path: 'user',
                canActivate: [AuthenticationService],
                component: UserComponent
            },
            {
                path: 'user/:id',
                component: UserDetailsComponent
            },
            {
                path: 'gallery',
                canActivate: [AuthenticationService],
                component: GalleryComponent
            },
            {
                path: 'notifications',
                canActivate: [AuthenticationService],
                component: NotificationsComponent
            },
            {
                path: 'publish',
                canActivate: [AuthenticationService],
                component: PublishComponent
            },
            {
                path: 'settings',
                canActivate: [AuthenticationService],
                component: SettingsComponent
            }
        ]

    },
    {
        path: '**',
        redirectTo: "/welcome",
        pathMatch: 'full'
    },
];

