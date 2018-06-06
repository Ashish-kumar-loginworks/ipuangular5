import { Injectable, EventEmitter } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http, Request, Response, Headers, RequestOptions, RequestMethod, HttpModule } from '@angular/http';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AuthenticationService implements CanActivate {
  HOST: string = "https://ipublishu.com";
  SERVER_HOST: string = "https://ipublishu.com";
  constructor(
    private http: Http,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) { }
  token: string;
  user: any;
  onProfileUpdate: EventEmitter<any> = new EventEmitter();
  categories: any = [
    {
      "category": "AC Services",
      "subCategory": [
        "AC Service and Repair",
        "Refrigerator Repair",
        "Washing Machine Repair",
        "RO or Water Purifier Repair",
        "Geyser / Water Heater Repair",
        "Microwave Repair",
        "Chimney and Hob Servicing",
        "TV Repair",
        "Mobile Repair",
        "Laptop Repair",
        "iPhone, iPad, Mac Repair"
      ]
    },
    {
      "category": "Beauty & Spa",
      "subCategory": [
        "Salon at Home",
        "Spa at Home for Women",
        "Party Makeup Artist",
        "Bridal Makeup Artist",
        "Pre Bridal Beauty Packages",
        "Mehendi Artists"
      ]
    },
    {
      "category": "Home Cleaning & Repairs",
      "subCategory": [
        "Carpenter",
        "Plumber",
        "Electrician",
        "Pest Control",
        "Home Deep Cleaning",
        "Bathroom Deep Cleaning",
        "Sofa Cleaning",
        "Kitchen Deep Cleaning",
        "Carpet Cleaning",
        "Geyser / Water Heater Repair",
        "Washing Machine Repair",
        "AC Service and Repair",
        "Microwave Repair",
        "Refrigerator Repair",
        "Laptop Repair",
        "Mobile Repair",
        "RO or Water Purifier Repair",
        "TV Repair",
        "Chimney and Hob Servicing",
        "iPhone, iPad, Mac Repair"
      ]
    },
    {
      "category": "Business Services",
      "subCategory": [
        "CA for Small Business",
        "Web Designer & Developer",
        "Packers & Movers",
        "CA/CS for Company Registration",
        "CCTV Cameras and Installation",
        "Graphics Designer",
        "Lawyer",
        "Outstation Taxi",
        "CA for Income Tax Filing",
        "Visa Agency",
        "Real Estate Lawyer",
        "Corporate Event Planner",
        "GST Registration & Migration Services",
        "Vastu Shastra Consultants"
      ]
    },
    {
      "category": "Personal & More",
      "subCategory": [
        "Astrologer",
        "Baby Portfolio Photographer",
        "Packers & Movers",
        "Monthly Tiffin Service",
        "Passport Agent",
        "Home Tutor",
        "Mathematics Tutor",
        "Commerce Home Tutor",
        "Outstation Taxi"
      ]
    },
    {
      "category": "Weddings & Events",
      "subCategory": [
        "Birthday Party Planner",
        "Bridal Makeup Artist",
        "Wedding Planner",
        "Wedding Photographer",
        "Party Makeup Artist",
        "Pre-Wedding Shoot",
        "Event Photographer",
        "Mehendi Artists",
        "Astrologer",
        "Wedding Choreographe",
        "Party Caterer",
        "DJ",
        "Wedding Caterers",
        "Corporate Event Planner",
        "Pre Bridal Beauty Packages"
      ]
    }
  ];


  // activate routes if user is logged in
  canActivate(route) {
    // check if token exists for logged in user
    if (localStorage.token) {
      var token = localStorage.getItem('token');
      var username = localStorage.getItem('username');
      // console.log("token", token);
      // check if token is valid
      return this.http.post(this.SERVER_HOST + '/api/authenticate/verify', { username: username, token: token }).map(response => {
        // if token is valid then change route else move to login screen 
        return true;
      });
    } else {
      console.log("without token");
      // console.log(route.queryParams);
      var params = route.queryParams;
      if (params.action == "ask_referral") {
        localStorage.setItem("linkParams", params);
        this.router.navigate(['/signup'], {
          queryParams: {
            referral: params.provider,
            provider: params.provider,
            action: params.action
          }
        });
        return false;
      } else {
        // show login screen if no token 
        this.router.navigate(['/login'], { queryParams: params });
        return false;
      }
    }
  }

  // login service
  login(user): Observable<any> {
    return this.http.post(this.SERVER_HOST + '/api/authenticate', { username: user.username, password: user.password })
      .map((response: Response) => {
        let token = response.json() && response.json().token;
        if (token) {
          this.token = token;
          this.user = user.username;
          localStorage.setItem('username', user.username);
          localStorage.setItem('token', token);
          return true;
        }
        else {
          return Observable.throw(response);
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }
  // login service ends here

  // signup service
  signup(user, otp): Observable<any> {
    let headers = new Headers();
    headers.append('otp', otp);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/register', {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
      referral: user.referral,
    }, options).map((response: Response) => {
      return true;
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }
  // signup user service ends here

  // signup provider service
  signupProvider(user, otp): Observable<any> {
    let headers = new Headers();
    headers.append('otp', otp);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/registerProvider', {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
      referral: user.referral,
      profession: user.profession,
      category: user.category,
      phone: user.phone,
      website: user.website,
      address: user.address
    }, options).map((response: Response) => {
      return true;
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }
  // signup user service ends here


  // Get logged in user data/information
  getDashboardInfo(user, token): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.SERVER_HOST + '/api/dashboard/' + user, options).map((response: Response) => {
      // console.log(response);
      return response;
    })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  getUserInfo(user, token): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    // console.log(options);
    return this.http.get(this.SERVER_HOST + '/api/users/' + user, options).map((response: Response) => {
      // console.log(response);
      return response;
    })
      // .catch(err => {
      //   // console.log(err);
      //   return Observable.throw(err);
      // });
  }

  // send invitaition
  inviteUser(form, token): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    var destination = form.destinationType == "EMAIL" ? form.email : form.phone;
    return this.http.post(this.SERVER_HOST + '/api/invite', {
      reference: form.reference,
      destinationType: form.destinationType,
      destination: destination
    }, options).map((response: Response) => {
      return true;
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }

  // send referral request
  referUser(form, token): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    var destination = form.destinationType == "EMAIL" ? form.email : form.phone;
    return this.http.post(this.SERVER_HOST + '/api/invite', {
      reference: form.reference,
      destinationType: form.destinationType,
      destination: destination
    }, options).map((response: Response) => {
      return true;
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }

  searchProviders(search, token, page, longlat): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.SERVER_HOST + '/api/providers?search=' + search + "&page=" + page + "&longlat=" + longlat, options).map((response: Response) => {
      return response;
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }

  publishsearchProviders(search, profession, category, longlat, token, page): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.SERVER_HOST + '/api/providers?search=' + search + "&page=" + page + "&profession=" + profession + "&category=" + category + "&longlat=" + longlat, options).map((response: Response) => {
      return response;
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }

  getSelectedProviderDetails(id): Observable<any> {
    return this.http.get(this.SERVER_HOST + '/api/providers/' + id).map((response: Response) => {
      return response;
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }

  updateUserDetails(id: string, token: string, firstname: string, lastname: string, email: string, phone: string, address: string, otp: string): Observable<boolean> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('otp', otp);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id, {
      name: firstname,
      lastname: lastname,
      address: address,
      phone: phone,
      email: email
    }, options).map((response: Response) => {
      console.log(response.status);
      if (response.status == 200) {
        return true;
      } else {
        return false;
      }
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }

  saveProviderDetails(id: string, token: string, profession: string, category: string, website: string, address: string, about: string, otp: string): Observable<boolean> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('otp', otp);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/providers/' + id, { profession: profession, category: category, website: website, address: address, about: about }, options).map((response: Response) => {
      console.log(response.status);
      if (response.status == 200) {
        return true;
      } else {
        return false;
      }
    })
    // .catch(err => {
    //   return Observable.throw(err);
    // });
  }

  saveUserImage(id: String, token: string, url: String): Observable<boolean> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id + '/images', { url: url }, options)
      .map((response: Response) => {
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  saveGalleryImages(id: String, token: string, urls: any[]): Observable<boolean> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id + '/gallery', { urls: urls }, options)
      .map((response: Response) => {
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  // logout
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  saveSettings(id: String, token: string, body: any): Observable<boolean> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id + '/messages', body, options)
      .map((response: Response) => {
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  notificationsClick(id: String, token: string, body: any): Observable<boolean> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id + '/notification_click', body, options)
      .map((response: Response) => {
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  publishClick(id: String, token: string, body: any): Observable<boolean> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id + '/publish_click', body, options)
      .map((response: Response) => {
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  payProvider(body: any): Observable<boolean> {
    let headers = new Headers();
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/pay', body, options)
      .map((response: Response) => {
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  payView(body: any): Observable<boolean> {
    let headers = new Headers();
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/payview', body, options)
      .map((response: Response) => {
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  userview(referral): Observable<any> {
    return this.http.post(this.SERVER_HOST + '/api/userview', { referral: referral })
      .map((response: Response) => {
        let token = response.json() && response.json().token;
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  // provider login api
  providerLogin(userid, token, referral): Observable<any> {
    let headers = new Headers();
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + userid + '/provider_login', { referral: referral }, options)
      .map((response: Response) => {
        let token = response.json() && response.json().token;
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  getIP(): Observable<any> {
    return this.http.get("https://freegeoip.net/json/").map((response: any) => {
      var json = response.json();
      // console.log(json);
      return json.ip;
    });
  }

  getClientCountryIsdCode(ip): Observable<any> {
    return this.http.get("https://ipapi.co/" + ip + "/json/").map((res: any) => {
      return res.json();
    });
  }

  generateChecksum(paytm_mer_key, paytm_mid, ORDER_ID, CUST_ID, INDUSTRY_TYPE_ID, CHANNEL_ID, WEBSITE, TXN_AMOUNT, CALLBACK_URL): Observable<any> {
    // let headers = new Headers();
    // headers.append('token', token);
    // headers.append('accept', "application/json");
    // let options = new RequestOptions({
    //   headers: headers
    // });

    return this.http.post("http://aoldev.apponlease.com/api/1e/checksumgen.php", {
      paytm_mer_key: paytm_mer_key,
      paytm_mid: paytm_mid,
      ORDER_ID: ORDER_ID,
      CUST_ID: CUST_ID,
      INDUSTRY_TYPE_ID: INDUSTRY_TYPE_ID,
      CHANNEL_ID: CHANNEL_ID,
      TXN_AMOUNT: TXN_AMOUNT,
      CALLBACK_URL: CALLBACK_URL
    }).map((response: any) => {
      return response;
    })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  getAllCategories() {
    return this.categories;
  }

  // google signin through new API
  signInGoogleApi(email, token): Observable<any> {
    return this.http.post(this.SERVER_HOST + "/api/authenticate/google", {
      email: email,
      token: token
    }).map((response: Response) => {
      // console.log('ipu google response', response);
      if (response.json()) {
        localStorage.setItem('username', response.json().user);
        localStorage.setItem('token', response.json().token);
      }
      return response;
    })
    // .catch(err => {
    //   // console.log('ipu google error', err);
    //   return Observable.throw(err);
    // });
  }

  sendOtp(phone, calltype, user): Observable<any> {
    return this.http.post(this.SERVER_HOST + '/api/authenticate/sendOTP', {
      phone: phone,
      calltype: calltype,
      user: user
    })
      .map((response: Response) => {
        let token = response.json() && response.json().token;
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  verifyOtp(calltype, otp, user): Observable<any> {
    let headers = new Headers();
    headers.append('otp', otp);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/authenticate/verifyOTP', { calltype: calltype, user: user }, options)
      .map((response: Response) => {
        let token = response.json() && response.json().token;
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  resetPassword(id, password, token, otp): Observable<any> {
    let headers = new Headers();
    headers.append('otp', otp);
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id + '/resetpassword', { password: password }, options)
      .map((response: Response) => {
        let token = response.json() && response.json().token;
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  forgotPassword(id, password, otp): Observable<any> {
    let headers = new Headers();
    headers.append('otp', otp);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id + '/resetpassword', { password: password }, options)
      .map((response: Response) => {
        let token = response.json() && response.json().token;
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }

  withdrawAccount(id, accountType, data, token, otp): Observable<any> {
    let headers = new Headers();
    headers.append('otp', otp);
    headers.append('token', token);
    headers.append('accept', "application/json");
    let options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.SERVER_HOST + '/api/users/' + id + '/withdraw_account/' + accountType, data, options)
      .map((response: Response) => {
        let token = response.json() && response.json().token;
        if (response.status == 200) {
          return true;
        } else {
          return false;
        }
      })
      // .catch(err => {
      //   return Observable.throw(err);
      // });
  }
}

