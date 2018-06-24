"use strict";
const request = require('supertest'),
    app = require('../app'),
    expect = require('chai').expect;

const users = require('../express/data/json/users.json');
const inventories = require('../express/data/json/inventories.json');
const models = require('../express/models');
const Promise = require('bluebird');

describe("Users Controller", function() {

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

    it("should update the token when existing user is been authenticated", function(done) {
        request(app).post('/api/users/authenticate')
            .send({ username: 'john' })
            .end((err, response) => {
                if (err) return done(err);

                expect(response.statusCode).to.equal(200);
                expect(response.body.user_id).to.equal(1);
                expect(response.body.token).to.have.lengthOf(24);

                done();
            });
    });

    it("should create new user and inventories when new user is been authenticated", function(done) {
        request(app).post('/api/users/authenticate')
            .send({ username: 'alex' })
            .end((err, response) => {
                if (err) return done(err);

                expect(response.statusCode).to.equal(201);
                expect(response.body.user_id).to.be.above(2);
                expect(response.body.token).to.have.lengthOf(24);

                models.Inventory.findAll({
                    where: { user_id: response.body.user_id }
                }).then(inventories => {

                    expect(inventories).to.have.lengthOf(3);

                    const firstInventories = inventories[0];

                    expect(firstInventories.name).to.be.equal('bread');
                    expect(firstInventories.quantity).to.be.equal(30);

                    expect(inventories[1].name).to.be.equal('carrots');
                    expect(inventories[1].quantity).to.be.equal(18);

                    expect(inventories[2].name).to.be.equal('diamond');
                    expect(inventories[2].quantity).to.be.equal(1);

                    done();

                });
            });
    });


    it("should validate a correct token", function(done) {
        request(app).post('/api/users/authenticate')
            .send({ username: 'john' })
            .end((err, response) => {
                if (err) return done(err);

                request(app).post('/api/users/check')
                    .send({ token: response.body.token })
                    .end((err, response) => {
                        if (err) return done(err);

                        expect(response.statusCode).to.equal(200);
                        expect(response.body.status).to.be.true;

                        done();
                    });

            });
    });


    it("should invalidate an bad token", function(done) {
        request(app).post('/api/users/check')
            .send({ token: 'invalidtoken' })
            .end((err, response) => {
                if (err) return done(err);

                expect(response.statusCode).to.equal(200);
                expect(response.body.status).to.be.false;

                done();
            });
    });

    it("should clear tokens", function(done) {
        request(app).post('/api/users/authenticate')
            .send({ username: 'john' })
            .end((err, response) => {
                if (err) return done(err);

                request(app).delete(`/api/users/token/${response.body.token}`)
                    .end((err, response) => {
                        if (err) return done(err);

                        expect(response.statusCode).to.equal(200);
                        expect(response.body.status).to.be.true;

                        done();
                    });

            });
    });

});
