[![Build Status](https://drone.io/github.com/xl8/oauth-zero-legged/status.png)](https://drone.io/github.com/xl8/oauth-zero-legged/latest)

#Overview
An [OAuth 1.0](http://oauth.net/core/1.0/) [node.js](http://nodejs.org) library suited for 0-legged OAuth.

It provides oauth signature functionality independently as well as an http client which uses it internally to sign requests.

#Installation
You can be fancy and clone the repo from here, or install [npm](http://github.com/isaacs/npm) and run:
```shell
	npm install oauth-zero-legged
```
The include you must specify:

	require('Signer') or require('Client')

#Usage
##Signer
```javascript
    var signerLib = require('Signer');
    var signer = signerLib.createSigner("MyUsername", "MyPassword");
    var signatureBaseString = signer.calcSignatureBaseString("GET", "http://photos.example.net/photos?file=vacation.jpg&size=original");
    var signature = signer.calcOAuthSignature("POST", "http://photos.example.net/photos?file=vacation.jpg&size=original", { "another_param": "its value" });
    var authorizationHeader1 = signer.calcOAuthSignature("PUT", "http://photos.example.net/photos", {}, "1419259401");
    var authorizationHeader2 = signer.calcOAuthSignature("PUT", "http://photos.example.net/photos", {}, null, "JuXH8bgWisr");
```
##Client
```javascript
    var clientLib = require('Client');
    var client = clientLib.Client();
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

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

## Release History
_(Nothing yet)_

## Issues
Please use the [github issues list](https://github.com/xl8/oauth-zero-legged/issues) to report any issues. If possible, please include a link to an open github repo with the smallest failing example of your issue. Even better, fork the project, create a failing test case and issue a pull request with the issue number referenced in the pull request. Super better, fork the project create a failing test case, fix the problem, and issue a pull request with the test and fix referencing the issue number. 

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
