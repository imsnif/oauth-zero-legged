var url = require('url');
var crypto = require('crypto');

var exports = module.exports = {};

var merge_objects = function(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
};

function Signer() {}

exports.Signer = Signer;
/*
    create and return a Signer instance
*/
exports.createSigner = function(oauth_consumer_key, oauth_consumer_secret) {

    var signer = new Signer();

    if ( ( typeof(oauth_consumer_key) === "undefined" ) || (oauth_consumer_key === null) ) {
        throw "oauth_consumer argument is mandatory";
    } else {
        signer.oauth_consumer_key = oauth_consumer_key;
    }
    if ( ( typeof(oauth_consumer_secret) === "undefined" ) || (oauth_consumer_secret === null) ) {
        throw "oauth_consumer_secret argument is mandatory";
    } else {
        signer.oauth_consumer_secret = oauth_consumer_secret;
    }

    return signer;
};

Signer.prototype.getConsumerKey = function() {

    return this.oauth_consumer_key;

};

Signer.prototype.getConsumerSecret = function() {

    return this.oauth_consumer_secret;

};

Signer.prototype.generateNonce = function(length) {

    var nonce = "";
    var length_ = length;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    if ( ( typeof(length_) === "undefined") || (length_ === null) ) {
        length_ = 20;
    }
    for( var i=0; i < length_; i++ )
        nonce += possible.charAt(Math.floor(Math.random() * possible.length));

    return nonce;

};

Signer.prototype.generateTimestamp = function() {

    return Math.floor((new Date).getTime()/1000);

};


/*
 http_method [mandatory]:            GET, POST, PUT or DELETE (case insensitive)
 http_url [mandatory]:               the full url without query string or hash parts, e.g. http://10.2.2.58:8080/datalinx-backend/audiences/reach/volume
 additionalParams [ optional]:       object (key-value pairs) of additional parameters to normalize in the base string
 oauth_timestamp [optional]:         epoch in seconds, if not provided, takes the current timestamp
 oauth_nonce [optional]:             random string, if not provided a 20-char long nonce is generated randomly
*/
Signer.prototype.calcSignatureBaseString = function(http_method, http_url, additionalParams, oauth_timestamp, oauth_nonce) {
    // make sure all relevant arguments are provided
    if ( ( typeof(http_method) === "undefined" ) || (http_method === null) ) {
        throw "http_method argument is mandatory";
    }
    if ( ( typeof(http_url) === "undefined" ) || (http_url === null) ) {
        throw "http_url argument is mandatory";
    }

    if ( ( typeof(additionalParams) === "undefined" ) || (additionalParams === null) || (typeof(additionalParams) !== "obj" ) ) {
        additionalParams = {};
    }

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
    requestParams['oauth_consumer_key'] = this.getConsumerKey();
    requestParams['oauth_signature_method'] = 'HMAC-SHA1';
    requestParams['oauth_timestamp'] = oauth_timestamp ? oauth_timestamp : this.generateTimestamp();
    // generate nonce
    requestParams['oauth_nonce'] = oauth_nonce ? oauth_nonce : this.generateNonce();
    requestParams['oauth_version'] = '1.0';

    requestParams = merge_objects(requestParams, additionalParams);

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
    signatureBaseString = [
        encodeURIComponent(http_method),
        encodeURIComponent(constructRequestURL),
        encodeURIComponent(normalizedRequestParams)
    ].join("&").replace(/&\s*$/, "")

    return signatureBaseString;
};


/*
 http_method [mandatory]:            GET, POST, PUT or DELETE (case insensitive)
 http_url [mandatory]:               the full url without query string or hash parts, e.g. http://10.2.2.58:8080/datalinx-backend/audiences/reach/volume
 additionalParams [ optional]:       object (key-value pairs) of additional parameters to normalize in the base string
 oauth_timestamp [optional]:         epoch in seconds, if not provided, takes the current timestamp
 oauth_nonce [optional]:             random string, if not provided a 20-char long nonce is generated randomly
*/
Signer.prototype.calcAuthorizationHeader = function(http_method, http_url, additionalParams, oauth_timestamp, oauth_nonce) {
    // return the Authorization header

    oauth_timestamp = oauth_timestamp ? oauth_timestamp : this.generateTimestamp();
    oauth_nonce = oauth_nonce ? oauth_nonce : this.generateNonce();

    return  'OAuth ' +
    [
        'realm=""',
        'oauth_version="1.0"',
        'oauth_consumer_key="' + encodeURIComponent(this.getConsumerKey()) + '"',
        'oauth_timestamp="' + oauth_timestamp + '"',
        'oauth_nonce="' + encodeURIComponent(oauth_nonce) + '"',
        'oauth_signature_method="HMAC-SHA1"',
        'oauth_signature="' + encodeURIComponent(crypto.createHmac('sha1', encodeURIComponent(this.getConsumerSecret()) + '&').update(this.calcSignatureBaseString(http_method, http_url, additionalParams, oauth_timestamp, oauth_nonce)).digest('base64')) + '"'
    ].join(",");
};
