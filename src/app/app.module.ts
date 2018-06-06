import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, Response } from '@angular/http';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NgxChartsModule } from '@swimlane/ngx-charts';
// import { ChartsModule } from './ng2-charts/ng2-charts';
import { AuthenticationService } from './services/authentication.service';
import { GoogleLoginProvider, AuthServiceConfig } from "./angular4-social-login";
import { CloudinaryModule, CloudinaryConfiguration} from '@cloudinary/angular-5.x';
import { Cloudinary } from 'cloudinary-core/cloudinary-core-shrinkwrap';
import * as cloudinary from 'cloudinary-core';
import { ClipboardModule } from 'ngx-clipboard';
import { BarRatingModule } from "ngx-bar-rating";
import { FileUploadModule } from 'ng2-file-upload';
import { AgmCoreModule } from '@agm/core';
import { SelectModule } from 'ng2-select';
import { MomentModule } from 'angular2-moment';
import { NgxStripeModule } from 'ngx-stripe';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ChatComponent } from './components/shared/chat/chat.component';
import { GalleryComponent } from './components/shared/gallery/gallery.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { HomeComponent } from './components/shared/home/home.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { NotificationsComponent } from './components/shared/notifications/notifications.component';
import { PublishComponent } from './components/shared/publish/publish.component';
import { SettingsComponent } from './components/shared/settings/settings.component';
import { UserComponent } from './components/shared/user/user.component';
import { UserDetailsComponent } from './components/shared/user-details/user-details.component';

import { AppRoutes } from './app.router';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthService } from './angular4-social-login';
import { ServerSocketService } from './services/server-socket.service';
import { ChatService } from './services/chat.service';


export function provideConfig() {
  return config;
}

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("1056180665798-qaq4v6kcgqeu45hm83mh8kc2a2moa3o1")
  }
]);

// niv cloudinary
const cloudConfig = {
  cloud_name: 'dq9zfttmi',
  upload_preset: 'c5neyvgt'
};

const cloudinaryLib = {
  Cloudinary: Cloudinary
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    WelcomeComponent,
    ChatComponent,
    GalleryComponent,
    HeaderComponent,
    HomeComponent,
    NavbarComponent,
    NotificationsComponent,
    PublishComponent,
    SettingsComponent,
    UserComponent,
    UserDetailsComponent,
    SignupComponent,
    DashboardComponent

  
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // NgxChartsModule,
    CloudinaryModule.forRoot(cloudinaryLib, cloudConfig),
    FileUploadModule,
    BarRatingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDjaLQb8ZE8JsNNoKEFwNgqySV6GHqiWU8',
      libraries: ["places"]
    }),
    ClipboardModule,
    SelectModule,
    // ChartsModule,
    NgxStripeModule,
    HttpClientModule,
    HttpClientJsonpModule,
    HttpModule,
    //  BrowserAnimationsModule,
    RouterModule.forRoot(AppRoutes),
  ],
  providers: [AuthenticationService,AuthService, ServerSocketService, ChatService, {
    provide: AuthServiceConfig,
    useFactory: provideConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
