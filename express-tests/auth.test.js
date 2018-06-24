"use strict";
const request = require('supertest'),
    app = require('../app'),
    expect = require('chai').expect;

const users = require('../express/data/json/users.json');
const inventories = require('../express/data/json/inventories.json');
const models = require('../express/models');
const Promise = require('bluebird');

describe("Auth Middleware", function() {

    before(function(done) {

        Promise.all([
            models.User.destroy({ where: {}, truncate: true }),
            models.Inventory.destroy({ where: {}, truncate: true }),
        ]).then(() => {
            Promise.all([
                models.User.bulkCreate(users, {}),
                models.Inventory.bulkCreate(inventories, {})
            ]).then(() => {
                done();
            });

        });

    });

    after(function(done) {

        Promise.all([
            models.User.destroy({ where: {}, truncate: true }),
            models.Inventory.destroy({ where: {}, truncate: true }),
        ]).then(() => {
            done();
        });

    });

    it("should block request for protected route with no token", function(done) {

        request(app).get("/api/inventories")
            .end((err, response) => {
                if (err) return done(err);

                expect(response.statusCode).to.equal(403);

                expect(response.body.status).to.be.false;
                expect(response.body.message).to.be.equal('No token provided.');

                done();
            });
    });

    it("should block request for protected route with invalid token", function(done) {

        request(app).get("/api/inventories")
            .set('x-access-token', 'invalid_token')
            .end((err, response) => {
                if (err) return done(err);

                expect(response.statusCode).to.equal(401);

                expect(response.body.status).to.be.false;
                expect(response.body.message).to.be.equal('Failed to authenticate token.');

                done();
            });
    });

});