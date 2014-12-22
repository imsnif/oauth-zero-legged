var http = require('http');
var https = require('https');
var url = require('url');
var Signer = require('./Signer.js');

var exports = module.exports = {};

var parseQueryString = function( queryString ) {
    var params = {}, queries, temp, i, l;

    // Split into key/value pairs
    queries = queryString.split("&");

    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }

    return params;
};

function Client() {}

exports.Client = Client;

/*
    Send a request and retrieve its response.

    options                 [mandatory] : and object with method, url, headers properties where headers is an object per se. method and url are mandatory
    success_callback        [optional]  : a callback method that will be called with an object of {statusCode: ..., headers:..., httpVersion:..., body: ...}
    fail_callback           [optional]  : a callback method that will be called with an object of {code, errno, syscall}
    oauth_consumer_key      [optional]  : if not provided, no OAuth header will be added to the request
    oauth_consumer_secret   [optional]  : if not provided, no OAuth header will be added to the request
 */
Client.prototype.request = function(options, success_callback, fail_callback, oauth_consumer_key, oauth_consumer_secret) {

    var parsed_url = {};
    var additional_params = {};

    // input validity checks
    // =====================
    if ( ( typeof(options) === "undefined" ) || (options === null) ) {
        throw "options argument is mandatory";
    }
    if ( ( typeof(options.method) === "undefined" ) || (options === null) ) {
        throw "options.method argument is mandatory";
    } else {
        options.method = options.method.toUpperCase();
        if ( (options.method !== "GET") && (options.method !== "POST") && (options.method !== "PUT") && (options.method !== "DELETE") ) {
            throw "options.method must be GET, POST, PUT or DELETE";
        }
    }
    if ( ( typeof(options.url) === "undefined" ) || (options.url === null) ) {
        throw "options.url argument is mandatory";
    } else {
        parsed_url = url.parse(options.url, true);

        if ( parsed_url.protocol === null ) {
            throw "options.url is invalid or incomplete";
        }
    }
    if ( ( typeof(options.headers) === "undefined" ) || (options.headers === null) ) {
        options.headers = {};
    }

    if ( ( typeof(options.headers["Content-Type"]) !== "undefined" ) && ( options.headers["Content-Type"] === "application/x-www-form-urlencoded" ) ) {
        if ( options.body !== "undefined" ) {
            additional_params = parseQueryString(options.body);
        }
    }

    if ( typeof(options.headers["Authorization"]) === "undefined" ) {
        options.headers["Authorization"] = Signer.createSigner(oauth_consumer_key, oauth_consumer_secret).calcAuthorizationHeader(
            options.method,
            options.url,
            additional_params
        );
    }

    var http_options = {
        hostname:   parsed_url.hostname,
        port:       parsed_url.port,
        method:     options.method,
        path:       parsed_url.path,
        headers:    options.headers
    }

    var httpModule;

    if ( parsed_url.protocol === "http:" ) {
        httpModule = http;
    } else {
        httpModule = https;
    }

    var req = httpModule.request(http_options);
    req.on('response', function(response) {
        response.setEncoding('utf8');
        var responseBody = '';
        response.on('data', function(chunk) {
            responseBody += chunk;
        });
        response.on('end', function() {
            var retVal = {};
            retVal["statusCode"] = response.statusCode;
            retVal["headers"] = response.headers;
            retVal["httpVersion"] = response.httpVersion;
            retVal["body"] = responseBody;
            if (success_callback) {
                success_callback(retVal);
            }
        });
    });

    if ( typeof(options.body) !== "undefined" ) {
        req.write(options.body);
    }

    req.on('error', function(e) {
        if (fail_callback) {
            fail_callback(e);
        }
    });

    req.end();
}

