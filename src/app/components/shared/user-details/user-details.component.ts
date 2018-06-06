import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from "ngx-stripe";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';
import * as paypal from "paypal-checkout";
import * as bolt from '../../../../assets/bolt.js';
// import * as bolt from '../../../../assets/bolt_checkout.js';   // production bolt_checkout
import * as crypto from 'crypto-js/sha512';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  user: any = undefined;
  loggedInuser: any = undefined;
  form: FormGroup;
  rating: number = 0;
  stripeTest: FormGroup;
  showPayForm: boolean = false;
  payUmoneyPaymentFormShown: boolean = false;
  referral: string = "";
  provider: string = "";
  payer: string = "";
  showImagePlaceholder: boolean = false;
  imageLarge: string = "";
  hideChatPanel: boolean = true;
  elements: Elements;
  card: StripeElement;
  @ViewChild('card') cardRef: ElementRef;

  // optional parameters
  elementsOptions: ElementsOptions = {
    locale: 'en'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private stripeService: StripeService) { }

  ngOnInit() {
    // this.activatedRoute.data.subscribe(params => {
    // console.log(this.activatedRoute);
    // })

    // console.log(this.activatedRoute.snapshot.params.id);
    this.getSelectedProviderDetails(this.activatedRoute.snapshot.params.id);

    // get logged in user details
    var loggedInUser = JSON.parse(localStorage.getItem("userInfo"));
    this.loggedInuser = loggedInUser;
    if (loggedInUser) {
      this.payer = loggedInUser._id;
    } else {
      this.payer = "";
    }
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.referral)
        this.referral = params.referral;
      else
        this.referral = "";

      if (params.provider)
        this.provider = params.provider;
      else if (this.activatedRoute.snapshot.params.id) {
        this.provider = this.activatedRoute.snapshot.params.id;
      }

    });
    // console.log("referral: ", this.referral);
    // console.log("provider: ", this.provider);
    // console.log("payer: ", this.payer);

    // payment form
    this.form = this.fb.group({
      amount: ["0.00", Validators.compose([Validators.required])],
      title: ["", Validators.compose([Validators.required, Validators.minLength(1), Validators.minLength(100)])],
      review: ["", Validators.compose([Validators.required, Validators.minLength(0), Validators.minLength(1000)])],
    });

    // stripe payment form
    this.stripeTest = this.fb.group({
      name: ['', [Validators.required]]
    });

    this.stripeService.elements()
      .subscribe(elements => {
        this.elements = elements;
        // Only mount the element the first time
        if (!this.card) {
          this.card = this.elements.create('card', {
            style: {
              base: {}
            },
            hidePostalCode: true
          });
          this.card.mount(this.cardRef.nativeElement);
        }
      });

    // hit pay view api
    this.payView(this.payer, this.provider, this.referral);
    // console.log("user",this.e);

    var component = this;
    // console.log(paypal);
    paypal.Button.render({
      env: 'sandbox', // 'sandbox' or 'production',
      client: {
        // niv
        // sandbox: 'AQa5TIP389GchuX1ebvySIvTU6iJAFwb1GiFovcQWOSsoVd6vjDSMF9v',
        // production: 'access_token$sandbox$mhs4yh9dpq2r5bbg$7fbb417aa6e781a58cab9c3ebbc2b39b'
        // ashish
        sandbox: 'AeuaaGzuICL7DH9YMhlRsOBHrNgHZi2YgbKplj9H4RjcFditYUxs_Hd74xGOEZBmgBJrmaFcTy8sQB4c',
        production: 'access_token$production$y5mxpvps7f8qtkpj$69a859f867bbc78b5297a7ea62c0fd55'
      },
      commit: true, // Show a 'Pay Now' button
      style: {
        color: 'gold',
        size: 'small'
      },
      payment: function (data, actions) {
        /* 
         * Set up the payment details like amount here 
         */
        return actions.payment.create({
          payment: {
            transactions: [
              {
                amount: { total: component.form.controls['amount'].value, currency: 'USD' }
              }
            ]
          }
        })
      },
      onAuthorize: function (data, actions) {
        // Make a call to the REST api to execute the payment
        return actions.payment.execute().then(function (payment) {
          window.alert('Payment Complete!');
          component.rating = 0;
          component.form.controls['amount'].setValue("0.00");
          component.form.controls['title'].setValue('');
          component.form.controls['review'].setValue('');
          component.callPaypalPaymentAPI(payment);
        });
      },
      onCancel: function (data, actions) {
        /* 
         * Buyer cancelled the payment 
         */
        console.log("Cancel: data", data);
        console.log("Cancel: actions", actions);
      },
      onError: function (err) {
        /* 
         * An error occurred during the transaction 
         */
        console.log("Error: ", err);
      }
    }, '#paypal-button');
  }

  getSelectedProviderDetails(id) {
    this.authService.getSelectedProviderDetails(id).subscribe(result => {
      if (result) {
        // console.log("Provider details: ", JSON.parse(result._body));
        this.user = JSON.parse(result._body);
      }
    }, err => {
      console.log("err", err);
      // console.log("Unable to find provider u are looking for.");
    });
  }

  onFormSubmit() {
    // open stripe pay popup
    this.showPayForm = true;
  };

  // call pay api after payment through stripe
  payment() {
    const name = this.stripeTest.get('name').value;
    this.stripeService
      .createToken(this.card, { name })
      .subscribe(token => {
        if (token.token) {
          // console.log(token.token);
          this.payer = this.payer == "" ? this.stripeTest.value.name : this.payer;
          var data = {
            amount: parseFloat(this.form.value.amount),
            rate: this.rating,
            title: this.form.value.title,
            review: this.form.value.review,
            provider: this.provider,
            referral: this.referral,
            payer: this.payer,
            // payer: this.stripeTest.value.name,
            stripe_token: token.token.id
          };
          // console.log("data", data);
          this.authService.payProvider(data).subscribe(result => {
            // console.log("payment result: ", result);
            if (result) {
              alert("Payment successfully completed.");
              this.showPayForm = !this.showPayForm;
              this.rating = 0;
              this.form.controls['amount'].setValue(0);
              this.form.controls['title'].setValue('');
              this.form.controls['review'].setValue('');
            }
          }, err => {
            alert("Sorry!!! Unable to process. Please try again.");
            this.showPayForm = !this.showPayForm;
            console.log("err", err);
          });
        }
        else {
          if (token.error)
            alert(token.error.message);
          // console.log(token.error);
        }
      });
  }

  payView(payer, provider, referral) {
    var data = {
      payer: payer,
      provider: provider,
      referral: referral
    };
    // console.log(data);
    this.authService.payView(data).subscribe(result => {
      if (result) {
        // console.log("Pay scren Viewed");
      }
    }, err => {
      console.log("err", err);
    });
  }

  callPaypalPaymentAPI(payment) {
    var transid = payment.id;
    var cart = payment.cart;
    var payer = payment.payer;
    var state = payment.state;
    var transactions = payment.transactions;
    console.log(payment);
  }

  payUmoneyPayment() {
    var key = 'cFdFk6uA';
    var salt = '7h1cY4rtQE';
    var txnid = 'ipu' + new Date().getTime();
    var productinfo = 'None';
    var firstname = this.user.firstname ? this.user.firstname : "Test";
    var email = this.user.email ? this.user.email : "sandbox.test@gmail.com";
    var phone = "6565656565";
    var amount = this.form.value.amount;
    // var hashsequence = 'key|txnid|amount|productinfo|firstname|email|||||||||||salt';
    var hashstring = key + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + salt;
    var hash = crypto(hashstring).toString();
    // console.log(hashstring);
    // console.log(hash);
    var component = this;
    bolt.launch({
      key: key,
      txnid: txnid,
      hash: hash,
      amount: amount,
      firstname: firstname,
      email: email,
      phone: phone,
      productinfo: productinfo,
      surl: location.href,
      furl: location.href
    },
      {
        responseHandler: function (response) {
          // your payment response Code goes here
          console.log("pay u succ:", response);
          component.callPayUmoneyPaymentAPI(response);
        },
        catchException: function (response) {
          // the code you use to handle the integration errors goes here
          console.log("pay u fail:", response);
          alert(response.message)
        }
      });
  }

  callPayUmoneyPaymentAPI(payment) {
    console.log(payment);
  }

  callPayTMPaymentAPI(payment) {
    console.log(payment);
  }

  startChatWithProvider(event) {
    this.hideChatPanel = !this.hideChatPanel;
    var loggedInUser = JSON.parse(localStorage.getItem("userInfo"));
    this.loggedInuser = loggedInUser;
  }
}
