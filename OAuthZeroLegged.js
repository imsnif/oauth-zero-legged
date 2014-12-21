var url = require('url');
var crypto = require('crypto');

var exports = module.exports = {};

/*
 http_method [mandatory]:            GET, POST, PUT or DELETE (case insensitive)
 http_url [mandatory]:               the full url without query string or hash parts, e.g. http://10.2.2.58:8080/datalinx-backend/audiences/reach/volume
 oauth_consumer_key [mandatory]:     username, e.g. walter@exelate.com
 oauth_consumer_secret [mandatory]:  password
 oauth_timestamp [optional]:         epoch in seconds, if not provided, takes the current timestamp
 oauth_nonce [optional]:             random string, if not provided a 20-char long nonce is generated randomly
 */
exports.getAuthorizationHeader = function(http_method, http_url, oauth_consumer_key, oauth_consumer_secret, oauth_timestamp, oauth_nonce) {

    // make sure all relevant arguments are provided
    if ( ( typeof(http_method) === "undefined" ) || (http_method === null) ) {
        throw "http_method argument is mandatory";
    }
    if ( ( typeof(http_url) === "undefined" ) || (http_url === null) ) {
        throw "http_url argument is mandatory";
    }
    if ( ( typeof(oauth_consumer_key) === "undefined" ) || (oauth_consumer_key === null) ) {
        throw "oauth_consumer argument is mandatory";
    }
    if ( ( typeof(oauth_consumer_secret) === "undefined" ) || (oauth_consumer_secret === null) ) {
        throw "oauth_consumer_secret argument is mandatory";
    }

    // check validity of http_method
    http_method = http_method.toUpperCase();

    if ( (http_method !== "GET") && (http_method !== "POST") && (http_method !== "PUT") && (http_method !== "DELETE") ) {
        throw "http_method must be GET, POST, PUT or DELETE";
    }

    // check validity of http_url
    parsed_url = url.parse(http_url, true);

    if ( parsed_url.protocol === null ) {
        throw "http_url is invalid or incomplete";
    }

    // Normalize Request Parameters (OAuth Core 1.0 Paragraph 9.1.1)
    requestParams = parsed_url.query;

    // add mandatory request parameters that are part of OAuth
    requestParams['oauth_consumer_key'] = oauth_consumer_key;
    requestParams['oauth_signature_method'] = 'HMAC-SHA1';
    requestParams['oauth_timestamp'] = oauth_timestamp ? oauth_timestamp : Math.floor((new Date).getTime()/1000);
    // generate nonce
    if (oauth_nonce) {
        requestParams['oauth_nonce'] = oauth_nonce;
    } else {
        requestParams['oauth_nonce'] = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 20; i++ )
            requestParams['oauth_nonce'] += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    requestParams['oauth_version'] = '1.0';

    normalizedRequestParams = "";
    Object.keys(requestParams).sort().forEach(function(key) {
        if (parsed_url.query[key] instanceof Array) {
            parsed_url.query[key].sort().forEach(function(val) {
                normalizedRequestParams += key + "=" + encodeURIComponent(val) + "&";
            });
        } else {
            normalizedRequestParams += key + "=" + encodeURIComponent(parsed_url.query[key]) + "&";
        }
    });
    normalizedRequestParams = normalizedRequestParams.replace(/&\s*$/, "");

    // Construct Request URL (OAuth Core 1.0 Paragraph 9.1.2)
    constructRequestURL = parsed_url.protocol + "//" + (parsed_url.auth ? parsed_url.auth + "@" : "") + parsed_url.host + parsed_url.pathname;

    // Concatenate Request Elements (OAuth Core 1.0 Paragraph 9.1.3)
    signatureBaseString = encodeURIComponent(http_method) + "&" + encodeURIComponent(constructRequestURL) + "&" + encodeURIComponent(normalizedRequestParams);

    // Signature Base String (OAuth Core 1.0 Paragraph 9.1)
    signatureBaseString = signatureBaseString.replace(/&\s*$/, "");

    // return the Authorization header
    return  'OAuth ' +
        'realm="",' +
        'oauth_version="1.0",' +
        'oauth_consumer_key="' + encodeURIComponent(requestParams['oauth_consumer_key']) + '",' +
        'oauth_timestamp="' + requestParams['oauth_timestamp'] + '",' +
        'oauth_nonce="' + encodeURIComponent(requestParams['oauth_nonce']) + '",' +
        'oauth_signature_method="HMAC-SHA1",' +
        'oauth_signature="' + encodeURIComponent(crypto.createHmac('sha1', encodeURIComponent(oauth_consumer_secret) + '&').update(signatureBaseString).digest('base64')) + '"';
}
