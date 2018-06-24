"use strict";
const request = require('supertest'),
    app = require('../app'),
    expect = require('chai').expect;

const users = require('../express/data/json/users.json');
const inventories = require('../express/data/json/inventories.json');
const models = require('../express/models');
const Promise = require('bluebird');

describe("Inventories Controller", function() {

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

    it("should get users inventories", function(done) {

        let accessToken = 'known_token';

        request(app).get("/api/inventories")
            .set('x-access-token', accessToken)
            .end((err, response) => {
                if (err) return done(err);

                expect(response.statusCode).to.equal(200);

                const inventories = response.body;

                expect(inventories).to.be.an('array').that.have.lengthOf(3);

                const firstInventories = inventories[0];

                expect(firstInventories.name).to.be.equal('bread');
                expect(firstInventories.quantity).to.be.equal(30);
                expect(firstInventories.user_id).to.be.equal(2);

                done();
            });
    });

});