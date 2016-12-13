angular.element(document).ready(function () {
  var toolProviderApp = angular.module('toolProviderApp', [
    'ngRoute',
    'controllers',
    'filters',
    'services',
    'jsonFormatter'
  ]);

  /**
   * Created by cthomas on 4/11/16.
   */

  toolProviderApp.provider('configService', function () {
    var options = {};
    this.config = function (opt) {
      angular.extend(options, opt);
    };
    this.$get = [function () {
      if (!options) {
        throw new Error('Config options must be configured');
      }
      return options;
    }];
  });

  toolProviderApp.config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/tp_registration', {
        templateUrl: 'partials/tp_registration.html',
        controller: 'RegistrationController'
      }).otherwise({
        redirectTo: '/tp_registration'
      });
    }]);


  angular.bootstrap('#toolProviderApp', ['toolProviderApp']);
});

