[![Build Status](https://drone.io/github.com/xl8/oauth-zero-legged/status.png)](https://drone.io/github.com/xl8/oauth-zero-legged/latest)

#Overview
An [OAuth 1.0](http://oauth.net/core/1.0/) [node.js](http://nodejs.org) library suited for 0-legged OAuth.

It provides oauth signature functionality independently as well as an http client which uses it internally to sign requests.

#Installation
You can be fancy and clone the repo from here, or install [npm](http://github.com/isaacs/npm) and run:

	npm install oauth-zero-legged

The include you must specify:

	require('Signer') or require('Client')

#Usage
##Signer
```javascript
    var signer = Signer.createSigner("MyUsername", "MyPassword");
    var signatureBaseString = signer.calcSignatureBaseString("GET", "http://photos.example.net/photos?file=vacation.jpg&size=original");
    var signature = signer.calcOAuthSignature("POST", "http://photos.example.net/photos?file=vacation.jpg&size=original", { "another_param": "its value" });
    var authorizationHeader1 = signer.calcOAuthSignature("PUT", "http://photos.example.net/photos", {}, "1419259401");
    var authorizationHeader2 = signer.calcOAuthSignature("PUT", "http://photos.example.net/photos", {}, null, "JuXH8bgWisr");
```
##Client
```javascript
    var client = Client.Client();
    var options = {
        "method":     "GET",
        "url":        "http://photos.example.net/photos?file=vacation.jpg&size=original",
        "headers":    {
            "Content-Type": "application/json"
        }
    }
    // with oauth
    var my_success_callback = function(response) {
        var responseStatusCode  = response.statusCode;
        var responseHeaders     = response.headers;
        var responseHttpVersion = response.httpVersion;
        var responseBody        = response.body;
    }
    var my_failure_callback = function(response) {
        var responseCode    = response.code;
        var responseErrno   = response.errno;
        var responseSyscall = response.syscall;
    }
    client.request(options, my_success_callback, my_failure_callback, "MyUsername", "MyPassword");

    // without oauth
    client.request(options, my_success_callback, my_failure_callback);
```
#Tests
Require mocha.js and should.js.

Executed by running npm test.

## License

(The MIT License)

Copyright (c) 2014 Idan Mittelpunkt &lt;idanm [at] exelate [dot] com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
