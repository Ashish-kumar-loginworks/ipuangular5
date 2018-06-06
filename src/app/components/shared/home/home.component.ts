import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';
import * as shape from 'd3-shape';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: any;
  pay_views: any = 0;
  payments: any = 0;
  referral_views: any = 0;
  referrals: any = 0;
  data = [
    {
      name: "Users",
      series: [
        {
          "value": 8,
          "name": "02-2017"
        },
        {
          "value": 9,
          "name": "05-2017"
        }
      ]
    },
    {
      name: "User Views",
      series: [
        {
          "value": 7,
          "name": "02-2017"
        },
        {
          "value": 6,
          "name": "05-2017"
        }
      ]
    },
    {
      name: "Payment",
      series: [
        {
          "value": 10,
          "name": "02-2017"
        },
        {
          "value": 11,
          "name": "05-2017"
        }
      ]
    },
    {
      name: "Pay Views",
      series: [
        {
          "value": 9,
          "name": "02-2017"
        },
        {
          "value": 10,
          "name": "05-2017"
        }
      ]
    }
  ];
  curve = shape.curveLinear;
  gradient = false;
  schemeType = 'ordinal';
  colorScheme = {
    domain: ['#9fc800', '#1266b7', '#f39e10', '#00a65a', '#dc4b38', '#01bfef']
  };
  ratingsData = {
    type: "doughnut",
    labels: ["Very Good", "Good", "Satisfactory", "Paas", "Critical"],
    data: [0, 0, 0, 0, 0],
    legend: false,
    colors: [
      {
        backgroundColor: ['#008001', '#aafe34', '#ffff01', '#fea501', '#fe0000'],
      }
    ],
    options: {
      responsive: true,
      layout: {
        padding: {
          left: 10,
          right: 0,
          top: 0,
          bottom: 0
        }
      }
    }
  };
  isProvider: boolean = false;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("userInfo"));
    // console.log(this.user);
    if (this.user.providing)
      this.isProvider = true;
    this.getUserDashboardInfo();
  }

  public chartClicked(e: any): void {
    // console.log(e);
  }
  public chartHovered(e: any): void {
    // console.log(e);
  }

  getUserDashboardInfo() {
    var token = localStorage.getItem("token");
    var username = localStorage.getItem("username");
    this.authService.getDashboardInfo(username, token).subscribe(result => {
      var response = JSON.parse(result._body);
      this.pay_views = response.pay_views;
      this.payments = response.payments;
      this.referral_views = response.referral_views;
      this.referrals = response.referrals;
      // update chart data
      this.data = [
        {
          name: "Users",
          series: response.chart[0].series
        },
        {
          name: "User Views",
          series: response.chart[1].series
        },
        {
          name: "Payment",
          series: response.chart[2].series
        },
        {
          name: "Pay Views",
          series: response.chart[3].series
        }
      ];

      // update average rating chart data
      if (response.chart[4] != undefined) {
        this.isProvider = true;
        if (response.chart[4].series.length > 0) {
          var labels = [];
          var data = [];
          response.chart[4].series.forEach(el => {
            labels.push(el.name);
            data.push(el.value);
          });
          this.ratingsData.data = data;
          this.ratingsData.labels = labels;
        }
      }
      else {
        this.isProvider = false;
      }
      // console.log("User dashboard info: ", response);
    }, err => {
      console.log("err", err);
      // alert("Unable to retrieve your information from server.");
    });
  }
}
