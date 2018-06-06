import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import Swal from 'sweetalert2'
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  inviteUser: String = "";
  inviteProvider: String = "";
  publishProvider: String = "";
  askReferral: String = "";
  user: any = {};
  isProvider: boolean = false;

  inviteUserFormDisabled: boolean = true;
  inviteProviderFormDisabled: boolean = true;
  publishProviderFormDisabled: boolean = true;
  askReferralFormDisabled: boolean = true;

  inviteUserForm: FormGroup;
  inviteProviderForm: FormGroup;
  publishProviderForm: FormGroup;
  askReferralForm: FormGroup;
  resetPassword: FormGroup;
  resetPasswordOTP: FormGroup;
  resetPassswordPopupShow: boolean = false;
  resetPassswordOTPPopupShow: boolean = false;
  eyeOpen = true;
  eyeOpen1 = true;

  settingUpdateOTP: FormGroup;
  settingUpdateOTPShow: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("userInfo"));
    this.isProvider = this.user.providing ? true : false;
    console.log(this.user);

    //invite user message
    var inviteUserMessage = this.user.messages.invite_user;
    this.inviteUser = inviteUserMessage.replace("[link]", "<b class='red'>[link]</b>");
    this.inviteUserForm = this._fb.group({
      referral: [inviteUserMessage, Validators.compose([Validators.required])],
    });

    var inviteProviderMessage = this.user.messages.invite_provider;
    this.inviteProvider = inviteProviderMessage.replace("[link]", "<b class='red'>[link]</b>");
    this.inviteProviderForm = this._fb.group({
      referral: [inviteProviderMessage, Validators.compose([Validators.required])],
    });

    var publishProviderMessage = this.user.messages.publish_provider;
    this.publishProvider = publishProviderMessage.replace("[link]", "<b class='red'>[link]</b>");
    this.publishProviderForm = this._fb.group({
      referral: [publishProviderMessage, Validators.compose([Validators.required])],
    });

    var askReferral = this.user.messages.ask_referral;
    this.askReferral = askReferral.replace("[link]", "<b class='red'>[link]</b>");
    this.askReferralForm = this._fb.group({
      referral: [askReferral, Validators.compose([Validators.required])],
    });

    this.resetPassword = this._fb.group({
      password: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/)])],
      confirmPassword: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/)])]
    });
    this.resetPasswordOTP = this._fb.group({
      otp: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
    });
    this.settingUpdateOTP = this._fb.group({
      otp: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
    });
  }

  onChangeHTMLUpdate(input, text) {
    if (input == 'invite_User') {
      this.inviteUser = text.replace("[link]", "<b class='red'>[link]</b>");
    } else if (input == 'invite_Provider') {
      this.inviteProvider = text.replace("[link]", "<b class='red'>[link]</b>");
    } else if (input == 'ask_referral') {
      this.askReferral = text.replace("[link]", "<b class='red'>[link]</b>");
    } else if (input == 'publish_provider') {
      this.publishProvider = text.replace("[link]", "<b class='red'>[link]</b>");
    }
  }

  onFormSubmit() {
    var phone = this.user.phone, calltype = "update", user = this.user._id;
    this.authService.sendOtp(phone, calltype, user).subscribe(result => {
      if (result == true) {
        this.settingUpdateOTPShow = true;
      } else {
        this.settingUpdateOTPShow = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to send opt request. Please try again.!',
        });
      }
    }, err => {
      this.settingUpdateOTPShow = false;
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Sorry unable to send opt request. Please try again.!',
      });
    });
  }
  updateUserSetting() {
    var otp = this.settingUpdateOTP.value.otp;
    if (otp.length != 6) {
      Swal({
        type: 'error',
        title: 'Sorry',
        text: 'Please enter OTP send on your registered mobile number.',
      });
    } else {
      // verify otp and show resetPassswordPopupShow
      this.authService.verifyOtp('update', otp, this.user._id).subscribe(result => {
        if (result == true) {
          this.settingUpdateOTPShow = false;
          this.settingUpdateOTP.controls['otp'].setValue('');

          //call api to update message
          var id = JSON.parse(localStorage.getItem("userInfo"))._id;
          var token = localStorage.getItem("token");
          var body = {
            ask_referral: this.askReferralForm.value.referral,
            invite_user: this.inviteUserForm.value.referral,
            invite_provider: this.inviteProviderForm.value.referral,
            publish_provider: this.publishProviderForm.value.referral,
            pay_request: this.user.messages.pay_request
          };
          console.log(body);
          this.authService.saveSettings(id, token, body).subscribe(result => {
            if (result === true) {
              Swal({
                type: 'success',
                title: 'Success',
                text: 'Your settings are updated successfully.',
              });
            }
          }, err => {
            // console.log("err", err);
            Swal({
              type: 'error',
              title: 'Oops...',
              text: 'Sorry unable to process. Please try again.!',
            });
          });
        }
      });
    }



  }

  // confirm via otp to reset password then show screen
  requestOtpForResetPassword() {
    var phone = this.user.phone, calltype = "password", user = this.user._id;
    this.authService.sendOtp(phone, calltype, user).subscribe(result => {
      if (result == true) {
        this.resetPassswordOTPPopupShow = true;
      } else {
        this.resetPassswordOTPPopupShow = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to send opt request. Please try again.!',
        });
      }
    }, err => {
      this.resetPassswordOTPPopupShow = false;
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Sorry unable to send opt request. Please try again.!',
      });
    });
  }

  verifyResetPasswordOTP() {
    var otp = this.resetPasswordOTP.value.otp;
    if (otp.length != 6) {
      Swal({
        type: 'error',
        title: 'Sorry',
        text: 'Please enter OTP send on your registered mobile number.',
      });
    } else {
      // verify otp and show resetPassswordPopupShow
      this.authService.verifyOtp('password', otp, this.user._id).subscribe(result => {
        if (result == true) {
          this.resetPassswordOTPPopupShow = false;
          this.resetPassswordPopupShow = true;
          localStorage.setItem('otp', otp);
        }
      });
    }
  }
  confirmResetPasswordPopup() {
    var password = this.resetPassword.controls['password'].value,
      confirmPassword = this.resetPassword.controls['confirmPassword'].value,
      otp = this.resetPasswordOTP.value.otp;
    if (password == confirmPassword) {
      this.authService.resetPassword(this.user._id, password, localStorage.token, otp).subscribe(result => {
        if (result == true) {
          this.resetPassswordPopupShow = false;
          this.resetPasswordOTP.controls['otp'].setValue('');
          this.resetPassword.controls['password'].setValue('');
          this.resetPassword.controls['confirmPassword'].setValue('');
          Swal({
            type: 'success',
            title: 'Password changed successfully.',
            text: 'Congrats! Your Password hase been changed. Next time login with new password.!',
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
