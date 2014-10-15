/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2014 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 */

describe('AuthModalDialogCtrl Test', function () {
    var storeTenant = '121212';
    var mockedGlobalData = {store: {tenant: storeTenant}};
    var $scope, $rootScope, $controller, AuthModalDialogCtrl, $modalInstanceMock, $q, MockedAuthSvc, mockedLoginOpts={},
       mockedSessionSvc={
           afterLogIn: jasmine.createSpy()
       }, mockBackend,
        deferredSignIn, deferredSignUp;
    var mockedForm = {};
    var mockedSettings = {
        accessCookie: 'accessCookie',
        userIdKey: 'userIdKey',
        apis: {
            customers: {
                baseUrl: 'http://dummy-test-server.hybris.com'
            }
        },
        headers: {
            hybrisAuthorization: 'Authorization'
        }
    };

    var mockedAuthDialogManager = {
        showResetPassword: jasmine.createSpy('showResetPassword')
    };

    var email = 'some.user@hybris.com';
    var authModel = {
        email: email,
        password: 'secret'
    };
    $modalInstanceMock = {
        close: jasmine.createSpy('close')
    };

    //***********************************************************************
    // Common Setup
    // - shared setup between constructor validation and method validation
    //***********************************************************************

    // configure the target controller's module for testing - see angular.mock
    beforeEach(angular.mock.module('restangular'));
    beforeEach(angular.mock.module('ui.router'));
    beforeEach(module('ds.auth', function ($provide) {
        $provide.value('settings', mockedSettings);
        $provide.value('GlobalData', mockedGlobalData);
        $provide.value('$translate', {});
        $provide.value('SessionSvc', mockedSessionSvc);
    }));

    beforeEach(inject(function(_$rootScope_, _$controller_, _$q_, _$httpBackend_) {

        this.addMatchers({
            toEqualData: function (expected) {
                return angular.equals(this.actual, expected);
            }
        });
        $rootScope =  _$rootScope_;
        $scope = _$rootScope_.$new();
        $controller = _$controller_;
        $q = _$q_;
        mockBackend = _$httpBackend_;

    }));

    beforeEach(function () {
        deferredSignIn = $q.defer();
        deferredSignUp = $q.defer();

        MockedAuthSvc = {
            signin: jasmine.createSpy('signin').andCallFake(function(){
                return deferredSignIn.promise;
            }),
            signup: jasmine.createSpy('signup').andCallFake(function() {
                return deferredSignUp.promise;
            })
        };
        mockedSettings.hybrisUser = null;


        AuthModalDialogCtrl = $controller('AuthModalDialogCtrl', {$scope: $scope, $modalInstance: $modalInstanceMock,
            $controller: $controller, $q: $q, AuthSvc: MockedAuthSvc, SessionSvc: mockedSessionSvc,
           settings: mockedSettings, AuthDialogManager: mockedAuthDialogManager, loginOpts: mockedLoginOpts });
    });

    it("should expose correct data to the scope", function() {
        expect($scope.user).toBeDefined();
        expect($scope.user.signup).toBeDefined();
        expect($scope.user.signin).toBeDefined();
        expect($scope.errors).toBeDefined();
        expect($scope.errors.signup).toBeDefined();
        expect($scope.errors.signin).toBeDefined();
        expect($scope.signup).toBeDefined();
        expect($scope.signin).toBeDefined();
        expect($scope.continueAsGuest).toBeDefined();
        expect($scope.showResetPassword).toBeDefined();
        expect($scope.clearErrors).toBeDefined();
    });

    describe('signin()', function(){

        it("should call AuthSvc signin if form valid", function() {
            mockedForm.$valid = true;
            $scope.signin(authModel, mockedForm);
            expect(MockedAuthSvc.signin).toHaveBeenCalledWith(authModel);
        });

        it('should not call AuthSvc if form invalid', function(){
            mockedForm.$valid = false;
            $scope.signin(authModel, mockedForm);
            expect(MockedAuthSvc.signin).not.toHaveBeenCalled();
        });

        xit('on success should set hybris user and close dialog', function(){
            mockedForm.$valid = false;
            $scope.signin(authModel, mockedForm);
            deferredSignIn.resolve({});
            $scope.$apply();
            var scopeEmail = 'scope.email';
            $scope.user = {
                signin: {
                    email: scopeEmail
                }
            };
            expect($modalInstanceMock.close).toHaveBeenCalled();
            //expect(mockedSettings.hybrisUser).toEqualData(scopeEmail);
        });
    });

    describe('signup', function(){

        it("should call AuthSvc signup if form valid", function() {
            mockedForm.$valid = true;
            $scope.signup(authModel, mockedForm);
            expect(MockedAuthSvc.signup).toHaveBeenCalledWith(authModel);
        });

        it('should not call AuthSvc if form invalid', function(){
            mockedForm.$valid = false;
            $scope.signup(authModel, mockedForm);
            expect(MockedAuthSvc.signup).not.toHaveBeenCalled();
        });

        it('should call signin after successful signup', function(){
            mockedForm.$valid = true;
            $scope.signup(authModel, mockedForm);
            deferredSignUp.resolve({});
            $scope.$apply();
            expect(MockedAuthSvc.signin).toHaveBeenCalledWith(authModel);
        });

        it('should not call signin after failed signup', function(){
            mockedForm.$valid = true;
            $scope.signup(authModel, mockedForm);
            deferredSignUp.reject({});
            $scope.$apply();
            expect(MockedAuthSvc.signin).not.toHaveBeenCalledWith();
        });

        it('should update account from signup', function () {
            mockedForm.$valid = true;
            $scope.signup(authModel, mockedForm);
            deferredSignUp.resolve({});
            $scope.$apply();
            expect(MockedAuthSvc.signin).toHaveBeenCalledWith(authModel);
        });
    });

    describe('showResetPassword()', function(){
       it('should delegate to AuthDialogManager', function(){
          $scope.showResetPassword();
           expect(mockedAuthDialogManager.showResetPassword).toHaveBeenCalled();
       });
    });

    describe('continueAsGuest()', function(){
       it('should close dialog', function(){
           $scope.continueAsGuest();
           expect($modalInstanceMock.close).toHaveBeenCalled();
       });
    });

    describe('clearErrors()', function () {
        it('should set error message to empty', function () {
            $scope.errors.signin = ['something is wrong'];
            $scope.errors.signup = ['more stuff wrong'];
            $scope.clearErrors();
            expect($scope.errors.signin).toEqualData([]);
            expect($scope.errors.signup).toEqualData([]);
        });
    });

});
