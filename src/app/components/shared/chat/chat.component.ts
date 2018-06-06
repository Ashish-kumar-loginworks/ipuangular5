import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ChatService } from "../../../services/chat.service";
import { ChatMessage } from "../../../models/ChatMessage";
import { Router, ActivatedRoute, Params } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages = [];
  chatForm: FormGroup;
  hidePanelMessages: boolean = true;
  chatConneted: boolean = false;
  username = undefined;
  chatname = undefined;
  chatUsers = [];
  chatUserActive = undefined;
  emojis = ["😀", "😂", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "😗", "😙", "😚", "☺", "😑", "😶", "😏", "😣", "😥", "😮", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "😒", "😓", "😔", "😕", "😲", "☹", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "😬", "😰", "😱", "😳", "😵", "😡", "😠", "😷", "😇", "😈", "👿", "👹", "👺", "💀", "👻", "👽", "💩", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👶", "👧", "👦", "👩", "👨", "👵", "👴", "👲", "👳‍️", "👳‍️", "👮‍️", "👮‍️", "👷‍️", "👷‍️", "💂‍️", "💂‍️", "️‍👩‍️", "👨‍", "👩‍", "👨‍", "👩‍", "🍳"];
  @Input() user: any;
  @Input() providerChat: any;
  @Input() hidePanel: boolean = true;
  @Output() toggleChat = new EventEmitter();
  @ViewChild("messagesArea")
  public messagesArea: ElementRef;
  public disableChat: boolean = true;
  userAllChats = [];
  newMessage = '';

  constructor(
    private chatService: ChatService,
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (localStorage.token) {
      if (localStorage.username) {
        this.username = localStorage.username;
      }
      else if (this.user) {
        this.username = this.user._id;
      }
      this.chatForm = this._fb.group({
        message: ["", Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
      });
      var username = localStorage.username;
      this.chatConneted = true;
      var component = this;

      // console.log("router: ", this.router);
      if (this.router.url.indexOf('/user/') > -1) {
        // console.log("On provider page.");
        this.startIndividualChatWithProvider();
      } else {
        // fetch user chats
        this.fetchUserAllChat();
      }
    }
  }

  onMessageReceived = (message) => {
    // console.log("message recieved", message);
    var from = this.username, to = this.chatUserActive._id;
    // filter duplicate messages
    if (this.messages.find(m => m.time == message.time)) {
    } else {
      // if (message.sender == from || message.sender == to) {
      this.messages.push(message);
      this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
      var self = this;
      setTimeout(function () {
        self.messagesArea.nativeElement.scrollTop = self.messagesArea.nativeElement.scrollHeight;
      }, 100)
      if (message.reciever == this.chatUserActive._id) {
        // another user is active
        this.chatUserActive.status = "online";
        this.chatUserActive.color = "green";
        var otherUserIndex = this.chatUsers.findIndex(user => user._id == this.chatUserActive._id);
        this.chatUsers.splice(otherUserIndex, 1);
        this.chatUsers.push(this.chatUserActive);
      }
      // }
    }

  }

  public sendMessage(message) {
    if (this.disableChat) {
      if (localStorage.username && this.chatUserActive._id) {
        let chatName = localStorage.username + this.chatUserActive._id;
        this.chatService.connect(chatName, this.onMessageReceived, this.user._id, this.chatUserActive._id);
        let value = message.value;
        var from = this.user._id, to = this.chatUserActive._id;
        this.chatService.onSendMessage(value, from, to);
        // this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
        this.chatForm.controls["message"].setValue('');
      }
    }
    else {
      let value = message.value;
      var from = this.user._id, to = this.chatUserActive._id;
      this.chatService.onSendMessage(value, from, to);
      // this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
      this.chatForm.controls["message"].setValue('');
    }
  }

  toggle() {
    this.hidePanel = !this.hidePanel;
    var self = this;
    setTimeout(function () {
      self.messagesArea.nativeElement.scrollTop = self.messagesArea.nativeElement.scrollHeight;
    }, 50)
  }

  append(text) {
    var oldValue = this.chatForm.value.message;
    var newValue = oldValue + '' + text;
    this.chatForm.controls["message"].setValue(newValue);
  }

  findChatUsers(search) {
    // fetch users for chating
    // console.log("search string", search);
    if (search && search.length >= 3) {
      var token = localStorage.token;
      var chatUsers = [];
      this.chatService.fetchUsersforChat(search, token).subscribe(result => {
        // console.log("chat users", JSON.parse(result._body));
        var users = JSON.parse(result._body);
        if (users && Array.isArray(users)) {
          users.forEach(user => {
            var status = 'offline', color = 'gray';
            if (user.lastseen >= 300000) {
              status = 'offline';
              color = 'gray';
            } else if (user.lastseen < 300000) {
              status = 'online';
              color = 'yellow';
            } else if (user.lastseen < 120000) {
              status = 'online';
              color = 'green';
            } else {
              status = 'offline';
              color = 'gray';
            }
            chatUsers.push({
              _id: user._id,
              image: user.image,
              name: user.name + ' ' + user.lastname,
              lastseen: user.lastseen,
              status: status,
              color: color
            });
            // console.log("chat users", chatUsers);
            this.chatUsers = chatUsers;
          });
        }

      }, err => {
        // console.log("err", err);
        Swal({
          type: 'error',
          title: 'Oops...',
          text: 'Maybe your session expired. Please Login again again.!',
        });
      });

    }
  }

  selectUserToChat(user) {
    this.hidePanelMessages = false;
    this.chatConneted = true;
    this.chatUserActive = user;
    var chatname = this.username + user._id, chatnameRev = user._id + this.username;
    var from = this.user._id, to = user._id;
    this.messages = [];
    this.fetchLastChat(chatname);
    this.fetchLastChat(chatnameRev);
    this.chatService.connect(chatname, this.onMessageReceived, from, to);
  }

  fetchUserAllChat() {
    this.chatUsers = [];
    var token = localStorage.token, id = localStorage.username;
    this.chatService.fetchUserAllChat(id, token).subscribe(result => {
      var userChats = JSON.parse(result._body);
      // console.log("All users chats for current user: ", userChats);
      let chatusers = [];

      // select last chat user
      if (userChats.length > 0) {
        if (userChats[0]) {
          //   let lastChat = userChats[0];
          //   if (lastChat.from == localStorage.username) {
          //     this.chatUserActive = {
          //       _id: lastChat.to,
          //       image: lastChat.toImage,
          //       name: lastChat.toName,
          //       lastseen: lastChat.lastupdate,
          //       status: 'online',
          //       color: 'green'
          //     };
          //   } else {
          //     this.chatUserActive = {
          //       _id: lastChat.from,
          //       image: lastChat.fromImage,
          //       name: lastChat.fromName,
          //       lastseen: lastChat.lastupdate,
          //       status: 'online',
          //       color: 'green'
          //     };
          //   }
          // show chat of this user with current user
          // let chatName = localStorage.username + this.chatUserActive._id, chatNameReverse = this.chatUserActive._id + localStorage.username;
          // this.chatService.connect(chatName, this.onMessageReceived, this.user._id, this.chatUserActive._id);

          // this.fetchLastChat(chatName);
          // this.fetchLastChat(chatNameReverse);
          this.checkUsersNewChats();
          this.checkUsersActivityStatus();

          // this.toggle();
          // this.hidePanelMessages = !this.hidePanelMessages;

          this.chatUsers = [];
          // show last users
          userChats.forEach(userschat => {
            if (userschat.from == localStorage.username) {
              let user = {
                _id: userschat.to,
                image: userschat.toImage,
                name: userschat.toName,
                lastseen: userschat.lastupdate,
                status: 'online',
                color: 'green'
              };
              chatusers.push(user);
            } else if (userschat.to == localStorage.username) {
              chatusers.push({
                _id: userschat.from,
                image: userschat.fromImage,
                name: userschat.fromName,
                lastseen: userschat.lastupdate,
                status: 'online',
                color: 'green'
              });
            } else { }
          });
          // filter current user from all users
          // console.log("chatusers", chatusers);
          chatusers = chatusers.filter(cuser => cuser._id != localStorage.username);
          let usersIds = chatusers.map(cuser => { return cuser._id });
          // console.log("usersIds", usersIds);
          let uniqueIds = usersIds.filter(function (value, index, array) {
            return array.indexOf(value) == index;
          });
          let fileteredUsers = [];
          uniqueIds.forEach(e => {
            let u = chatusers.find(cuser => cuser._id == e);
            fileteredUsers.push(u);
          });
          chatusers = fileteredUsers;
          // detect online status of all users
          chatusers.forEach(cuser => {
            this.chatService.getUserOnlineDetails(cuser._id, token).subscribe(result => {
              var user = cuser;
              // console.log("check last user is active: ", JSON.parse(result._body));
              var response = JSON.parse(result._body);
              if (response.lastseen) {
                var status = 'offline', color = 'gray';
                if (response.lastseen >= 300000) {
                  status = 'offline';
                  color = 'gray';
                } else if (response.lastseen < 300000 && response.lastseen >= 120000) {
                  status = 'online';
                  color = 'yellow';
                } else if (response.lastseen < 120000) {
                  status = 'online';
                  color = 'green';
                } else {
                  status = 'offline';
                  color = 'gray';
                }
                user.status = status;
                user.color = color;
                this.chatUsers.push(user);
                // console.log("Filterd users in chat with curent user: ", this.chatUsers);
              }
            }, err => {
              // console.log("check error last user is active: ", err);
            });
          });

        } // end last chat if
      } // end chats length if

    }, err => {
      // console.log("err", err);
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Maybe your session expired. Please Login again again.!',
      });
    });
  }

  fetchLastChat(chatname) {
    let token = localStorage.token;
    this.chatService.fetchSelectedUserChat(chatname, token).subscribe(result => {
      // console.log("chats for selected chatname: ", JSON.parse(result._body));
      var userChats = JSON.parse(result._body);
      // show chat messages screen and form
      var messages = [];
      if (Array.isArray(userChats)) {
        userChats.forEach(message => {
          var messageDetails = JSON.parse(message);
          if (messageDetails.time) {
            messages.push({
              sender: messageDetails.sender,
              content: messageDetails.content,
              status: messageDetails.status,
              type: messageDetails.type,
              time: Date.parse(messageDetails.time)
            });
          }
        });
      }
      // console.log(messages);
      this.messages = this.messages.concat(messages);
      this.messages.sort(function (a, b) { return a.time - b.time });
      if (this.chatConneted) {
        this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
        var self = this;
        setTimeout(function () {
          self.messagesArea.nativeElement.scrollTop = self.messagesArea.nativeElement.scrollHeight;
        }, 100)
      }
      // console.log("this.messagesArea.nativeElement.scrollHeight", this.messagesArea.nativeElement.scrollHeight);
    }, err => {
      // console.log("err", err);
      Swal({
        type: 'error',
        title: 'Oops...',
        text: 'Maybe your session expired. Please Login again again.!',
      });
    });

  }

  resetUserForChat() {
    this.hidePanelMessages = !this.hidePanelMessages;
    this.chatConneted = !this.chatConneted;
    this.chatService.unsubscribe();
  }

  startIndividualChatWithProvider() {
    var from = localStorage.username, to = '', token = localStorage.token;
    this.route.params.subscribe(params => {
      // console.log("provider", params.id);
      if (params.id && params.id != from) {
        this.chatService.getUserOnlineDetails(params.id, token).subscribe(result => {
          let response = JSON.parse(result._body);
          var user = {
            _id: params.id,
            image: '',
            name: '',
            lastseen: '',
            status: 'offline',
            color: 'gray'
          };
          // console.log("check last user is active: ", response);
          user.name = response.name;
          user.image = response.image;
          user.lastseen = response.lastseen;
          if (response.lastseen) {
            let status = 'offline', color = 'gray';
            if (response.lastseen >= 300000) {
              status = 'offline';
              color = 'gray';
            } else if (response.lastseen < 300000 && response.lastseen >= 120000) {
              status = 'online';
              color = 'yellow';
            } else if (response.lastseen < 120000) {
              status = 'online';
              color = 'green';
            } else {
              status = 'offline';
              color = 'gray';
            }
            user.status = status;
            user.color = color;
            this.chatUsers.push(user);
            // this.hidePanelMessages = false;
            this.disableChat = !this.disableChat;
            this.chatUserActive = user;
            // let chatName = localStorage.username + this.chatUserActive._id;
            // this.chatService.connect(chatName, this.onMessageReceived, this.user._id, this.chatUserActive._id);
          }

          let chatName = localStorage.username + this.chatUserActive._id, chatNameReverse = this.chatUserActive._id + localStorage.username;
          // this.chatService.connect(chatName, this.onMessageReceived, this.user._id, this.chatUserActive._id);

          // this.fetchLastChat(chatName);
          // this.fetchLastChat(chatNameReverse);
          this.checkUsersNewChats();
          this.checkUsersActivityStatus();

        }, err => {
          // console.log("check error last user is active: ", err);
        });
      } else {
        this.fetchUserAllChat();
      }

    });

  }

  checkUsersNewChats() {
    // fetch new chats in every 10 min
    let self = this;
    let checkUsersOnlineStatusInterval = setTimeout(_ => {
      self.messages = [];
      self.fetchUserAllChat();
    }, 600000);
  }

  checkUsersActivityStatus() {
    var self = this;
    let usersOnlineActivityInterval = setInterval(function () {
      let token = localStorage.token, id = localStorage.username, users = self.chatUsers;
      self.chatUsers = [];
      users.forEach(user => {
        self.chatService.getUserOnlineDetails(user._id, token).subscribe(result => {
          var response = JSON.parse(result._body);
          if (response.lastseen) {
            var status = 'offline', color = 'gray';
            if (response.lastseen >= 300000) {
              status = 'offline';
              color = 'gray';
            } else if (response.lastseen < 300000 && response.lastseen >= 120000) {
              status = 'online';
              color = 'yellow';
            } else if (response.lastseen < 120000) {
              status = 'online';
              color = 'green';
            } else {
              status = 'offline';
              color = 'gray';
            }
            user.status = status;
            user.color = color;
            self.chatUsers.push(user);
          }
        }, err => {
          // console.log("check error last user is active: ", err);
        });
      });
    }, 120000);
  }

}

