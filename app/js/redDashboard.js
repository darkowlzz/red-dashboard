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


function DialogController ($scope, $rootScope, $mdDialog, requestDone,
                           requestUndone) {
  $scope.detail = $rootScope.detailView;
  $scope.hide = function () {
    $mdDialog.hide();
  };
  $scope.cancel = function () {
    $mdDialog.cancel();
  };
  $scope.done = function (data) {
    if (! _.isUndefined(data.reqId)) {
      // it is blood request
      //requestDone(data);
    } else {
      // it is blood donor
    }
    $mdDialog.hide();
    // Add data update in a service and update here using the service
  };
  $scope.undone = function (data) {
    if (! _.isUndefined(data.reqId)) {
      // it is blood request
      //requestUndone(data);
    } else {
      // it is blood donor 
    }
    $mdDialog.hide();
  };
}

redDashboard.controller('RequestsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList) {
    $scope.bloodReqs = $rootScope.bloodReqs;

    getList('/bloodreqs').then(function (data) {
      $rootScope.bloodReqs = $scope.bloodReqs = data;
    });

    $scope.detail = function (req) {
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
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList) {
    $scope.donors = $rootScope.donors;

    getList('/donors').then(function (data) {
      $rootScope.donors = $scope.donors = data;
    });

    $scope.detail = function (don) {
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


redDashboard.factory('requestDone', ['$http',
  function ($http) {
    return function (bloodreq) {
      $http.post('/request/done', { data: bloodreq, done: true })
        .success(function (o) {

        })
        .error(function (err) {

        });
    }
  }
]);

redDashboard.factory('requestUndone', ['$http',
  function ($http) {
    return function (bloodreq) {
      $http.post('/request/done', { data: bloodreq, done: false })
        .success(function (o) {

        })
        .error(function (err) {

        });
    }
  }
]);

redDashboard.factory('getList', ['$http', function ($http) {
  return function (uri) {
    var promise = $http.get(uri).then(function (resp) {
      return resp.data;
    });
    return promise;
  };
}]);
