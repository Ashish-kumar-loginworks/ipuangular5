import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService, SocialUser, GoogleLoginProvider } from "../../angular4-social-login";
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  forgotPassword: boolean = false;
  otpFormShow: boolean = false;
  resetPasswordFormShow: boolean = false;
  public user: SocialUser;
  public loggedIn: boolean;
  public form: FormGroup;
  public otpForm: FormGroup;
  public forgotForm: FormGroup;
  public resetPassword: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private googleAuthService: AuthService
  ) { }

  ngOnInit() {

    // login form 
    this.form = this.fb.group({
      username: ["", Validators.compose([Validators.required])],
      password: ["", Validators.compose([Validators.required])],
      staySignIn: [false]
    });
    // forgot password form
    this.forgotForm = this.fb.group({
      username: ["", Validators.compose([Validators.required])]
    });
    this.otpForm = this.fb.group({
      otp: ["", Validators.compose([Validators.required])]
    });
    this.resetPassword = this.fb.group({
      password: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/)])],
      confirmPassword: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/)])]
    });
  }

  onLoginFormSubmit() {
    // online testing implemented for client's api's
    this.authService.login(this.form.value).subscribe(result => {
      if (result === true) {
        // set staysignin flag in localstogare to keep user logged in if user not properly logged out
        // localStorage.setItem("staySignIn", this.form.value.staySignIn);
        this.activatedRoute.queryParams.subscribe((params: Params) => {
          if (params.referral) {
            this.authService.providerLogin(localStorage.username, localStorage.token, params.referral).subscribe(res => {
              // console.log("Provider login with username " + localStorage.username + " with reference " + referral);
            });
          }
        });
        this.navigateToWelcome();
      } else {
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Please Enter Valid credentials!',
        });
      }
    }, err => {
      console.log("err", err);
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Please login with valid credentials!',
      });
    });
  }

  navigateToWelcome() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      console.log(params);
      var data = {
        action: params.action ? params.action : "",
        provider: params.provider ? params.provider : "",
        referral: params.referral ? params.referral : ""
      };
      console.log(data);
      this.router.navigate(['/welcome'], { queryParams: data });
    });
  }

  signInWithGoogle() {
    // old code
    this.googleAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.googleAuthService.authState.subscribe((user) => {
      if (user != null) {
        // console.log("google response", user);
        this.authService.signInGoogleApi(user.email, user.idToken).subscribe(result => {
          // console.log("result", JSON.parse(result._body));
          var res = JSON.parse(result._body);
          var token = res.token;
          var username = res.user;
          this.navigateToWelcome();
        });
        this.googleAuthService.signOut();
      }
    });
  }

  onForgotFormSubmit() {
    var form = this.forgotForm.value;
    if (this.forgotForm.status == "VALID") {
      var phone = '', calltype = "password", user = form.username;
      this.authService.sendOtp(phone, calltype, user).subscribe(result => {
        if (result == true) {
          this.otpFormShow = true;
        } else {
          this.otpFormShow = false;
          Swal({
            type: 'error',
            title: 'Oops...',
            text: 'Sorry unable to send opt request. Please fill valid details and try again.!',
          });
        }
      }, err => {
        this.otpFormShow = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to send opt request. Please fill valid details and try again.!',
        });
      });
    } else {
      if (this.forgotForm.controls.username.invalid) {
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry! enter your username.!',
        });
      }
    }
    console.log(this.forgotForm);
  }
  onOTPFormSubmit() {
    var otp = this.otpForm.value.otp;
    var user = this.forgotForm.value.username;
    if (otp.length != 6) {
      Swal({
        type: 'error',
        title: 'Sorry',
        text: 'Please enter OTP send on your registered mobile number.',
      });
    } else {
      // verify otp and show resetPassswordPopupShow
      this.authService.verifyOtp('password', otp, user).subscribe(result => {
        if (result == true) {
          this.otpFormShow = false;
          this.resetPasswordFormShow = true;
        } else {
          Swal({
            title: "Warning?",
            text: "Please enter correct opt provided.",
            type: "warning",
            confirmButtonClass: "btn-warning",
            confirmButtonText: "OK!",
          });
        }
      });
    }
  }
  confirmResetPasswordPopup() {
    var otp = this.otpForm.value.otp;
    var user = this.forgotForm.value.username;
    var password = this.resetPassword.controls['password'].value,
      confirmPassword = this.resetPassword.controls['confirmPassword'].value;
    if (password == confirmPassword) {
      this.authService.forgotPassword(user, password, otp).subscribe(result => {
        if (result == true) {
          this.resetPasswordFormShow = false;
          this.otpForm.reset()
          this.forgotForm.reset();
          this.resetPassword.reset();
          var self = this;
          Swal({
            type: 'success',
            title: 'Password changed successfully.',
            text: 'Congrats! Your Password hase been changed. Login with new password.!',
            onAfterClose: function () {
              self.forgotPassword = !self.forgotPassword;
            }
          });
        } else {
          Swal({
            type: 'error',
            title: 'Oops...',
            text: 'Something went wrong. Please try again.!',
          });
        }
      });
    } else {
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Both passwords should be same. Please try again.!',
      });
    }
  }
}
