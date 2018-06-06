import { Injectable } from "@angular/core";
import { QueueingSubject } from "queueing-subject";
import { Observable } from "rxjs/Observable";
import websocketConnect from "rxjs-websockets";

@Injectable()
export class ServerSocketService {
  private inputStream = new QueueingSubject<string>();
  public messages: Observable<string>;
  private inputStreamReverse = new QueueingSubject<string>();
  public messagesReverse: Observable<string>;

  // public inInterval;
  // public outInterval;

  public connect(url: string, urlReverse: string) {
    // if (this.messages)
    //   return;
    // this.inputStream = new QueueingSubject<string>()
    // this.messages = websocketConnect(url, this.inputStream = new QueueingSubject<string>()).messages.share();

    // this.inputStreamReverse = new QueueingSubject<string>()
    // this.messagesReverse = websocketConnect(urlReverse, this.inputStreamReverse = new QueueingSubject<string>()).messages.share();

    this.messages = websocketConnect(url, this.inputStream).messages;
    this.messagesReverse = websocketConnect(urlReverse, this.inputStreamReverse).messages;

  }

  public send(message: string): void {
    this.inputStream.next(message);
  }
}
