var redDashboard = angular.module('redDashboard', [
                              'ngRoute', 'ngMaterial', 'ngMdIcons'
                              ]);

redDashboard.controller('MainCtrl', [
  '$scope', '$rootScope', '$route', '$routeParams',
  '$location', '$mdMedia', '$mdSidenav',
  function ($scope, $rootScope, $route, $routeParams,
            $location, $mdMedia, $mdSidenav) {
    $scope.go = function (path) {
      $location.url(path);

      if ($mdMedia('sm')) {
        $scope.toggleSidebar();
      }
    };

    $scope.username = 'John Doe';
    $rootScope.bloodReqs = [];
    $rootScope.donors = [];

    $scope.toggleSidebar = function () {
      $mdSidenav('left').toggle();
    };
  }
]);


redDashboard.controller('DashboardCtrl', [
  '$scope', '$routeParams',
  function ($scope, $routeParams) {

  }
]);


redDashboard.controller('ProfileCtrl', [
  '$scope', '$routeParams',
  function ($scope, $routeParams) {

  }
]);


redDashboard.controller('RequestsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http',
  function ($scope, $rootScope, $routeParams, $http) {
    $scope.bloodReqs = $rootScope.bloodReqs;
    console.log('loading bloodreqs...');

    $http.get('/bloodreqs')
      .success(function (data, status, headers, config) {
        console.log('ng, got data', data);
        $rootScope.bloodReqs = data;
        $scope.bloodReqs = data;
      })
      .error(function () {
        console.log('Error in requesting');
      });
  }
]);


redDashboard.controller('DonorsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http',
  function ($scope, $rootScope, $routeParams, $http) {
    $scope.donors = $rootScope.donors;
    console.log('loading donors...');

    $http.get('/donors')
      .success(function (data) {
        console.log('ng, got data', data);
        $rootScope.donors = data;
        $scope.donors = data;
      })
      .error(function () {
        console.log('Error in requesting');
      });
  }
]);


redDashboard.controller('CreateCampCtrl', [
  '$scope', '$routeParams',
  function ($scope, $routeParams) {

  }
]);


redDashboard.config(['$mdThemingProvider', '$routeProvider',
  function($mdThemingProvider, $routeProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('blue');

    $routeProvider
      .when('/', {
        templateUrl: 'dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/profile', {
        templateUrl: 'profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/requests', {
        templateUrl: 'requests.html',
        controller: 'RequestsCtrl'
      })
      .when('/donors', {
        templateUrl: 'donors.html',
        controller: 'DonorsCtrl'
      })
      .when('/create-camp', {
        templateUrl: 'create-camp.html',
        controller: 'CreateCampCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
