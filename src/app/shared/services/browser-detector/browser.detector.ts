export class BrowserDetector {

  static getBrowserName(): string {

    // Opera 8.0+
    const isOpera = (!!window['opr'] && !!window['opr'].addons) || !!window['opera'] || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    const isFirefox = typeof window['InstallTrigger'] !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]"
    const isSafari = /constructor/i.test(window['HTMLElement']) || (function (p) {
      return p.toString() === '[object SafariRemoteNotification]';
    })(!window['safari'] || window['safari'].pushNotification);

    // Internet Explorer 6-11
    const isIE = /*@cc_on!@*/!!document['documentMode'];

    // Edge 20+
    const isEdge = !isIE && !!window['StyleMedia'];

    // Chrome 1+
    const isChrome = !!window['chrome'] && !!window['chrome'].webstore;

    // Blink engine detection
    const isBlink = (isChrome || isOpera) && !!window['CSS'];

    return isOpera ? 'Opera' :
      isFirefox ? 'Firefox' :
        isSafari ? 'Safari' :
          isChrome ? 'Chrome' :
            isIE ? 'IE' :
              isEdge ? 'Edge' :
                isBlink ? 'Blink' :
                  'Unknown';
  };

}
