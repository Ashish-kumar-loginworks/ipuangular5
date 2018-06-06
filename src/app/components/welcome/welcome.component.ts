import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http } from '@angular/http';
import { ChatComponent } from '../shared/chat/chat.component';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  appInviteUserUrl: String = "";
  username: String = "";
  userTypeIsProvider: Boolean = false;
  user: any;
  inviteForm: FormGroup;
  referForm: FormGroup;
  searchProvideForm: FormGroup;
  publishForm: FormGroup;
  searchedUsers: any = [];
  selectedUser: any = undefined;
  detailUserPopUpShown: boolean = false;
  inviteAction: String = "";
  publishUserPopUpShown = false;
  appPublishUserUrl: String = "";
  showDetailsPublishScreen: boolean = false;
  isMobile: boolean = false;
  location: any = {
    latitude: 0,
    longitude: 0
  };
  notifications: any = [];

  // to show selected modal
  publishProvider: Boolean = false;
  askForReferral: Boolean = false;
  inviteUser: Boolean = false;
  dashboardShow: Boolean = false;
  userShow: Boolean = false;
  registerShow: Boolean = false;
  referShow: Boolean = false;

  // for chat
  userId: String;


  // encoded invitations for whatsapp sharing
  inviteWhastApp: string = "";
  publishWhastApp: string = "";
  referWhastApp: string = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private http: Http
  ) {
  }

  ngOnInit() {
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
        console.log("Geolocation error: ", err);
      });
    } else {
      console.log("Unable to find user's location due to geolocation not supported in this browser.");
    }

    if (window.innerWidth < 720) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }

    var self = this;
    window.addEventListener("resize", function () {
      if (window.innerWidth < 720) {
        self.isMobile = true;
      }
      else {
        self.isMobile = false;
      }
    });
    this.appInviteUserUrl = "www.ipublishu.com/signup?action=invite_provider&type=Provider&referral=";
    this.publishForm = this.fb.group({
      reference: ["", Validators.compose([Validators.required])],
      email: ["", Validators.compose([Validators.email])],
      phone: ["", Validators.compose([Validators.pattern(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/), Validators.minLength(10)])],
      destinationType: ["EMAIL", Validators.compose([Validators.required])],
    });
    // console.log("invitation action",this.activatedRoute.snapshot.params);
    this.appInviteUserUrl = "www.ipublishu.com";
    // initialize invite form
    this.inviteForm = this.fb.group({
      reference: ["", Validators.compose([Validators.required])],
      email: ["", Validators.compose([Validators.email])],
      type: ["User", Validators.compose([Validators.required])],
      phone: ["", Validators.compose([Validators.pattern(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/), Validators.minLength(10)])],
      destinationType: ["EMAIL", Validators.compose([Validators.required])],
    });
    // ask for referral form
    this.referForm = this.fb.group({
      reference: ["", Validators.compose([Validators.required])],
      email: ["", Validators.compose([Validators.email])],
      phone: ["", Validators.compose([Validators.pattern(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/), Validators.minLength(10)])],
      destinationType: ["SMS", Validators.compose([Validators.required])],
    });
    // publish provider search form
    this.searchProvideForm = this.fb.group({
      search: ["", Validators.compose([Validators.required])],
    });

    this.getUserInfo();

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.action) {
        this.inviteAction = params.action;
        switch (params.action) {
          case "invite_user": this.inviteUserShow();
            break;
          case "ask_referral": this.publishProviderShow();
            if (params.provider) {
              this.searchProvideForm.controls["search"].setValue(params.provider);
              this.searchProvider();
            }
            break;
          // case "publish_provider": this.publishProviderShow(); // show payy screen
          //   break;
          case "invite_provider":
            /* changes as per comments set 2 given by by niv */
            // this.askForReferralShow();

            // var token = localStorage.getItem("token");
            // this.referForm.controls["email"];
            // this.authService.referUser(message, token).subscribe(result => {
            //   if (result)
            //     alert("Referral request sent successfully.");
            // }, err => {
            //   console.log("err", err);
            //   alert("Unable to send referral request due to some error. Please try again.");
            // });
            // automatically send ask_for_referral to referrer

            break;
          default: console.log("");
        }
      }
    });
  }


  getUserInfo() {
    var token = localStorage.getItem("token");
    var username = localStorage.getItem("username");
    // get user info
    this.authService.getUserInfo(username, token).subscribe(result => {
      var response = JSON.parse(result._body);
      this.user = response;
      // console.log("user: ", this.user);
      // temporary save logged in user info
      localStorage.setItem("userInfo", JSON.stringify(response));
      this.username = response.name;
      var self = this;
      response.notifications.forEach(m => {
        var a = self.getUrlFromString(m);
        self.notifications.push(a);
      });
      // set invite user message
      var inviteUserMessage = response.messages.invite_user.replace("[link]", "");
      inviteUserMessage += this.appInviteUserUrl + "/signup?action=invite_user&referral=" + response._id + "&type=User";
      this.inviteForm.controls["reference"].setValue(inviteUserMessage);
      this.inviteUserWhatsappShare(inviteUserMessage);

      // set referral message for user
      var referMessage = response.messages.ask_referral.replace("[link]", "");
      // console.log(typeof referMessage);

      // referMessage = referMessage.substring(0,referMessage.indexOf("[link]"));
      referMessage += this.appInviteUserUrl + "/welcome?action=ask_referral&provider=" + response._id;
      this.referForm.controls["reference"].setValue(referMessage);
      this.referUserWhatsappShare(referMessage);
      // if user provides services and have profession set current user screen as provider  
      if (response.providing) {
        if (response.providing.profession != "" || response.providing.profession != undefined) {
          // show options for provider user
          this.userTypeIsProvider = true;
        }
      }
      // console.log("User info", response);
    }, err => {
      // console.log("err", err);
      alert("Unable to retrieve your information from server.");
    });
  }

  getUrlFromString(Stringtext) {
    var urlRegex = /((http:\/\/)?(www)|ipublishu.com[^\s]+)/g;
    return Stringtext.replace(urlRegex, url => {
      return '<a href="http://' + url + '">' + url + '</a>';
    })
  }
  publishProviderShow() {
    this.publishProvider = true;
    this.askForReferral = false;
    this.inviteUser = false;
    this.dashboardShow = false;
    this.userShow = false;
    this.registerShow = false;
    this.referShow = false;
  };

  askForReferralShow() {
    this.publishProvider = false;
    this.inviteUser = false;
    this.askForReferral = true;
    this.dashboardShow = false;
    this.userShow = false;
    this.registerShow = false;
    this.referShow = true;
  };

  inviteUserShow() {
    this.inviteUser = true;
    this.publishProvider = false;
    this.askForReferral = false;
    this.dashboardShow = false;
    this.userShow = false;
    this.registerShow = false;
    this.referShow = false;
  };

  // navigate to publish provider screen
  registerProviderShow() {
    this.inviteUser = false;
    this.publishProvider = false;
    this.askForReferral = false;
    this.dashboardShow = false;
    this.userShow = false;
    this.registerShow = true;
    this.referShow = false;
    this.router.navigate(['/user']);
  };

  // navigate to user dashboard
  navigateToDashboard() {
    this.inviteUser = false;
    this.publishProvider = false;
    this.askForReferral = false;
    this.dashboardShow = true;
    this.userShow = false;
    this.registerShow = false;
    this.referShow = false;
    this.router.navigate(['/dashboard']);
  };

  // navigate to user profile screen
  navigateToProfile() {
    this.inviteUser = false;
    this.publishProvider = false;
    this.askForReferral = false;
    this.dashboardShow = false;
    this.userShow = true;
    this.registerShow = false;
    this.referShow = false;
    this.router.navigate(['/user']);
  };

  // send invitation to user
  onInviteUserFormSubmit() {
    // console.log(this.inviteForm.value);
    var token = localStorage.getItem("token");
    this.authService.inviteUser(this.inviteForm.value, token).subscribe(result => {
      if (result) {
        alert("Invitation sent successfully.");
        this.inviteForm.controls["phone"].setValue("");
        this.inviteForm.controls["email"].setValue("");
      }
    }, err => {
      console.log("err", err);
      alert("Unable to send invitation due to some error. Please try again.");
    });
  }

  // send referral request
  onReferUserFormSubmit() {
    // console.log(this.referForm.value);
    var token = localStorage.getItem("token");
    this.authService.referUser(this.referForm.value, token).subscribe(result => {
      this.referForm.controls["phone"].setValue("");
      this.referForm.controls["email"].setValue("");
      if (result) {
        alert("Referral request sent successfully.");
      }
    }, err => {
      console.log("err", err);
      alert("Unable to send referral request due to some error. Please try again.");
    });
  }

  navigateToPublishUser() {
    var searchString = this.searchProvideForm.controls["search"].value;
    // console.log("searchString", searchString);
    this.router.navigate(['/publish'], { queryParams: { provider: searchString } });
  }

  searchProvider() {
    var searchString = this.searchProvideForm.controls["search"].value;
    var token = localStorage.getItem("token");
    var longlat = localStorage.location ? localStorage.location : '';
    var page = 0;
    if (searchString.length > 2) {
      this.authService.searchProviders(searchString, token, page, longlat).subscribe(result => {
        if (result) {
          // console.log("searchedUsers response", result);
          var user = JSON.parse(result._body);
          // console.log(user);
          if (user != [])
            this.searchedUsers = user;
        }
      }, err => {
        console.log("err", err);
        alert("Unable to find provider u are looking for.");
      });
    }
  }

  logout() {
    this.authService.logout();
  }

  publishClick(provider) {
    var id = this.user._id;
    var token = localStorage.getItem("token");
    var body = {
      provider: provider._id
    };
    this.authService.publishClick(id, token, body).subscribe(result => {
      // console.log(result);
      if (result === true) {
        // alert("Selected user published successfully.");
      }
    }, err => {
      // console.log("err", err);
      // alert("Sorry unable to process. Please try again.");
    });
  }

  searchSelectedUser(selectedPublishedUser) {
    // console.log("selectedPublishedUser",selectedPublishedUser.target_str);
    this.searchProvideForm.controls["search"].setValue(selectedPublishedUser.target);
    this.showDetailsPublishScreen = true;
    this.searchProvider();
  }

  detailUserPopUpShow(id) {
    // console.log("selected user", id);
    this.authService.getSelectedProviderDetails(id).subscribe(result => {
      if (result) {
        // console.log("Selected provider details", JSON.parse(result._body));
        var user = JSON.parse(result._body);
        this.selectedUser = user;
        this.detailUserPopUpShown = !this.detailUserPopUpShown;
      }
    }, err => {
      console.log("err", err);
      console.log("Unable to find provider u are looking for.");
    });
  }
  detailUserPopUpHide() {
    this.detailUserPopUpShown = !this.detailUserPopUpShown;
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
  onPublishUserFormSubmit() {
    // console.log(this.publishForm.value);
    var token = localStorage.getItem("token");
    this.authService.referUser(this.publishForm.value, token).subscribe(result => {
      if (result)
        alert("Publish user request sent successfully.");
    }, err => {
      console.log("err", err);
      alert("Unable to send publish user request due to some error. Please try again.");
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
    // console.log(this.inviteWhastApp);
  }
  publishUserWhatsappShare(message) {
    var linkPos = message.indexOf("www.ipublishu.com");
    var text = encodeURI(message.slice(0, linkPos));
    var link = message.slice(linkPos);
    link = link.split("&").join("%26");
    link = link.split("=").join("%3D");
    this.publishWhastApp = "https://api.whatsapp.com/send?text=" + text + link;
    // this.inviteWhastApp = "whatsapp://send?text=" + encodeURI(message);
    // console.log(this.publishWhastApp);
  }
  referUserWhatsappShare(message) {
    var linkPos = message.indexOf("www.ipublishu.com");
    var text = encodeURI(message.slice(0, linkPos));
    var link = message.slice(linkPos);
    link = link.split("&").join("%26");
    link = link.split("=").join("%3D");
    this.referWhastApp = "https://api.whatsapp.com/send?text=" + text + link;
    // this.inviteWhastApp = "whatsapp://send?text=" + encodeURI(message);
    // console.log(this.referWhastApp);
  }

  changeUserType() {
    // console.log(this.inviteForm.value);
    var form = this.inviteForm.value;
    var newMsg = '';
    var oldreference = form.reference;
    var params = JSON.parse('{"' + decodeURI(oldreference.slice(oldreference.indexOf('?'))).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    var apiInvite_ProviderMessage = this.user.messages.invite_provider;
    var apiInvite_UserMessage = this.user.messages.invite_provider;
    // console.log(this.user.name);
    if (form.type == "Provider") {
      apiInvite_ProviderMessage = apiInvite_ProviderMessage.replace("[name]", '[' + this.user.name + ' ' + this.user.lastname + ']');
      newMsg = apiInvite_ProviderMessage.replace("[link]", "www.ipublishu.com/signup?action=invite_provider&type=Provider&referral=") + params.referral;
    }
    else {
      newMsg = apiInvite_UserMessage.replace("[link]", "www.ipublishu.com/signup?action=invite_user&type=User&referral=") + params.referral;
    }

    // var indexOfType = old.indexOf("&type=");
    // var indexOfaction = old.indexOf("?action=");
    // var indexOfreferral = old.indexOf("&referral=");
    // var typeChangedText = old.slice(0, indexOfType) + "&type=" + this.inviteForm.value.type;
    // var action = this.inviteForm.value.type == "User" ? 'invite_user' : 'invite_provider';
    // var newText = typeChangedText.slice(0, indexOfaction) + "?action=" + action + typeChangedText.slice(indexOfreferral);

    // console.log(newText);
    this.inviteForm.controls["reference"].setValue(newMsg);
    this.inviteUserWhatsappShare(newMsg);
  }

  showInviteProvider() {
    this.inviteUserShow();
    var search = this.searchProvideForm.value.search;
    // console.log(search);
    if (search.indexOf("@") > -1) {
      this.inviteForm.controls["type"].setValue("Provider");
      this.inviteForm.controls["destinationType"].setValue("EMAIL");
      this.inviteForm.controls["email"].setValue(search);
    } else {
      this.inviteForm.controls["type"].setValue("Provider");
      this.inviteForm.controls["destinationType"].setValue("SMS");
      this.inviteForm.controls["phone"].setValue(search);
    }
  }

  notificationsClick() {
    var id = this.user._id;
    var token = localStorage.getItem("token");
    var body = {
      user: this.user._id,
    };
    console.log(body);
    this.authService.notificationsClick(id, token, body).subscribe(result => {
      console.log(result);
      if (result === true) {
        // alert("Your messages are Deleted successfully.");
      }
    }, err => {
      // console.log("err", err);
      // alert("Sorry unable to process. Please try again.");
    });
  }

} // end of welcome component
