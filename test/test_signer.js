var signerLib   = require('../lib/Signer.js'),
    should      = require('should');

var oauth_consumer_key      = "dpf43f3p2l4k3l03";
var oauth_consumer_secret   = "kd94hf93k423kf44&pfkkdhi9sl3r4s00";

var signer;

describe('Signer class', function() {
    it('should throw error when created without providing mandatory arguments', function() {
        (function() {
            signerLib.createSigner();
        }).should.throwError();
        (function(){
            signerLib.createSigner(oauth_consumer_key);
        }).should.throwError();
        (function(){
            signer = signerLib.createSigner(oauth_consumer_key, oauth_consumer_secret);
        }).should.not.throwError();
    });

    it('should return the consumer key in its relevant getter', function() {
        signer.getConsumerKey().should.equal(oauth_consumer_key);
    });

    it('should return the consumer secret in its relevant getter', function() {
        signer.getConsumerSecret().should.equal(oauth_consumer_secret);
    });

    it('should generate pseudo-unique nonce', function() {
        var testArray = [];
        for (var i=0 ; i<50 ; i++) {
            testArray.push(signer.generateNonce());
        }
        testArray.sort();
        for (var j=0 ; j<49 ; j++) {
            testArray[j].should.not.equal(testArray[j+1]);
        }
    });

    it('should generate nonce of the requested length', function() {
        signer.generateNonce(50).length.should.equal(50);
    });

    it('should throw error when requested to calculate signature base string without providing mandatory arguments', function() {
        (function() {
            signer.calcSignatureBaseString();
        }).should.throwError();
        (function() {
            signer.calcSignatureBaseString("GET");
        }).should.throwError();
    });

    it('should throw error when requested to sign with illegal http method', function() {
        (function() {
            signer.calcSignatureBaseString("GET", "http://photos.example.net/photos");
        }).should.not.throwError();
        (function() {
            signer.calcSignatureBaseString("POST", "http://photos.example.net/photos");
        }).should.not.throwError();
        (function() {
            signer.calcSignatureBaseString("PUT", "http://photos.example.net/photos");
        }).should.not.throwError();
        (function() {
            signer.calcSignatureBaseString("DELETE", "http://photos.example.net/photos");
        }).should.not.throwError();
        (function() {
            signer.calcSignatureBaseString("HEAD", "http://photos.example.net/photos");
        }).should.throwError();
        (function() {
            signer.calcSignatureBaseString("Something", "http://photos.example.net/photos");
        }).should.throwError();
    });

    it('should throw error when requested to sign with illegal url', function() {
        (function() {
            signer.calcSignatureBaseString("GET", "www.cnn.com");
        }).should.throwError();
    });

    it('should calculate signature base string precisely', function() {
        signer.calcSignatureBaseString("GET", "http://photos.example.net/photos?file=vacation.jpg&size=original", {}, "1191242096", "kllo9940pd9333jh")
            .should.equal("GET&http%3A%2F%2Fphotos.example.net%2Fphotos&file%3Dvacation.jpg%26oauth_consumer_key%3Ddpf43f3p2l4k3l03%26oauth_nonce%3Dkllo9940pd9333jh%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1191242096%26oauth_version%3D1.0%26size%3Doriginal");
        signerLib.createSigner("popeye@exelate.com","^^S,6r5:t;Z#&Tt").calcSignatureBaseString("GET", "http://myserver.com:8080/calculate/precisely_and_accurately?a=1&b=2&a=7&a=2&c=78&b=5", {}, "123456789", "abcdefghijklmnop")
            .should.equal("GET&http%3A%2F%2Fmyserver.com%3A8080%2Fcalculate%2Fprecisely_and_accurately&a%3D1%26a%3D2%26a%3D7%26b%3D2%26b%3D5%26c%3D78%26oauth_consumer_key%3Dpopeye%2540exelate.com%26oauth_nonce%3Dabcdefghijklmnop%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D123456789%26oauth_version%3D1.0");
        signerLib.createSigner("popeye@exelate.com","^^S,6r5:t;Z#&Tt").calcSignatureBaseString("GET", "http://myserver.com:8080/calculate/precisely_and_accurately?a=1&b=2&a=7&a=2&c=78&b=5", {take_me: "too"}, "123456789", "abcdefghijklmnop")
            .should.equal("GET&http%3A%2F%2Fmyserver.com%3A8080%2Fcalculate%2Fprecisely_and_accurately&a%3D1%26a%3D2%26a%3D7%26b%3D2%26b%3D5%26c%3D78%26oauth_consumer_key%3Dpopeye%2540exelate.com%26oauth_nonce%3Dabcdefghijklmnop%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D123456789%26oauth_version%3D1.0%26take_me%3Dtoo");
    });

    it('should calc OAuth signature precisely', function() {
        signerLib.createSigner("popeye@exelate.com","^^S,6r5:t;Z#&Tt").calcOAuthSignature("GET", "http://myserver.com:8080/calculate/precisely_and_accurately?a=1&b=2&a=7&a=2&c=78&b=5", {}, "123456789", "abcdefghijklmnop")
            .should.equal("GfTHeZSw04NXbjAMzS0poYeJ3tU=")
        signerLib.createSigner("kyle@exelate.com","plokijl,kmjn").calcOAuthSignature("POST", "http://trial.com/popeye/sailor/man", {}, "1419259401", "JuXH8bgWisr")
            .should.equal("A2Js3ZuA8lwsUISg9aq7OuSuAss=")
    });

    it('should calc Authorization header precisely', function() {
        signerLib.createSigner("kyle@exelate.com","plokijl,kmjn").calcAuthorizationHeader("POST", "http://trial.com/popeye/sailor/man", {}, "1419259401", "JuXH8bgWisr")
            .should.equal('OAuth realm="",oauth_version="1.0",oauth_consumer_key="kyle%40exelate.com",oauth_timestamp="1419259401",oauth_nonce="JuXH8bgWisr",oauth_signature_method="HMAC-SHA1",oauth_signature="A2Js3ZuA8lwsUISg9aq7OuSuAss%3D"');
    });
});
