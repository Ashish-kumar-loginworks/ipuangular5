import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { HeaderComponent } from '../shared/header/header.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Http } from '@angular/http';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any = undefined;
  location: any = {
    latitude: 0,
    longitude: 0
  };
  isOpened: boolean = true;
  isMobile: boolean = false;
  isUser: boolean = false;
  showLogin: boolean = false;
  toggleheader: boolean = false;
  loginError: String = "";
  public form: FormGroup;

  // for chat
  userId: String;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private http: Http
  ) {
  }

  ngOnInit() {
    if (localStorage.getItem("username")) {
      this.getUserInfo();
      this.authService.onProfileUpdate.subscribe(res => {
        this.user = res;
      });
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        // console.log("Geolocation result:", position);
        // console.log("latitude: ", position.coords.latitude);
        // console.log("longitude: ", position.coords.longitude);
        this.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        localStorage.setItem("location", JSON.stringify(this.location));
      }, err => {
        // console.log("Geolocation error: ", err);
      });
    } else {
      // console.log("Unable to find user's location due to geolocation not supported in this browser.");
    }
    this.form = this.fb.group({
      username: ["", Validators.compose([Validators.required])],
      password: ["", Validators.compose([Validators.required])]
    });
    // this.user = JSON.parse(localStorage.getItem("userInfo"));
    // console.log(this.user);
    if (window.innerWidth < 600) {
      this.isOpened = false;
      this.isMobile = true;
      this.toggleheader = true;
    }

    var self = this;
    document.querySelector(".content").addEventListener("click", function () {
      if (self.isOpened && self.isMobile) {
        self.isOpened = false;
      }
    });

    // find user's position
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(position => {
    //     console.log("Geolocation result:", position);
    //     console.log("latitude: ", position.coords.latitude);
    //     console.log("longitude: ", position.coords.longitude);
    //     this.location = {
    //       latitude : position.coords.latitude,
    //       longitude: position.coords.longitude,
    //     };
    //     localStorage.setItem("location", this.location);
    //   }, err => {
    //     console.log("Geolocation error: ", err);
    //   });
    // } else {
    //   console.log("Unable to find user's location due to geolocation not supported in this browser.");
    // }
    if (localStorage.location) {
      var userLocation = JSON.parse(localStorage.location);
      this.location = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }
  }

  toggleNavigationBar(event) {
    // console.log(event);
    this.isOpened = event;
  }

  toggleHeaderBar(event) {
    // console.log(event);
    this.toggleheader = event;
  }

  getUserInfo() {
    var token = localStorage.getItem("token");
    var username = localStorage.getItem("username");
    // get user info
    this.authService.getUserInfo(username, token).subscribe(result => {
      var response = JSON.parse(result._body);
      this.user = response;
      localStorage.setItem("userInfo", JSON.stringify(response));
      if (this.user != null)
        this.isUser = true;
      else
        this.isUser = false;
    }, err => {
      // console.log("err", err);
      // alert("Unable to retrieve your information from server.");
    });
  }

  // navigate login
  navigateLogin() {
    this.showLogin = true;
  }

  // navigate login
  navigateSignUp() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      // console.log(params);
      var data = {
        action: params.action,
        provider: params.provider,
        referral: params.referral
      };
      // console.log(data);
      this.router.navigate(['/signup'], { queryParams: data });
    });
  }

  onLoginFormSubmit() {
    // online testing implemented for client's api's
    this.authService.login(this.form.value).subscribe(result => {
      if (result === true) {
        this.loginError = "";
        this.showLogin = false;
        // window.location.reload();
        this.getUserInfo();
      }
    }, err => {
      console.log("err", err);
      this.loginError = "Please Enter valid credentials.";
    });
  }

  updateProfileImages(event) {
    // this.user = event;
    // console.log("Images Updated");
    alert("Images Updated");
  }
}
