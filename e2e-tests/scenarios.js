'use strict';

describe('my app', function() {

    // 
    // it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
    //   browser.get('index.html');
    //   chai.expect(browser.getLocationAbsUrl()).to.eventually.match("/view1");
    // });
    //

    describe('view1', function() {

        beforeEach(function() {
            browser.get('index.html#!/view1');
        });


        it('should render view1 when user navigates to /view1', function() {
            chai.expect(element.all(by.css('[ng-view] p')).first().getText()).
            to.eventually.match(/partial for view 1/);
        });

    });


    describe('view2', function() {

        beforeEach(function() {
            browser.get('index.html#!/view2');
        });


        it('should render view2 when user navigates to /view2', function() {
            chai.expect(element.all(by.css('[ng-view] p')).first().getText()).
            to.eventually.match(/partial for view 2/);
        });

    });
});