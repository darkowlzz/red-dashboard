var redDashboard = angular.module('redDashboard', [
                              'ngRoute', 'ngMaterial', 'ngMdIcons'
                              ]);

// Module configuration
redDashboard.config(['$mdThemingProvider', '$routeProvider', '$httpProvider',
  function($mdThemingProvider, $routeProvider, $httpProvider) {

    // Configure httpProvider
    $httpProvider.interceptors.push('authInterceptor');

    // Define theme
    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('pink');

    // Define routes
    $routeProvider
      .when('/', {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/profile', {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/data', {
        templateUrl: 'templates/data.html',
        controller: 'DataCtrl'
      })
      .when('/requests', {
        templateUrl: 'templates/pending.html',
        controller: 'RequestsCtrl'
      })
      .when('/donors', {
        templateUrl: 'templates/pending.html',
        controller: 'DonorsCtrl'
      })
      .when('/camps', {
        templateUrl: 'templates/pending.html',
        controller: 'CampsCtrl'
      })
      .when('/create-camp', {
        templateUrl: 'templates/createCamp.html',
        controller: 'CreateCampCtrl'
      })
      .when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'UserCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
