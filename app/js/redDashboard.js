var redDashboard = angular.module('redDashboard', [
                              'ngRoute', 'ngMaterial', 'ngMdIcons'
                              ]);

redDashboard.controller('MainCtrl', [
  '$scope', '$rootScope', '$route', '$routeParams',
  '$location', '$mdMedia', '$mdSidenav',
  function ($scope, $rootScope, $route, $routeParams,
            $location, $mdMedia, $mdSidenav) {
    $scope.go = function (path, sectionName) {
      $location.url(path);
      $scope.currentSection = sectionName;

      if ($mdMedia('sm')) {
        $scope.toggleSidebar();
      }
    };

    // Dummy data
    $scope.username = 'John Doe';
    $rootScope.bloodReqs = [
      {
        name: 'King Arthur',
        email: 'arthur@kings.org',
        phone: '7849523890',
        address: 'Gondwana Land',
        group: 'A+',
        quantity: 2.5,
        date: '05/12/2015'
      },
      {
        name: 'Atila Di Hun',
        email: 'atila@kings.org',
        phone: '3563483473',
        address: 'Palestine',
        group: 'O+',
        quantity: 0.5,
        date: '06/19/2015'
      }
    ];
    $rootScope.donors = [
      {
        name: 'King Arthur',
        age: 27,
        email: 'arthur@kings.org',
        phone: '7464688434',
        address: 'Gondwana Land',
        group: 'A+'
      },
      {
        name: 'Atila Di Hun',
        age: 24,
        email: 'atila@kings.org',
        phone: '7823829823',
        address: 'Palestine',
        group: 'O+'
      }
    ];

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


function DialogController($scope, $rootScope, $mdDialog) {
  $scope.detail = $rootScope.detailView;
  $scope.hide = function () {
    $mdDialog.hide();
  };
  $scope.cancel = function () {
    $mdDialog.cancel();
  };
}

redDashboard.controller('RequestsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog) {
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

    $scope.detail = function (req) {
      console.log('req is', req);
      $rootScope.detailView = req;

      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'detailRequest.html'
      })
      .then(function (answer) {
        
      }, function () {
        
      });
    };
  }
]);


redDashboard.controller('DonorsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog) {
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

    $scope.detail = function (don) {
      console.log('don is', don);
      $rootScope.detailView = don;

      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'detailDonor.html'
      })
      .then(function () {
      
      }, function () {
      
      });
    };
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
