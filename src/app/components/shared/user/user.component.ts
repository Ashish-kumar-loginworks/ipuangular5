import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import Swal from 'sweetalert2';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user: any = {
    firstname: "",
    lastname: "",
    address: "",
    email: "",
    phone: "",
    _id: "",
    referral: "",
    stats: "",
    providing: {
      category: "",
      profession: "",
      website: "",
      about: ""
    },
  };
  isProvider: boolean = false;
  uploader: FileUploader;
  uploadimageDetails: any = {};
  basicDetails: FormGroup;
  bussinessDetails: FormGroup;
  otpForm: FormGroup;
  otpForm1: FormGroup;
  activetab: String = "PayHistory";
  categories = [];
  subCategories = [];
  otpFormShown = false;
  otpForm1Shown = false;
  userCategories = [];
  usersubCategories = [];

  @ViewChild("search1")
  public searchElementRef1: ElementRef;

  constructor(
    private _fb: FormBuilder,
    private cloudinary: Cloudinary,
    private zone: NgZone,
    private http: HttpClient,
    private router: Router,
    private authService: AuthenticationService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }
  ngOnInit() {

    // fetch categories
    // this.categories = this.authService.getAllCategories().map(category => { return category.category });
    this.authService.getAllCategories().forEach(cat => {
      this.categories.push(cat.category);
      cat.subCategory.forEach(sub => {
        this.subCategories.push(sub);
      });
    })

    this.basicDetails = this._fb.group({
      firstname: ["", Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      lastname: ["", Validators.compose([Validators.minLength(3), Validators.maxLength(100)])],
      email: ["", Validators.compose([Validators.required, Validators.email])],
      phone: ["", Validators.compose([Validators.minLength(10), Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)])],
    });
    this.bussinessDetails = this._fb.group({
      profession: ["", Validators.compose([Validators.required])],
      category: ["", Validators.compose([Validators.required])],
      website: ["", Validators.compose([Validators.pattern(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/)])],
      address: ["", Validators.compose([Validators.required])],
      about: [""],
    });
    this.otpForm = this._fb.group({
      otp: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
    });
    this.otpForm1 = this._fb.group({
      otp: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
    });

    this.getUserDetailsByID();

    this.mapsAPILoader.load().then(() => {
      let autocomplete1 = new google.maps.places.Autocomplete(this.searchElementRef1.nativeElement, {
        types: ["address"]
      });
      autocomplete1.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete1.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          // set google finded address as address for new user
          this.bussinessDetails.controls["address"].setValue(this.searchElementRef1.nativeElement.value);
        });
      });
    });

    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/upload`,
      // Upload files automatically upon addition to upload queue
      autoUpload: true,
      // Use xhrTransport in favor of iframeTransport
      isHTML5: true,
      // Calculate progress independently for each uploaded file
      removeAfterUpload: true,
      // XHR request headers
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        }
      ]
    };
    this.uploader = new FileUploader(uploaderOptions);

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      // Add Cloudinary's unsigned upload preset to the upload form
      form.append('upload_preset', this.cloudinary.config().upload_preset);
      // Add file to upload
      form.append('file', fileItem);
      // Use default "withCredentials" value for CORS requests
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
      var uploadImageResponse = JSON.parse(response);
      console.log("uploaded Image Response: ", uploadImageResponse);
      this.uploadimageDetails = uploadImageResponse;
      // send upload response like public id and url to api
      this.uploadedImageDetailsSend(uploadImageResponse);
    }
  }

  // update image for user image 
  uploadedImageDetailsSend(imageUploadedDetails) {
    var id = JSON.parse(localStorage.userInfo)._id;
    var token = localStorage.token;
    this.authService.saveUserImage(id, token, imageUploadedDetails.public_id).subscribe(result => {
      console.log("result", result);
      if (result == true) {
        // alert("Image uploaded successfully.");
        // show latest image
        Swal({
          type: 'success',
          title: 'Success',
          text: 'Your profile updated successfully.!',
        });
        this.getUserDetailsByID();
        // show latest image in header and navbar
        // console.log();
      }
    }, err => {
      // console.log("err", err);
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Sorry unable to update your profile image. Please try again.!',
      });
    });
  }

  // get logged in user User Details
  getUserDetailsByID() {
    var token = localStorage.token;
    var id = JSON.parse(localStorage.userInfo)._id;
    this.authService.getUserInfo(id, token).subscribe(result => {
      var response = JSON.parse(result._body);
      // console.log("user response", response);
      this.authService.onProfileUpdate.emit(response);
      this.user = response;
      if (this.user.providing) {
        this.isProvider = true;
      }
      this.basicDetails.controls["firstname"].setValue(response.name);
      this.basicDetails.controls["lastname"].setValue(response.lastname);
      this.basicDetails.controls["email"].setValue(response.email);
      this.basicDetails.controls["phone"].setValue(response.phone);
      if (response.providing) {
        var userProfession = response.providing.profession.split(","),
          userCategories = response.providing.category.split(",");
        var professionArray = [], categoriesArray = [];
        if (userProfession.length > 0) {
          userProfession.forEach(profession => {
            let professionTrimmed = profession.trim();
            professionArray.push({
              id: professionTrimmed,
              text: professionTrimmed
            });
          });
        }
        if (userCategories.length > 0) {
          userCategories.forEach(category => {
            let categoryTrimmed = category.trim();
            categoriesArray.push({
              id: categoryTrimmed,
              text: categoryTrimmed
            });
          });
        }

        this.userCategories = professionArray;
        this.usersubCategories = categoriesArray;

        this.bussinessDetails.controls["profession"].setValue(response.providing.profession);
        this.bussinessDetails.controls["category"].setValue(response.providing.category);
        this.bussinessDetails.controls["address"].setValue(response.address);
        this.bussinessDetails.controls["website"].setValue(response.providing.website);
        this.bussinessDetails.controls["about"].setValue(response.providing.about);
      }
    }, err => {
      // console.log("err", err);
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Unable to fetch data from server. Maybe your session expired. Please Login again again.!',
      });
    });
  }

  sendOtpForBasicDetails() {
    // console.log(this.basicDetails.value);
    if (this.basicDetails.value.phone == '' || this.basicDetails.value.phone == undefined) {
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Plesae fill mobile number to send otp.',
      });
    }
    else {
      var phone = this.basicDetails.value.phone,
        user = this.user._id,
        calltype = "update";
      this.authService.sendOtp(phone, calltype, user).subscribe(result => {
        if (result == true) {
          this.otpFormShown = true;
        } else {
          this.otpFormShown = false;
          Swal({
            type: 'error',
            title: 'Oops...',
            text: 'Sorry unable to send opt request. Please try again.!',
          });
        }
      }, err => {
        this.otpFormShown = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to send opt request. Please try again.!',
        });
      });
    }
  }

  // verifyOtp() {
  //   var otp = this.otpForm.value.otp,
  //     calltype = "update",
  //     user = this.user._id;
  //   this.authService.verifyOtp(calltype, otp, user).subscribe(result => {
  //     if (result == true) {
  //       this.otpFormShown = false;
  //       this.onBasicFormSubmit();
  //     }
  //   }, err => {
  //     alert("Wrong Otp sent. Please try again.");
  //   });
  // }

  onBasicFormSubmit() {
    // console.log(this.basicDetails.value);
    var form = this.basicDetails.value;
    var token = localStorage.token;
    var id = JSON.parse(localStorage.userInfo)._id;
    var firstname = form.firstname;
    var lastname = form.lastname;
    var address = this.bussinessDetails.value.address;
    var email = form.email;
    var phone = form.phone;
    var otp = this.otpForm.value.otp;
    this.authService.updateUserDetails(id, token, firstname, lastname, email, phone, address, otp).subscribe(result => {
      if (result == true) {
        this.otpFormShown = false;
        Swal({
          type: 'success',
          title: 'Success',
          text: 'Your profile updated successfully.!',
        });
      } else {
        this.otpFormShown = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to process your request. Please try again.!',
        });
      }
    }, err => {
      // console.log("err", err);
      this.otpFormShown = false;
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Sorry unable to process your request. Please try again.!',
      });
    });
  }

  sendBussinessOtp() {
    // console.log(this.basicDetails.value);
    if (this.basicDetails.value.phone == '' || this.basicDetails.value.phone == undefined) {
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Plesae update your mobile number under Basic Details to recieve otp.',
      });
    }
    else {
      var phone = this.basicDetails.value.phone,
        user = this.user._id,
        calltype = "update";
      this.authService.sendOtp(phone, calltype, user).subscribe(result => {
        if (result == true) {
          this.otpForm1Shown = true;
        } else {
          this.otpForm1Shown = false;
          Swal({
            type: 'error',
            title: 'Oops...',
            text: 'Sorry unable to send OTP. Please try again.!',
          });
        }
      }, err => {
        this.otpForm1Shown = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to send OTP. Please try again.!',
        });
      });
    }
  }

  onBussinessDetailsFormSubmit() {
    var form = this.bussinessDetails.value;
    var token = localStorage.token;
    var id = JSON.parse(localStorage.userInfo)._id;
    var profession = form.profession;
    var category = form.category;
    var website = form.website;
    var address = form.address;
    var about = form.about;
    var otp = this.otpForm1.value.otp;
    this.authService.saveProviderDetails(id, token, profession, category, website, address, about, otp).subscribe(result => {
      if (result === true) {
        this.otpForm1Shown = false;
        Swal({
          type: 'success',
          title: 'Success',
          text: 'Your Bussines details updated successfully.!',
        });
      } else {
        this.otpForm1Shown = false;
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Sorry unable to process your request. Please try again.!',
        });
      }
    }, err => {
      // console.log("err", err);
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Sorry unable to process your request. Please try again.!',
      });
    });
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
    this.bussinessDetails.controls['profession'].setValue(categoriesSelected.join(', '));
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
    this.bussinessDetails.controls['category'].setValue(subcategoriesSelected.join(', '));
  }
  selectedSubCategory(scategory: any) {

  }
  removedSubCategory(scategory: any) {

  }

}
