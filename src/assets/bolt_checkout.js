'use strict';
var boltDomainName = null;
var isBoltCached = false;
var ICPconfTemp = null;
var boltMob = !(/(tablet|ipad|playbook|PAD)|(android(?!.*(mobi|opera mini)))/i.test(navigator.userAgent)) && /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4));
var boltIsIE = function(){
    var ua = window.navigator.userAgent;
    var ie10orless = ua.indexOf('MSIE ');
    var ie11 = ua.indexOf('Trident/');
    var edge = ua.indexOf('Edge/');
    var xiaomi = ua.indexOf('XiaoMi/MiuiBrowser');
    var xiaomi1 = ua.indexOf('XiaoMi');
    if (ie10orless > -1 || ie11 > -1 || edge > -1 || xiaomi > -1 || xiaomi1 > -1) {
        return true
    } else {
        return false
    }
}
var boltPayId = null;
var boltiOS = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var boltiPad = (navigator.userAgent.indexOf("iPad") > -1) && !window.MSStream;
var boltMacOs = (navigator.appVersion.indexOf("Mac") != -1 && navigator.userAgent.search("Safari") >= 0) ? true : false;
var boltLTIE9 = !document.addEventListener && boltIsIE;
var boltOpera = boltMob && (navigator.userAgent.indexOf('OPR') != -1 || navigator.userAgent.indexOf('OPiOS') != -1) && navigator.userAgent.indexOf('Version') != -1;
var boltUCBrowser = !boltiOS ? (navigator.userAgent.indexOf('UCBrowser') != -1 && navigator.userAgent.substr(navigator.userAgent.length - 6) == "Mobile") : false;
var boltIphoneFirefox = boltMob && boltiOS && (navigator.userAgent.indexOf('FxiOS')!== -1);
var boltSupported = boltOpera || boltLTIE9 || boltUCBrowser || boltIphoneFirefox;
var boltIProp = "";
var boltPrefetcher = null;
var boltIphoneCss = document.createElement('style');
var bolt_color = document.getElementById('bolt').getAttribute("bolt-color");
var bolt_logo = document.getElementById('bolt').getAttribute("bolt-logo");
var bolt_purchase_from = document.getElementById('bolt').getAttribute("bolt-purchase-from");
var bolt_mid = document.getElementById('bolt').getAttribute("bolt-mid");
var bolt_switch = false;
bolt_color = bolt_color?bolt_color:"";
bolt_logo = bolt_logo?bolt_logo:"";
bolt_purchase_from = bolt_purchase_from && bolt_purchase_from =="INVOICE" ? "INVOICE" : bolt_purchase_from && bolt_purchase_from =="EVENTS" ? "EVENTS" : "THIRD_PARTY";
bolt_mid = bolt_mid && bolt_mid !="" ? bolt_mid: "";
var bolt_invoice = bolt_purchase_from == "INVOICE" ? true : false;
var bolt_event = bolt_purchase_from == "EVENTS" ? true : false;
var isBoltEnabledParam = "&merchantId="+bolt_mid+"&merchantKey=";
if(bolt_event) {
  isBoltEnabledParam = "purchaseFrom=events"+isBoltEnabledParam;
}else if(bolt_invoice){
  isBoltEnabledParam = "purchaseFrom=invoice"+isBoltEnabledParam;
}else{
  isBoltEnabledParam = null;
}
bolt_color.replace(/#/g, "");
if (boltMob)
    if (!boltiOS) boltIProp = "display:block;position:fixed;visibility:visible;width:100%;height:100%;height:100vh;left:0;top:0;z-index:10000;overflow:hidden;background: rgba(0, 0, 0, 0.0) none repeat scroll 0 0;";
    else boltIProp = "display:block;position:absolute;visibility:hidden;width:100%;height:100%;height:100vh;left:0;top:0;z-index:10000;overflow:hidden;background: rgba(0, 0, 0, 0.0) none repeat scroll 0 0;";
else
if (!boltiPad)
    if (!boltiOS) boltIProp = "display:block;position:fixed;visibility:visible;width:100%;height:100%;height:100vh;left:0;top:0;z-index:10000;overflow:hidden;background: rgba(0, 0, 0, 0.0) none repeat scroll 0 0;";
    else boltIProp = "display:block;position:fixed;visibility:hidden;width:100%;height:100%;height:100vh;left:0;top:0;z-index:10000;overflow:hidden;background: rgba(0, 0, 0, 0.0) none repeat scroll 0 0;";
else boltIProp = "display:block;position:absolute;visibility:hidden;width:100%;height:100%;height:100vh;left:0;right:0;bottom:0;top:0;z-index:10000;overflow:hidden;background: rgba(0, 0, 0, 0.0) none repeat scroll 0 0;";
var boltIframe = null;
window.onbeforeunload = function() {};
(function () {
    boltDomainName = document.getElementById('bolt').src;
    boltDomainName = (boltDomainName.indexOf("/static") > -1) ? boltDomainName.substring(0, boltDomainName.indexOf('/static')) : boltDomainName.substring(0, boltDomainName.indexOf('/bolt'));
    boltDomainName = boltDomainName.replace('-static', '');
    boltPrefetcher = function() {
      var prefetcherUrl = boltDomainName + "/icppayu/prefetcher";
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200) {
              var loadIframe = document.createElement("iframe");
              loadIframe.src = prefetcherUrl;
              loadIframe.id = 'loadIframe';
              loadIframe.setAttribute("style", "display:none;position:fixed;width:0%;height:0%;left:0;bottom:0;overflow:hidden;");
              loadIframe.setAttribute('allowtransparency', 'true');
              loadIframe.setAttribute('frameborder', '0');
              document.getElementsByTagName("body")[0].appendChild(loadIframe);
              document.getElementById("loadIframe").onload = function() {
                  var lodedIremove = document.getElementById("loadIframe");
                  try {
                      lodedIremove.parentNode.removeChild(lodedIremove);
                  } catch (e) {
                      lodedIremove.removeChild(lodedIremove);
                  }
              };
          }
      };
      xmlhttp.open("GET", prefetcherUrl, true);
      xmlhttp.send(null);
    };
    function isBoltEnabledApi(params) {
      var http = new XMLHttpRequest();
      var url = boltDomainName + "/payu/icpcheckout/isBoltEnabled";
      http.open("POST", url, true);
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      http.onreadystatechange = function() {
          console.log(JSON.stringify(http));
          bolt_switch = false;
          if(http.readyState == XMLHttpRequest.DONE && http.status == 200) {
            try {
              if(JSON.parse(http.responseText)){
                bolt_switch = true;
              }
            } catch (e) {}
            launchBoltV3(bolt_switch);
          }
          if(http.readyState == XMLHttpRequest.DONE && http.status != 200) {
            launchBoltV3(bolt_switch);
          }
      }
      http.send(params);
    }
    function launchBoltV3(isBoltLaunch) {
      if(isBoltLaunch){
        boltPrefetcher();
      }
      if(bolt_invoice){
        initiateBolt();
      }
    }
    if(!(bolt_invoice || bolt_event)) {
      boltPrefetcher();
    }else if(isBoltEnabledParam){
      isBoltEnabledApi(isBoltEnabledParam);
    }else{
      boltPrefetcher();
    }
})();
var bolt = (function() {
    var iframeRef;
    var loaderRef;
    var loaderImgRef;
    var configObj;
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    }
    function launch(request, handler) {
        if (!boltSupported) {
            var ICP_OBJ = ICPconfData();
            if (ICP_OBJ.ICPconf) {
                appendLoader();
                if (ICP_OBJ.isBoltCached && iframeRef && !bolt_invoice) {
                    if ((boltiOS && boltMob) || boltiPad) {
                        window.scrollTo(0, 0);
                        boltIphonCssApply();
                    }
                    loaderRef.style.display = 'block';
                    iframeRef.style.display = 'block';
                    iframeRef.contentWindow.postMessage({
                        evt: "cache"
                    }, '*');
                } else {
                    if (iframeRef != null) {
                        removeBolt();
                    }
                    var targetBolt = 'boltFrame';
                    ICP_OBJ.ICPconf.boltEnabled = "true";
                    if(bolt_invoice || bolt_event) {
                      targetBolt = bolt_switch? 'boltFrame' : "";
                      ICP_OBJ.ICPconf.boltEnabled = JSON.stringify(bolt_switch);
                    }
                    ICP_OBJ.ICPconf.purchaseFrom = bolt_purchase_from;
                    ICP_OBJ.ICPconf.service_provider = 'payu_paisa';
                    ICP_OBJ.ICPconf.color = bolt_color;
                    ICP_OBJ.ICPconf.logo = bolt_logo;
                    if(targetBolt){
                      createBoltFr();
                      iframeRef = document.getElementById('boltFrame');
                      document.getElementsByTagName("body")[0].appendChild(boltIframe);
                    }
                    var url = boltDomainName + "/payu/icpcheckout/";
                    var f = document.createElement("form");
                    f.setAttribute('method', "POST");
                    f.setAttribute('action', url);
                    f.setAttribute('id', 'boltForm');
                    f.setAttribute('target', targetBolt);
                    for (var key in ICP_OBJ.ICPconf) {
                        if (ICP_OBJ.ICPconf.hasOwnProperty(key)) {
                                var i = document.createElement("input");
                                i.setAttribute('type', "hidden");
                                i.setAttribute('name', key);
                                i.setAttribute('value', ICP_OBJ.ICPconf[key]?ICP_OBJ.ICPconf[key].toString():"");
                                f.appendChild(i);
                        }
                    };
                    document.body.appendChild(f)
                    try {
                        f.submit();
                    } catch (e) {
                        removeBolt();
                        removeBoltLoader();
                        catchExceptionHandler('Payment processing failed. Please try again later');
                    }
                    if (boltiOS || boltiPad) {
                        window.scrollTo(0, 0);
                        boltIphonCssApply();
                    }
                    removeBoltForm();
                }
            }else{
                catchExceptionHandler('Payment processing failed. Please try again later');
            }
        } else {
            catchExceptionHandler('Sorry ! This browser is not supported. Please choose another.');
        }
        function ICPconfData() {
            iframeRef = document.getElementById('boltFrame');
            if (isBoltCached && iframeRef && JSON.stringify(ICPconfTemp) === JSON.stringify(request)) {
                ICPconf  = getBoltObj(ICPconfTemp);
            }else{
                var ICPconf = validator();
                ICPconfTemp = ICPconf ? getBoltObj(ICPconf) : null;
                isBoltCached = false;
            }
            function getBoltObj(data) {
                return data;
            }
            return {
                ICPconf: ICPconf,
                isBoltCached: isBoltCached
            }
        }

        function appendLoader() {
            var myElem = document.getElementById('icpLoader');
            var loading = document.getElementById('imageLoaderImg');
            if (!myElem) {
                var body = document.body,
                    html = document.documentElement;
                var BodyHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                var imageLoader = document.createElement('div');
                imageLoader.id = "icpLoader";
                if (!boltMacOs) imageLoader.setAttribute("style", "height:" + BodyHeight + "px;display:block;position:absolute;width:100%;top:0;z-index:10000;overflow:hidden;background:rgba(0, 0, 0, 0.75);");
                else imageLoader.setAttribute("style", "height:" + BodyHeight + "px;display:block;position:absolute;width:100%;top:0;z-index:10000;overflow:hidden;background:rgba(0, 0, 0, 0.6);");
                var imageLoaderImg = document.createElement('div');
                imageLoaderImg.id = "imageLoaderImg";
                imageLoaderImg.setAttribute("style", "height:" + screen.height + "px;display:block;position:fixed;width:100%;left:0;z-index:10000;overflow:hidden;background:url(" + boltDomainName + "/static/kiwi/images/oval.svg) center 45% no-repeat;");
                imageLoader.appendChild(imageLoaderImg);
                if(bolt_invoice){
                  var invoiceLoaderRef = document.getElementById('invoiceLoader');
                  if(invoiceLoaderRef){
                      try {
                          invoiceLoaderRef.parentNode.removeChild(invoiceLoaderRef);
                          invoiceLoaderRef.removeChild(invoiceLoaderRef);
                      }catch (e) {}
                  }
                }
                document.body.appendChild(imageLoader);
            } else {
                loading.style.display = "block";
                myElem.style.display = "block";
            }
            loaderImgRef = loading;
            loaderRef = myElem;
        }

        function validator() {
            var isValidRequest = true;
            var keys = ['key', 'txnid', 'hash', 'amount', 'firstname', 'email', 'phone', 'productinfo', 'surl', 'furl'];
            var eKeys = ['eventId', 'ticketPurchaseList', 'customFormData'];
            var iKeys = ['merchantId','email','phone','invoiceId'];
            var validateKeys = !(bolt_invoice || bolt_event) ? keys : bolt_invoice ? iKeys : bolt_event ? eKeys : keys;
            var valid = {
                str: function(val) {
                    return typeof val === "string" && val != "";
                },
                onlyString: function(val) {
                    return {
                        flg: valid.str(val),
                        msg: 'should be string'
                    }
                },
                key: function(val) {
                    return valid.onlyString(val);
                },
                txnid: function(val) {
                    return valid.onlyString(val);
                },
                hash: function(val) {
                    return valid.onlyString(val);
                },
                amount: function(val) {
                    return {
                        flg: /(^\d+\.\d*$)|(^\d*\.\d+$)|(^\d+\.\d+$)|(^\d+$)/.test(val),
                        msg: 'should be numeric'
                    }
                },
                firstname: function(val) {
                    return valid.onlyString(val);
                },
                email: function(val) {
                    var e = /^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-zA-Z]{2,6}(?:\.[a-zA-Z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/;
                    return {
                        flg: true,
                        msg: 'is invalid'
                    }
                },
                phone: function(val) {
                    return {
                        flg: true,
                        msg: 'is invalid'
                    }
                },
                productinfo: function(val) {
                    return valid.onlyString(val);
                },
                surl: function(val) {
                    return valid.onlyString(val);
                },
                furl: function(val) {
                    return valid.onlyString(val);
                },
                merchantId: function (val) {
                  return valid.onlyString(val);
                },
                invoiceId: function (val) {
                  return valid.onlyString(val);
                },
                eventId : function (val) {
                  return {
                      flg: /^\d+$/.test(val),
                      msg: 'should be numeric'
                  }
                },
                ticketPurchaseList : function (val) {
                  return valid.onlyString(val);
                },
                customFormData : function (val) {
                  return valid.onlyString(val);
                }
            }
            for (var i = 0; i < validateKeys.length; i++) {
                if (validateKeys[i] in request) {
                    var isValid = valid[validateKeys[i]];
                    isValid = isValid(request[validateKeys[i]]);
                    if (!isValid.flg) {
                        catchExceptionHandler(validateKeys[i] + ": " + isValid.msg);
                        return isValidRequest = false;
                    }
                } else {
                    catchExceptionHandler(validateKeys[i] + ": mandatory param is missing");
                    return isValidRequest = false;
                }
            }
            return isValidRequest ? request : null;
        }
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        // Listen to message from child window
        eventer(messageEvent, function(e) {
            var key = e.message ? "message" : "data";
            var data = (e[key] && typeof(e[key])=='string') ? JSON.parse(e[key]) : e[key];
            var evt = data.evt;
            delete data.evt;
            var eventHandler = configObj && (configObj.eventHandler);
            iframeRef = document.getElementById('boltFrame');
            loaderRef = document.getElementById('icpLoader');
            loaderImgRef = document.getElementById('imageLoaderImg');
            delete ICPconfTemp.purchaseFrom;
            delete ICPconfTemp.service_provider;
            delete ICPconfTemp.boltEnabled;
            delete ICPconfTemp.color;
            delete ICPconfTemp.logo;
            switch (evt) {
                case 'bolt-close':
                    isBoltCached = false;
                    delete data.evt;
                    data.txnStatus = data.status ==="success" ? 'SUCCESS' : 'FAILED';
                    data.txnMessage = data.status ==="success" ? 'Transaction Successful' : data.error_Message;
                    boltPayId = null;
                    removeBolt();
                    removeBoltLoader();
                    if ((boltiOS && boltMob) || boltiPad) {
                      boltIphoneCssRemove();
                    }
                    paymentResponseHandler(data);
                    break;
                case 'bolt-cancel':
                    isBoltCached = true;
                    delete data.evt;
                    boltPayId = data.boltId;
                    data.txnStatus = "CANCEL";
                    data.txnMessage = data.boltMsg ;
                    delete data.boltMsg;
                    delete data.boltId;
                    loaderRef.style.display = 'none';
                    iframeRef.style.display = 'none';
                    if ((boltiOS && boltMob) || boltiPad) {
                      boltIphoneCssRemove();
                    }
                    paymentResponseHandler(data);
                    break;
                case 'bolt-launched':
                    if(loaderImgRef){loaderImgRef.style.display = "none";}
                    if(iframeRef){iframeRef.style.visibility = 'visible';}
                    if(iframeRef && iframeRef.contentWindow ){
                     try {
                         iframeRef.contentWindow.focus();
                     } catch (e) {}
                    }
                    break;
                case 'bolt-cached':
                    isBoltCached = true;
                    break;
                case 'bolt-ohFish':
                    removeBolt();
                    removeBoltLoader();
                    if ((boltiOS && boltMob) || boltiPad) {
                      boltIphoneCssRemove();
                    }
                    catchExceptionHandler(data.errMsg);
                    break;
                case 'bolt-previous-id':
                    try {
                        if(boltPayId){
                            iframeRef.contentWindow.postMessage({
                                evt: "new",
                                id : boltPayId
                            }, '*');
                        }
                    } catch (e) {}
                    break;
                default:
                    return;
            }
        }, false);
        function createBoltFr(){
            boltIframe = document.createElement("iframe");
            boltIframe.name = 'boltFrame';
            boltIframe.id = 'boltFrame';
            boltIframe.setAttribute("style", boltIProp);
            boltIframe.setAttribute('allowtransparency', 'true');
            boltIframe.setAttribute('frameborder', '0');
        }
        function boltIphonCssApply() {
          var head = document.head || document.getElementsByTagName('head')[0];
          boltIphoneCss.type = 'text/css';
          boltIphoneCss.id = 'boltIphone';
          if (boltIphoneCss.styleSheet){
            boltIphoneCss.styleSheet.cssText = "body {overflow: hidden !important;}";
          } else {
            boltIphoneCss.appendChild(document.createTextNode("body {overflow: hidden !important;}"));
          }
          head.appendChild(boltIphoneCss);
        }
        function paymentResponseHandler(data) {
            handler && handler.responseHandler && handler.responseHandler({
                response : data
            });
        }
        function catchExceptionHandler(msg) {
            handler && handler.catchException && handler.catchException({
                message: msg
            });
        }
        function removeBolt() {
            iframeRef = document.getElementById('boltFrame');
            removeBoltElm(iframeRef);
        }
        function removeBoltForm() {
            removeBoltElm(document.getElementById('boltForm'));
        }
        function removeBoltLoader() {
            loaderRef = document.getElementById('icpLoader');
            removeBoltElm(loaderRef);
        }

        function boltIphoneCssRemove(){
          var boltIphoneElm = document.getElementById('boltIphone');
          if(boltIphoneElm){
            boltIphoneElm.innerHTML="";
          }
          removeBoltElm(document.getElementById('boltIphone'));
        }
        function removeBoltElm(boltElm) {
          if(boltElm){
            try {
                boltElm.parentNode.removeChild(boltElm);
            }catch (e) {}
            try {
                boltElm.removeChild(boltElm);
            }catch (e) {}
          }
        }
    };
    return {
        launch: launch,
        aurthor: 'Jaysinh Gohil',
        version: "2.0-08.01.19"
    };
})();
module.exports = bolt;