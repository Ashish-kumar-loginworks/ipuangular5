import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() user: any;
  @Input() isOpened: boolean;
  @Output() toggleNav = new EventEmitter();
  @Output() toggleHeaderNav = new EventEmitter();
  toggleheader: boolean = false;
  isMobile: boolean = false;
  notifications: any = [];
  userInfo: any = {};
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    if (window.innerWidth < 768) {
      // this.toggleheader = true;
      this.isMobile = true;
      this.toggleheader = true;
      var self = this;
      this.user.notifications.forEach(m => {
        var a = self.getUrlFromString(m);
        self.notifications.push(a);
      });
    }
    this.getUserInfo();
  }
  getUrlFromString(Stringtext) {
    var urlRegex = /((http:\/\/)?(www)|ipublishu.com[^\s]+)/g;
    return Stringtext.replace(urlRegex, url => {
      return '<a href="http://' + url + '">' + url + '</a>';
    })
  }
  togglenavBarOnClick() {
    this.isOpened = !this.isOpened;
    this.toggleNav.emit(this.isOpened);
  }
  toggleHeaderBarOnClick() {
    this.toggleheader = !this.toggleheader;
    this.toggleHeaderNav.emit(this.toggleheader);
  }
  getUserInfo() {
    var token = localStorage.getItem("token");
    var username = localStorage.getItem("username");
    // get user info
    this.authService.getUserInfo(username, token).subscribe(result => {
      var response = JSON.parse(result._body);
      this.userInfo = response;
      var self = this;
      response.notifications.forEach(m => {
        var a = self.getUrlFromString(m);
        self.notifications.push(a);
      });
      localStorage.setItem("userInfo", JSON.stringify(response));
    }, err => {
      console.log("Unable to retrieve your information from server.");
    });
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

  logout() {
    this.authService.logout();
  }
}
