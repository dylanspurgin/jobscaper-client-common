'use strict';

angular.module('jsAuth')
  .factory('jsUserService', function (Restangular) {

    var
      _endpoint = '/api/users',
      _getEndpoint = 'me',
      _passwordEndpoint = 'password',
      _restangularUsers = Restangular.all(_endpoint);

    var _userMixins = {
      changePassword: function () {
        return this.customPUT(_passwordEndpoint);
      }
    };

    Restangular.extendModel(_endpoint, function (model) {
      angular.extend(model, _userMixins);
      return model;
    });

    var
      publicApi = {
        get: function () {
          return Restangular.one(_endpoint, _getEndpoint).get();
        },
        getAllByOrg: function () {
          return Restangular.all(_endpoint).getList();
        },
        addUser: function (organization) {
          var user = {
            name: 'New user',
            email: '',
            organization: organization._id,
            role: 'user',
            password: '',
            provider: 'local'
          };
          return Restangular.restangularizeElement(null, user, _endpoint);
        },
        create: function (user) {
          return _restangularUsers.post(user);
        }
      };

    return publicApi;

  });
