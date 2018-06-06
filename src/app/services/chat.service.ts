import { Injectable } from "@angular/core";
import { ServerSocketService } from "./server-socket.service";
import { Subscription } from "rxjs/Subscription";
import { Http, Request, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/dom/webSocket';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ChatService {
  private wss: Subject<any>;
  public messages: Observable<any>;

  private sender: string;
  private reciever: string;
  private socketSubscription: Subscription;
  // private chaturl: string = 'wss://www.ipublishu.com/api/chat?chat_name=challAll';
  private chaturl: string = 'wss://www.ipublishu.com/api/chat?chat_name=';
  HOST: string = "https://ipublishu.com";
  SERVER_HOST: string = "https://ipublishu.com";

  private recieveSocketSubscription: Subscription;

  constructor(
    private socket: ServerSocketService,
    private http: Http,
    private httpClient: HttpClient
  ) {

  }

  public connect(sender: string, callback, from: string, to: string) {
    this.startConnect(sender, callback, from, to);
  }

  public startConnect(sender: string, onReceived, from: string, to: string) {
    this.sender = sender;
    this.socket.connect(this.chaturl + sender + "&from=" + from + "&to=" + to, this.chaturl + to + from + "&from=" + to + "&to=" + from);
    this.socketSubscription = this.socket.messages.subscribe((message: string) => {
      onReceived(JSON.parse(message));
    });
    this.recieveSocketSubscription = this.socket.messagesReverse.subscribe((message: string) => {
      onReceived(JSON.parse(message));
    });

    setInterval(() => {
      this.socketSubscription.unsubscribe();
      this.socketSubscription = this.socket.messages.subscribe((message: string) => {
        onReceived(JSON.parse(message));
      });
      this.recieveSocketSubscription.unsubscribe();
      this.recieveSocketSubscription = this.socket.messages.subscribe((message: string) => {
        onReceived(JSON.parse(message));
      });
    }, 59000);

  }

  public onSendMessage(input: string, from: string, to: string) {
    let messageContent = input.trim(), time = new Date();
    if (messageContent) {
      var chatMessage = {
        'sender': from,
        'reciever': to,
        'content': input,
        'status': 'CHAT',
        'type': 'CHAT_MESSAGE',
        time: time
      };
      this.socket.send(JSON.stringify(chatMessage));
    }
  }

  public unsubscribe() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
      this.recieveSocketSubscription.unsubscribe();
    }
  }

  private onError = (error) => {
    console.log('Could not connect to WebSocket server. Please refresh this page to try again!');
    console.log(error.message);
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
      // this.recieveSocketSubscription.unsubscribe();
    }
  }

  // integrate new apis
  // get user online status
  getUserOnlineDetails(id, token): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.SERVER_HOST + '/api/users/' + id + '/onlineDetails', options).map((response: Response) => {
      return response;
    })/* .catch(err => {
      return Observable.throw(err);
    }) */;
  }

  fetchUsersforChat(search, token): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.SERVER_HOST + '/api/providers?search=' + search + "&page=0&longlat=''", options).map((response: Response) => {
      return response;
    })/* .catch(err => {
      return Observable.throw(err);
    }) */;
  }

  // fetch all chat for current user
  fetchUserAllChat(id, token): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.SERVER_HOST + '/api/users/' + id + "/chats", options).map((response: Response) => {
      return response;
    })/* .catch(err => {
      return Observable.throw(err);
    }) */;
  }

  fetchSelectedUserChat(chatname, token): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.SERVER_HOST + '/api/chat/' + chatname, options).map((response: Response) => {
      return response;
    })/* .catch(err => {
      return Observable.throw(err);
    }) */;
  }



}
