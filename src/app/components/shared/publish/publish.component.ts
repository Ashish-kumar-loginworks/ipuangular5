import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit {
  user: any = undefined;
  mobileView: Boolean = false;
  appPublishUserUrl: String = "";
  appInviteUserUrl: String = "";
  inviteWhastApp: String = "";
  publishWhastApp: String = "";
  providers: any[] = [];
  publishUserPopUpShown = false;
  InviteUserPopUpShown = false;
  detailUserPopUpShown = false;
  selectedUser: any = undefined;
  searchProvideForm: FormGroup;
  publishForm: FormGroup;
  inviteForm: FormGroup;
  location: any = {
    latitude: 0,
    longitude: 0
  };
  categories = [];
  subCategories = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    if (window.outerWidth < 600) {
      this.mobileView = true;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        console.log("Geolocation result:", position);
        console.log("latitude: ", position.coords.latitude);
        console.log("longitude: ", position.coords.longitude);
        this.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        localStorage.setItem("location", JSON.stringify(this.location));
      }, err => {
        console.log("Geolocation error: ", err);
      });
    } else {
      console.log("Unable to find user's location due to geolocation not supported in this browser.");
    }

    this.categories = this.authService.getAllCategories();

    this.appInviteUserUrl = "www.ipublishu.com/signup?action=invite_provider&type=Provider&referral=";

    this.searchProvideForm = this.fb.group({
      search: ["", Validators.compose([Validators.required])],
      profession: ["", Validators.compose([Validators.required])],
      category: ["", Validators.compose([Validators.required])],
    });

    this.publishForm = this.fb.group({
      reference: ["", Validators.compose([Validators.required])],
      email: ["", Validators.compose([Validators.email])],
      phone: ["", Validators.compose([Validators.pattern(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/), Validators.minLength(10)])],
      destinationType: ["EMAIL", Validators.compose([Validators.required])],
    });
    this.inviteForm = this.fb.group({
      reference: ["", Validators.compose([Validators.required])],
      email: ["", Validators.compose([Validators.email])],
      phone: ["", Validators.compose([Validators.pattern(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/), Validators.minLength(10)])],
      destinationType: ["EMAIL", Validators.compose([Validators.required])],
    });

    this.user = JSON.parse(localStorage.getItem("userInfo"));
    var user = JSON.parse(localStorage.getItem("userInfo"))._id;
    // var publishMessage = JSON.parse(localStorage.getItem("userInfo")).messages.publish_provider;
    // publishMessage = publishMessage.replace("[link]", "") + this.appPublishUserUrl;
    // this.publishForm.controls["reference"].setValue(publishMessage);

    var inviteUserMessage = JSON.parse(localStorage.getItem("userInfo")).messages.invite_user;
    inviteUserMessage = inviteUserMessage.replace("[link]", "") + this.appInviteUserUrl + user;
    this.inviteForm.controls["reference"].setValue(inviteUserMessage);
    this.inviteUserWhatsappShare(inviteUserMessage);

    if (this.activatedRoute.snapshot.queryParams.provider) {
      console.log(this.activatedRoute.snapshot.queryParams.provider);
      var publishedProvider = this.activatedRoute.snapshot.queryParams.provider;
      this.searchProvideForm.controls["search"].setValue(publishedProvider);
      this.getWelcomeSelectedProvider(publishedProvider);
    }

  }

  publishUserPopUpShow(user) {
    this.publishUserPopUpShown = !this.publishUserPopUpShown;
    this.selectedUser = user;

    // create publish provider link
    var publishMessage = JSON.parse(localStorage.getItem("userInfo")).messages.publish_provider;
    var referer = JSON.parse(localStorage.getItem("userInfo"))._id;
    this.appPublishUserUrl = "www.ipublishu.com/user/" + this.selectedUser._id + "?action=publish_provider&referral=" + referer + "&provider=" + this.selectedUser._id;
    publishMessage = publishMessage.replace("[link]", this.appPublishUserUrl);
    this.publishForm.controls["reference"].setValue(publishMessage);
    this.publishUserWhatsappShare(publishMessage);
  }
  publishUserPopUpHide() {
    this.publishUserPopUpShown = !this.publishUserPopUpShown;
  }

  detailUserPopUpShow(userID) {
    console.log("selected user", userID);
    this.getSelectedProviderDetails(userID);
  }
  detailUserPopUpHide() {
    this.detailUserPopUpShown = !this.detailUserPopUpShown;
  }

  InviteUserPopUpShow() {
    this.InviteUserPopUpShown = !this.InviteUserPopUpShown;
  }
  InviteUserPopUpHide() {
    this.InviteUserPopUpShown = !this.InviteUserPopUpShown;
  }

  onPublishUserFormSubmit() {
    console.log(this.publishForm.value);
    var token = localStorage.getItem("token");
    this.authService.referUser(this.publishForm.value, token).subscribe(result => {
      if (result)
        alert("Publish user request sent successfully.");
      this.publishForm.controls['phone'].setValue("");
      this.publishForm.controls['email'].setValue("");
    }, err => {
      console.log("err", err);
      alert("Unable to send publish user request due to some error. Please try again.");
    });
  }

  onInviteUserFormSubmit() {
    var token = localStorage.getItem("token");
    this.authService.inviteUser(this.inviteForm.value, token).subscribe(result => {
      if (result)
        alert("Invitation sent successfully.");
      this.inviteForm.controls['phone'].setValue("");
      this.inviteForm.controls['email'].setValue("");
      this.inviteForm.controls['email'].setErrors(null);
      this.InviteUserPopUpHide();
    }, err => {
      console.log("err", err);
      alert("Unable to send invitation due to some error. Please try again.");
    });
  }

  getAllProviders() {
    var token = localStorage.getItem("token");
    var page = 0;
    var formData = this.searchProvideForm.value;
    var profession = formData.profession ? formData.profession : '';
    var search = formData.search ? formData.search : '';
    var category = formData.category ? formData.category : '';
    var longlat = localStorage.location ? localStorage.location : '';
    this.authService.publishsearchProviders(search, profession, category, longlat, token, page).subscribe(result => {
      if (result) {
        console.log("Publishers provided response", result);
        var user = JSON.parse(result._body);
        console.log(user);
        if (user.length > 0)
          this.providers = user;
      }
    }, err => {
      console.log("err", err);
      console.log("Unable to find provider u are looking for.");
    });
  }

  getSelectedProviderDetails(id) {
    this.authService.getSelectedProviderDetails(id).subscribe(result => {
      if (result) {
        console.log("Selected provider details", JSON.parse(result._body));
        var user = JSON.parse(result._body);
        this.selectedUser = user;
        this.detailUserPopUpShown = !this.detailUserPopUpShown;
      }
    }, err => {
      console.log("err", err);
      console.log("Unable to find provider u are looking for.");
    });
  }

  getWelcomeSelectedProvider(searchString) {
    var token = localStorage.getItem("token");
    var page = 0;
    var longlat = localStorage.location ? localStorage.location : '';
    this.authService.searchProviders(searchString, token, page, longlat).subscribe(result => {
      if (result) {
        console.log("Publishers provided response", result);
        var user = JSON.parse(result._body);
        console.log(user);
        if (user != []) {
          this.providers = user;
          // if (this.activatedRoute.snapshot.queryParams.details == 'true')
          //   this.getSelectedProviderDetails(this.providers[0]._id);
        }
      }
    }, err => {
      console.log("err", err);
      console.log("Unable to find provider u are looking for.");
    });
  }

  inviteUserWhatsappShare(message) {
    var linkPos = message.indexOf("www.ipublishu.com");
    var text = encodeURI(message.slice(0, linkPos));
    var link = message.slice(linkPos);
    link = link.split("&").join("%26");
    link = link.split("=").join("%3D");
    this.inviteWhastApp = "https://api.whatsapp.com/send?text=" + text + link;
    // this.inviteWhastApp = "whatsapp://send?text=" + encodeURI(message);
    console.log(this.inviteWhastApp);
  }
  publishUserWhatsappShare(message) {
    var linkPos = message.indexOf("www.ipublishu.com");
    var text = encodeURI(message.slice(0, linkPos));
    var link = message.slice(linkPos);
    link = link.split("&").join("%26");
    link = link.split("=").join("%3D");
    this.publishWhastApp = "https://api.whatsapp.com/send?text=" + text + link;
    // this.inviteWhastApp = "whatsapp://send?text=" + encodeURI(message);
    console.log(this.publishWhastApp);
  }
  filterCategoriesBasedOnProfession(profession) {
    this.subCategories = this.categories.find(cat => cat.category == profession).subCategory;
  }
}
