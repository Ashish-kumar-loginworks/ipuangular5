import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Input() user: any;
  @Input() isOpened: boolean;
  @Output() toggleNav = new EventEmitter();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
  }
  hideOnMobile() {
    console.log('nav changed');
    if (window.innerWidth < 600) {
      this.isOpened = !this.isOpened;
      this.toggleNav.emit(this.isOpened);
    }
  }

}
