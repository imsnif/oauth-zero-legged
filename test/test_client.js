var
    clientLib   = require('../lib/Client.js'),
    should      = require('should'),
    http        = require('http'),
    nock        = require('nock');

var
    test_fake_http_url              = "http://www.google.com:8080",
    test_fake_username              = "kyle@exelate.com",
    test_fake_password              = "plokijl,kmjn",
    test_fake_response_body         = { "working" : true },
    test_fake_response_statusCode   = 200,
    test_authorization_header       = 'OAuth realm="",oauth_version="1.0",oauth_consumer_key="kyle%40exelate.com",oauth_timestamp="1419259401",oauth_nonce="JuXH8bgWisr",oauth_signature_method="HMAC-SHA1",oauth_signature="A2Js3ZuA8lwsUISg9aq7OuSuAss%3D"';


describe('Client class', function() {
    beforeEach(function(done) {
        nock(test_fake_http_url).get("/").reply(test_fake_response_statusCode, test_fake_response_body);
        nock(test_fake_http_url).post("/?f=8&e=9").reply(test_fake_response_statusCode, test_fake_response_body);
        done();
    });

    it('should throw errors if mandatory arguments are not provided', function() {
        var client = new clientLib.Client();

        (function() {
            var req = client.request(null, function() {}, function() {}, test_fake_username, test_fake_password);
        }).should.throwError();

        (function() {
            var req = client.request({}, function() {}, function() {}, test_fake_username, test_fake_password);
        }).should.throwError();

        (function() {
            var req = client.request({
                method:     "GETS",
                url:        test_fake_http_url,
                headers:    {}
            }, function(res) {
                res.statusCode.should.equal(test_fake_response_statusCode);
                res.body.should.equal(JSON.stringify(test_fake_response_body));
                done();
            }, null);
        }).should.throwError();

        (function() {
            var req = client.request({
                method:     "GET",
                headers:    {}
            }, function(res) {
                res.statusCode.should.equal(test_fake_response_statusCode);
                res.body.should.equal(JSON.stringify(test_fake_response_body));
                done();
            }, null);
        }).should.throwError();

        (function() {
            var req = client.request({
                method:     "GET",
                url:        "www.cnn.com",
                headers:    {}
            }, function(res) {
                res.statusCode.should.equal(test_fake_response_statusCode);
                res.body.should.equal(JSON.stringify(test_fake_response_body));
                done();
            }, null);
        }).should.throwError();
    });

    it('should not put authorization header if no key and secret are provided', function(done) {
        var client = new clientLib.Client();
        var req = client.request({
            method:     "GET",
            url:        test_fake_http_url,
            headers:    {}
        }, function(res) {
            res.statusCode.should.equal(test_fake_response_statusCode);
            res.body.should.equal(JSON.stringify(test_fake_response_body));
            done();
        }, null);

        var authorizationHeader = req.getHeader("Authorization");
        (typeof(authorizationHeader) === "undefined").should.be.true;
    });

    it('should put authorization header if key and secret are provided', function(done) {
        var client = new clientLib.Client();
        var req = client.request({
            method:     "GET",
            url:        test_fake_http_url,
            headers:    {}
        }, function(res) {
            res.statusCode.should.equal(test_fake_response_statusCode);
            res.body.should.equal(JSON.stringify(test_fake_response_body));
            done();
        }, null, test_fake_username, test_fake_password);

        var authorizationHeader = req.getHeader("Authorization");
        (typeof(authorizationHeader) === "string").should.be.true;
    });

    it('should add to signature base string body parameters', function(done) {
        var client = new clientLib.Client();
        var req = client.request({
            method:     "POST",
            url:        test_fake_http_url + "?f=8&e=9",
            headers:    {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body:       "a=1&d=2&c=3&b=4"
        }, function(res) {
            res.statusCode.should.equal(test_fake_response_statusCode);
            res.body.should.equal(JSON.stringify(test_fake_response_body));
            done();
        }, null, test_fake_username, test_fake_password);

        var authorizationHeader = req.getHeader("Authorization");
        (typeof(authorizationHeader) === "string").should.be.true;

        var usedTimestamp   = authorizationHeader.match(/oauth_timestamp\=\"(.*)\"\,oauth_nonce/)[1];
        var usedNonce       = authorizationHeader.match(/oauth_nonce\=\"(.*)\"\,oauth_signature_method/)[1];

        var signerLib   = require('../lib/Signer.js');
        var signer = signerLib.createSigner(test_fake_username, test_fake_password);
        signer.calcAuthorizationHeader("POST", test_fake_http_url + "?f=8&e=9", {a:1,d:2,c:3,b:4}, usedTimestamp, usedNonce).should.equal(authorizationHeader);
    });

    it('should not override existing request authorization header', function(done) {
        var client = new clientLib.Client();
        var req = client.request({
            method:     "POST",
            url:        test_fake_http_url + "?f=8&e=9",
            headers:    {
                "Content-Type":     "application/x-www-form-urlencoded",
                "Authorization":    test_authorization_header
            },
            body:       "a=1&d=2&c=3&b=4"
        }, function(res) {
            res.statusCode.should.equal(test_fake_response_statusCode);
            res.body.should.equal(JSON.stringify(test_fake_response_body));
            done();
        }, null, test_fake_username, test_fake_password);

        req.getHeader('Authorization').should.equal(test_authorization_header);
    });
});