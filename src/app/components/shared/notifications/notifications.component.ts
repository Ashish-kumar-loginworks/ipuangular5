import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  // allSelected: boolean = false;
  notifications: any[] = [];
  // seleectedNotifications: any[] = [];
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    var user = JSON.parse(localStorage.getItem("userInfo"));
    // this.notifications = user.notifications;
    var self = this;
    user.notifications.forEach(m => {
      var a = self.getUrlFromString(m);
      self.notifications.push(a);
    });
  }

  getUrlFromString(Stringtext) {
    var urlRegex = /((http:\/\/)?(www)|ipublishu.com[^\s]+)/g;
    return Stringtext.replace(urlRegex, url =>  {
      return '<a href="http://' + url + '">' + url + '</a>';
    })
  }
  // selectNote(id) {
  //   this.notifications.forEach(note => {
  //     if (note._id == id) {
  //       note.selected = true;
  //     }
  //   });
  // }
  // selectAll() {
  //   this.allSelected = !this.allSelected;
  //   this.notifications.forEach(note => {
  //     note.selected = this.allSelected;
  //   });
  // }
  // deleteNote(id) {
  //   this.notifications = this.notifications.filter(note => note._id != id);
  // }
  deleteAll() {
    this.notifications = [];
    var id = JSON.parse(localStorage.getItem("userInfo"))._id;
    var token = localStorage.getItem("token");
    var body = {
      user: localStorage.getItem("username"),
    };
    this.authService.notificationsClick(id, token, body).subscribe(result => {
      if (result === true) {
        alert("Your messages are Deleted successfully.");
      }
    }, err => {
      // console.log("err", err);
      alert("Sorry unable to process. Please try again.");
    });
  }
}
