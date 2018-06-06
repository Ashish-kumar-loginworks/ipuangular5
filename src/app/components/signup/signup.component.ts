import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  provider: Boolean = false;
  currentCounrtyCode: String = '';
  showServiceDetailsForm: boolean = false;
  referral: String = "";
  qParams: any = {};
  public form: FormGroup;
  public formprovider: FormGroup;
  categories = [];
  subCategories = [];
  otpFormShow = false;
  otpForm: FormGroup;
  otpFormShow1 = false;
  otpForm1: FormGroup;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(private _fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) { }

  ngOnInit() {
    // console.log(this.activatedRoute.snapshot.queryParams);
    var activeRoute = this.activatedRoute;

    // get all categories
    // fetch categories
    // this.categories = this.authService.getAllCategories().map(category => { return category.category });
    this.authService.getAllCategories().forEach(cat => {
      this.categories.push(cat.category);
      cat.subCategory.forEach(sub => {
        this.subCategories.push(sub);
      });
    })

    // if logged in then move as per flow
    activeRoute.queryParams.subscribe((params: Params) => {
      this.qParams = params;
      var referral = params['referral'];
      var type = params['type'];
      // console.log("params", params);
      if (referral) {
        this.referral = referral;
        this.userView(this.referral);
      }
      else {
        this.referral = "";
      }
      if (type == "Provider" || type == "provider") {
        this.provider = true;
      }

      // handle invitation links 
      var action = params['action'];
      if (localStorage.username) {
        if (action == "ask_referral") {
          this.router.navigate(['/welcome'], { queryParams: { action: action, provider: params['provider'] } });
        }
        if (action == "invite_user") {
          this.router.navigate(['/welcome'], { queryParams: { action: action } });
        }
        if (action == "invite_provider") {
          // hit ask for referral
          // hit provider_login api
          this.authService.providerLogin(localStorage.username, localStorage.token, referral).subscribe(res => {
            // console.log("Provider login with username " + localStorage.username + " with reference " + referral);
          });

          this.router.navigate(['/welcome'], { queryParams: { action: action, provider: params['provider'] } });
        }
      }
    });

    this.form = this._fb.group({
      username: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: ["", Validators.compose([Validators.required, Validators.email])],
      firstname: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      lastname: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      password: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/)])],
      conformPassword: ["", Validators.compose([Validators.required])],
      agree: [false, Validators.compose([Validators.required])],
      referral: [this.referral, Validators.compose([Validators.required])],
      phone: ["", Validators.compose([Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)])],
    });

    this.formprovider = this._fb.group({
      username: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: ["", Validators.compose([Validators.required, Validators.email])],
      firstname: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      lastname: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      password: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/)])],
      conformPassword: ["", Validators.compose([Validators.required])],
      agree: [true, Validators.compose([Validators.required])],
      agree1: [true, Validators.compose([Validators.required])],
      referral: [this.referral, Validators.compose([])],
      profession: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      category: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      phone: ["", Validators.compose([Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)])],
      website: ["", Validators.compose([Validators.pattern(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/)])],
      address: ["", Validators.compose([Validators.required])],
    });

    if (this.provider === true) {
      // add ISD code of country 
      this.authService.getIP().subscribe(res => {
        // console.log(res);
        this.authService.getClientCountryIsdCode(res).subscribe(res => {
          // console.log(res.country_calling_code);
          this.currentCounrtyCode = res.country_calling_code;
          this.formprovider.controls["phone"].setValue(res.country_calling_code);
        });
      });
    }

    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          // set google finded address as address for new user
          this.formprovider.controls["address"].setValue(this.searchElementRef.nativeElement.value);
        });
      });
    });

    this.otpForm = this._fb.group({
      otp: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
    });
    this.otpForm1 = this._fb.group({
      otp: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
    });
  }


  getServiceDetails() {
    this.showServiceDetailsForm = true;
  }

  onOTPFormSubmit() {
    var otp = this.otpForm.value.otp;
    if (otp.length < 6) {
      Swal({
        title: "Warning?",
        text: "Please enter opt provided.",
        type: "warning",
        confirmButtonClass: "btn-warning",
        confirmButtonText: "OK!",
      });
    } else {
      if (this.form.value.referral != "") {
        this.otpFormShow = false;
        this.authService.signup(this.form.value, otp).subscribe(result => {
          this.authService.login({
            username: this.form.controls["username"].value,
            password: this.form.controls["password"].value,
          }).subscribe(result => {
            if (result === true) {
              this.otpFormShow = false;
              var params = this.activatedRoute.snapshot.queryParams;
              if (params.action == 'ask_referral') {
                this.router.navigate(['/welcome'], { queryParams: { action: params.action, provider: this.qParams['provider'] } });
              }
              else {
                this.router.navigate(['/welcome'], { queryParams: { action: params.action, provider: this.form.controls["username"].value } });
              }
            }
          }, err => {
            console.log("err", err);
          });
        }, err => {
          // console.log("err", err);
          if (err.status == 409) {
            Swal({
              type: 'error',
              title: 'Oops...',
              text: 'Sorry! Please register with another username as its already taken.!',
            });
          }
        });
      }
      else {
        Swal({
          title: "Warning?",
          text: "Please register from invitation link provided.",
          type: "warning",
          confirmButtonClass: "btn-warning",
          confirmButtonText: "OK!",
        });
      }
    }
  }

  onSignUpFormSubmit() {
    var form = this.form;
    console.log(form);

    if (form.status == "INVALID") {
      Swal({
        title: "Warning?",
        text: "Please fill all necessary fields.",
        type: "warning",
        confirmButtonClass: "btn-warning",
        confirmButtonText: "OK!",
      });
    }
    else {
      var phone = this.form.value.phone, calltype = "register", user = this.form.value.username;
      this.authService.sendOtp(phone, calltype, user).subscribe(result => {
        if (result == true) {
          this.otpFormShow = true;
        } else {
          this.otpFormShow = false;
          Swal({
            type: 'error',
            title: 'Oops...',
            text: 'Sorry unable to send opt request. Please try again.!',
          });
        }
      }, err => {
        this.otpFormShow = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to send opt request. Please try again.!',
        });
      });
    }
  }

  onSignUpProviderFormSubmit() {
    var form = this.formprovider;
    console.log(form);
   
    if (form.status == "INVALID") {
      Swal({
        title: "Warning?",
        text: "Please fill all necessary fields.",
        type: "warning",
        confirmButtonClass: "btn-warning",
        confirmButtonText: "OK!",
      });
    }
    else {
      var phone = this.formprovider.value.phone, calltype = "registerProvider", user = this.formprovider.value.username;
      this.authService.sendOtp(phone, calltype, user).subscribe(result => {
        if (result == true) {
          this.otpFormShow1 = true;
        } else {
          this.otpFormShow1 = false;
          Swal({
            type: 'error',
            title: 'Oops...',
            text: 'Sorry unable to send opt request. Please try again.!',
          });
        }
      }, err => {
        this.otpFormShow1 = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to send opt request. Please try again.!',
        });
      });
    }
  }

  onOTPProviderFormSubmit() {
    var otp = this.otpForm1.value.otp;
    if (otp.length < 6) {
      Swal({
        title: "Warning?",
        text: "Please enter opt provided.",
        type: "warning",
        confirmButtonClass: "btn-warning",
        confirmButtonText: "OK!",
      });
    } else {
      // if (this.formprovider.value.referral != "") {
      this.otpFormShow = false;
      this.authService.signupProvider(this.formprovider.value, otp).subscribe(result => {
        this.authService.login({
          username: this.formprovider.controls["username"].value,
          password: this.formprovider.controls["password"].value,
        }).subscribe(result => {
          if (result === true) {
            this.otpFormShow = false;
            var params = this.activatedRoute.snapshot.queryParams;
            if (params.action == 'ask_referral') {
              this.router.navigate(['/welcome'], { queryParams: { action: params.action, provider: this.qParams['provider'] } });
            }
            else {
              this.router.navigate(['/welcome'], { queryParams: { action: params.action, provider: this.form.controls["username"].value } });
            }
          }
        }, err => {
          console.log("err", err);
        });
      }, err => {
        // console.log("err", err);
        if (err.status == 406) {
          Swal({
            type: 'error',
            title: 'Oops...',
            text: 'Sorry! Please register from  invitation link provided.!',
          });
        } else if (err.status == 409) {
          Swal({
            type: 'error',
            title: 'Oops...',
            text: 'Sorry! Please register with another username as its already taken.!',
          });
        }
      });
      // }
      // else {
      //   Swal({
      //     title: "Warning?",
      //     text: "Please register from invitation link provided.",
      //     type: "warning",
      //     confirmButtonClass: "btn-warning",
      //     confirmButtonText: "OK!",
      //   });
      // }
    }
  }

  userView(referral) {
    this.authService.userview(referral).subscribe(result => {
      if (result === true) {
        console.log("User viewed with referral: ", this.referral);
      }
    }, err => {
      console.log("err", err);
    });
  }

  loginPageNavigate() {
    // console.log(this.qParams);
    this.router.navigate(['/login'], { queryParams: this.qParams });
  }

  filterCategoriesBasedOnProfession(categories) {
    // fetch sub categories
    // console.log(categories);
    var filteredCategories = [];
    categories.forEach(cat => {
      // console.log("selected category : ", cat);
      this.authService.getAllCategories().filter(category => category.category == cat.id).forEach((filCat) => {
        // console.log("filtered categories : ", filCat);
        filCat.subCategory.forEach((fsubcat) => {
          // console.log("filteres sub category : ", fsubcat);
          filteredCategories.push(fsubcat);
        });
      });
    });
    console.log("filteredCategories", filteredCategories);
    this.subCategories = filteredCategories;
  }

  refreshCategory(category: any) {
    console.log(category);
    var categoriesSelected = [];
    category.forEach(item => {
      categoriesSelected.push(item.id);
    })
    this.formprovider.controls['profession'].setValue(categoriesSelected.join(', '));
    this.filterCategoriesBasedOnProfession(category);
  }
  selectedCategory(category: any) {
    // console.log(category);
  }
  removedCategory(category: any) {
    // console.log(category);
  }
  refreshSubCategory(scategory: any) {
    console.log(scategory);
    var subcategoriesSelected = [];
    scategory.forEach(item => {
      subcategoriesSelected.push(item.id);
    })
    this.formprovider.controls['category'].setValue(subcategoriesSelected.join(', '));
  }
  selectedSubCategory(scategory: any) {

  }
  removedSubCategory(scategory: any) {

  }

}
