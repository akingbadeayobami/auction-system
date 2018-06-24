"use strict";
const request = require('supertest'),
    app = require('../app'),
    expect = require('chai').expect;

const users = require('../express/data/json/users.json');
const inventories = require('../express/data/json/inventories.json');
const models = require('../express/models');
const Promise = require('bluebird');
const auctionStates = require('../express/enums').AuctionStates;
const moment = require('moment');

describe("Auction Controller", function() {

    let basicAuction;

    // A skeletal auction to be modified based on scenatios
    let basicAuctionSkeleton = {
        id: 1,
        user_id: 1,
        inventory_id: 1,
        quantity: 1,
        minimum_bid: 100,
        state: auctionStates.QUEUED.value,
    };

    // A known token for user with id of 2
    let accessToken = 'known_token';

    beforeEach(function(done) {

        // Want to clone the object before each test to acheive idempotency in my tests
        basicAuction = JSON.parse(JSON.stringify(basicAuctionSkeleton));

        Promise.all([
            models.User.destroy({ where: {}, truncate: true }),
            models.Inventory.destroy({ where: {}, truncate: true }),
        ]).then(() => {

            Promise.all([
                models.User.bulkCreate(users, {}),
                models.Inventory.bulkCreate(inventories, {})
            ]);
            done();
        });

    });

    afterEach(function(done) {
        Promise.all([
            models.User.destroy({ where: {}, truncate: true }),
            models.Inventory.destroy({ where: {}, truncate: true }),
            models.Auction.destroy({ where: {}, truncate: true }),
        ]).then(() => {
            done();
        });

    });

    it("should get no auction when there is no current auction", function(done) {

        request(app).get('/api/auctions')
            .set('x-access-token', accessToken)
            .end((err, response) => {
                if (err) return done(err);

                expect(response.statusCode).to.equal(200);

                expect(response.body.noAuction).to.be.true;

                done();
            });

    });


    it("should get no auction when last auction has ended", function(done) {

        // Simulating an ended auction
        basicAuction.state = auctionStates.ENDED.value;

        models.Auction.create(basicAuction).then(() => {

            request(app).get('/api/auctions')
                .set('x-access-token', accessToken)
                .end((err, response) => {
                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.noAuction).to.be.true;

                    done();
                });
        });

    });


    it("should get auction when there is current auction", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        models.Auction.create(basicAuction).then(() => {

            request(app).get('/api/auctions')
                .set('x-access-token', accessToken)
                .end((err, response) => {
                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.id).to.be.equal(1);

                    done();
                });

        });


    });


    it("should start auction when created if there is no existing auction", function(done) {

        request(app).post('/api/auctions/start')
            .send({
                user_id: 1,
                inventory_id: 1,
                quantity: 1,
                minimum_bid: 100
            })
            .set('x-access-token', accessToken)
            .end((err, response) => {

                if (err) return done(err);

                expect(response.statusCode).to.equal(200);

                expect(response.body.status).to.be.true;

                expect(response.body.fullState).to.be.equal(auctionStates.LIVE.key);

                done();

            });

    });


    it("should start auction when created if last auction has ended", function(done) {

        // Simulating an ended auction
        basicAuction.state = auctionStates.ENDED.value;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/start')
                .send({
                    user_id: 1,
                    inventory_id: 1,
                    quantity: 1,
                    minimum_bid: 100
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.true;

                    expect(response.body.fullState).to.be.equal(auctionStates.LIVE.key);

                    done();

                });

        });
    });


    it("should queue auction when created if an auction is on going", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/start')
                .send({
                    user_id: 1,
                    inventory_id: 1,
                    quantity: 1,
                    minimum_bid: 100
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.true;

                    expect(response.body.fullState).to.be.equal(auctionStates.QUEUED.key);

                    done();

                });

        });


    });


    it("should queue auction when created if last auction is in interval", function(done) {

        // Simulating an auction in interval
        basicAuction.state = auctionStates.AUCTION_INTERVAL.value;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/start')
                .send({
                    user_id: 1,
                    inventory_id: 1,
                    quantity: 1,
                    minimum_bid: 100
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.true;

                    expect(response.body.fullState).to.be.equal(auctionStates.QUEUED.key);

                    done();

                });

        });


    });

    it("should not placed bid on my auction", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        // Simulating an auction ending in the next 90 seconds
        basicAuction.end_time = moment().unix() + 90;

        // Simulating an auction started by me
        basicAuction.user_id = 2;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/bid')
                .send({
                    auction_id: 1,
                    user_id: 2,
                    amount: 100,
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.false;

                    expect(response.body.message).to.be.equal('Sorry! you can not place a bid on your auction');

                    done();

                });

        });

    });


    it("should not placed bid on ended auction", function(done) {

        // Simulating an ended auction
        basicAuction.state = auctionStates.ENDED.value;

        // Simulating an auction that ended 10 seconds ago
        basicAuction.end_time = moment().unix() - 10;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/bid')
                .send({
                    auction_id: 1,
                    user_id: 2,
                    amount: 100,
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.false;

                    expect(response.body.message).to.be.equal('Sorry! you can not place a bid on an ended auction');

                    done();

                });

        });


    });

    it("should make sure my bid is greater than current winning bid", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        // Simulating an auction that will end in the 90 seconds
        basicAuction.end_time = moment().unix() + 90;

        // Simulating a winning bid of 100 coins
        basicAuction.bid = 100;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/bid')
                .send({
                    auction_id: 1,
                    user_id: 2,
                    amount: 100,
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.false;

                    expect(response.body.message).to.be.equal('Sorry! Your bid must be higher than the current winning bid');

                    done();

                });

        });

    });


    it("should make sure bid is greater than the minimum bid", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        // Simulating an auction that will end in 90 seconds
        basicAuction.end_time = moment().unix() + 90;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/bid')
                .send({
                    auction_id: 1,
                    user_id: 2,
                    amount: 50,
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.false;

                    expect(response.body.message).to.be.equal('Sorry! Your bid must be higher or equal to the minimum bid');

                    done();

                });

        });


    });


    it("should make sure user has enough coins for current bid", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        // Simulating an auction that will end in 90 seconds
        basicAuction.end_time = moment().unix() + 90;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/bid')
                .send({
                    auction_id: 1,
                    user_id: 2,
                    amount: 100000,
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.false;

                    expect(response.body.message).to.be.equal('Sorry! You do not have enough coins to place this bid');

                    done();

                });

        });


    });


    it("should be able to place bid", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        // Simulating an auction that will end in 90 seconds
        basicAuction.end_time = moment().unix() + 90;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/bid')
                .send({
                    auction_id: 1,
                    user_id: 2,
                    amount: 150,
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.true;

                    expect(response.body.message).to.be.equal('Bid placed sucessfully');

                    done();

                });

        });

    });


    it("should extend the auction closing time if bid is placed while time is less than 10", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        // Simulating the auction to end in 5 seconds
        basicAuction.end_time = moment().unix() + 5;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/bid')
                .send({
                    auction_id: 1,
                    user_id: 2,
                    amount: 150,
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.true;

                    expect(response.body.metaMessage).to.be.equal('Auction time extended');


                    done();

                });

        });

    });

    it("should be able to end auction", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        // Simulating an auction that ended 5 seconds ago
        basicAuction.end_time = moment().unix() - 5;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/end')
                .send({
                    auction_id: 1,
                    bid_by: 2
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.true;

                    expect(response.body.message).to.be.equal('Auction Closed Successfully');

                    done();

                });

        });

    });


    it("should not be able to end auction already ended", function(done) {

        // Simulating an ended auction
        basicAuction.state = auctionStates.ENDED.value;

        // Simulating an auction that ended 3 minutes ago
        basicAuction.end_time = moment().unix() - 180;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/end')
                .send({
                    auction_id: 1,
                    bid_by: 2
                })
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.true;

                    expect(response.body.message).to.be.equal('Auction Closed Already');

                    done();

                });

        });

    });


    it("should not start any auction if there is no queued auction", function(done) {

        request(app).post('/api/auctions/check')
            .set('x-access-token', accessToken)
            .end((err, response) => {

                if (err) return done(err);

                expect(response.statusCode).to.equal(200);

                expect(response.body.status).to.be.true;

                expect(response.body.new_auction).to.be.false;

                done();

            });

    });

    it("should start next queued auction when checking the queue", function(done) {

        // Simulating a queued auction
        basicAuction.state = auctionStates.QUEUED.value;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/check')
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.true;

                    expect(response.body.new_auction).to.be.true;

                    done();

                });

        });


    });


    it("should not check queued auction when an auction is currently going on", function(done) {

        // Simulating a live auction
        basicAuction.state = auctionStates.LIVE.value;

        models.Auction.create(basicAuction).then(() => {

            request(app).post('/api/auctions/check')
                .set('x-access-token', accessToken)
                .end((err, response) => {

                    if (err) return done(err);

                    expect(response.statusCode).to.equal(200);

                    expect(response.body.status).to.be.false;

                    expect(response.body.message).to.be.equal('You can only check the queue when there is no ongoing auction');

                    done();

                });

        });


    });

    // TODO later

    // it("should not return a winner if a bid is not placed on a closed auction", function(done) {



    // });


    // it("should exchange coins and inventory", function(done) {



    // });


});
