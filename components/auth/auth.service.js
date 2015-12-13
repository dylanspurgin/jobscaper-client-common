'use strict';

angular.module('jsAuth')
.factory('jsAuthService', function Auth($location, $rootScope, $http, jsUserService, $cookieStore, $q, Restangular, $window) {

    var _currentjsUserService = {},
    _loginEndpoint = '/auth/local';

    if ($cookieStore.get('token')) {
      jsUserService.get().then(function(user) {
        _.merge(_currentjsUserService,user);
    });
  }

  return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @return {Promise}
       */
       login: function (user) {
        var deferred = $q.defer();
        Restangular.all(_loginEndpoint).post({
          email: user.email,
          password: user.password
      })
        .then(function (response) {
            $cookieStore.put('token', response.token);
            jsUserService.get().then(function(user) {
              _.merge(_currentjsUserService,user);
              $rootScope.$broadcast('login');
          });
            deferred.resolve(response);
        })
        .catch(function (err) {
            err.message = 'Invalid username and password.';
            deferred.reject(err);
        }.bind(this));
        return deferred.promise;
    },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
       logout: function () {
        $cookieStore.remove('token');
        $window.location.reload(); // Reload app to clear out previous user data
    },

      /**
       * Create a new user
       * @param  {Object} user - user info
       * @return {Promise}
       */
       createjsUserService: function (user) {
        var deferred = $q.defer();
        jsUserService.create(user)
        .then(function (user) {
            $cookieStore.put('token', user.token);
            _.merge(_currentjsUserService,user);
            deferred.resolve(user);
        })
        .catch(function (err) {
            this.logout();
            deferred.reject(err);
        });
        return deferred.promise;
    },

      /**
       * Change password
       * TODO - refactor to use Restangular
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
       changePassword: function (oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return jsUserService.changePassword({id: _currentjsUserService._id}, {
          oldPassword: oldPassword,
          newPassword: newPassword
      }, function (user) {
          return cb(user);
      }, function (err) {
          return cb(err);
      }).$promise;
    },

      ///**
      // * Gets all available info on authenticated user
      // *
      // * @return {Object} user
      // */
      //getCurrentjsUserService: function () {
      //  return currentjsUserService;
      //},
      //
      currentjsUserService: _currentjsUserService,

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
       isLoggedIn: function () {
        return _currentjsUserService.hasOwnProperty('role');
    },

      /**
       * Waits for currentjsUserService to resolve before checking if user is logged in
       */
       isLoggedInAsync: function () {
        var deferred = $q.defer();
        jsUserService.get()
        .then(function (user) {
            deferred.resolve(user.hasOwnProperty('role'));
        })
        .catch(function () {
            deferred.resolve(false);
        });
        return deferred.promise;
    },

      /**
       * Does the current user have the 'admin' role
       * @return {Boolean}
       */
       isAdmin: function () {
        return _currentjsUserService.role === 'admin';
    },

      /**
       * Does the current user have the 'manager' role
       * @returns {boolean}
       */
       isManager: function () {
        return _currentjsUserService.role === 'manager'
    },

      /**
       * Get auth token
       */
       getToken: function () {
        return $cookieStore.get('token');
    }
};
});
