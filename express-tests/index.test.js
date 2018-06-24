"use strict";
var request = require('supertest'),
    app = require('../app'),
    expect = require('chai').expect;

describe("Index Page", function() {

    it("should show 'Real Time Auction'", function(done) {
        request(app).get('/api')
            .end(function(err, response) {
                expect(response.statusCode).to.equal(200);
                expect(/Real Time Auction/, done);
                done();
            });
    });

});
describe("None existing page", function() {

    it("should show 'Not Found'", function(done) {
        request(app).get('/api/notexisting')
            .end(function(err, response) {
                expect(response.statusCode).to.equal(404);
                expect(/Not Found/, done);
                done();
            });
    });

});