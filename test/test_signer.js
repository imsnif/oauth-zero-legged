var oauth   = require('../OAuthZeroLegged'),
    should  = require('should');

var user = {
  name: 'tj',
  pets: ['tobi', 'loki', 'jane', 'bandit']
};

describe('test something', function() {

  it('should do something', function() {
    user.should.have.property('name', 'tj');
  });


  it('should do something else', function() {
    user.should.have.property('pets').with.lengthOf(4);
  });

  it('should do one more thing', function() {
    (5).should.be.exactly(5).and.be.a.Number;
  });

  it('should test should', function() {
    ({}).should.be.an.Object;
    (1).should.be.a.Number;
    [].should.be.an.Array.and.an.Object;
    (true).should.be.a.Boolean;
    ''.should.be.a.String;
  });

});
