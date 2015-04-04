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
    $rootScope.reqsDone = [];
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
    $rootScope.donorsDone = [];

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


function DialogController ($scope, $rootScope, $mdDialog, done, undone) {
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
      done('/request/done', data).then(function (resp) {
        $mdDialog.hide(resp);
      });
    } else {
      // it is blood donor
      done('/donor/done', data).then(function (resp) {
        $mdDialog.hide(resp);
      });
    }
  };
  $scope.undone = function (data) {
    if (! _.isUndefined(data.reqId)) {
      // it is blood request
      undone('/request/done', data).then(function (resp) {
        $mdDialog.hide(resp);
      });
    } else {
      // it is blood donor
      undone('/donor/done', data).then(function (resp) {
        $mdDialog.hide(resp);
      });
    }
  };
}

redDashboard.controller('RequestsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList) {
    $scope.bloodReqs = $rootScope.bloodReqs;
    $scope.reqsDone = $rootScope.reqsDone;
    var index, elem, removed;

    // Get blood request list
    getList('/bloodreqs').then(function (data) {
      $scope.bloodReqs = $scope.reqsDone = [];
      index = _.findIndex(data, _.matchesProperty('done', true));
      while (index > -1) {
        elem = data.splice(index, 1);
        $scope.reqsDone.push(elem[0]);
        index = _.findIndex(data, _.matchesProperty('done', true));
      }
      $rootScope.bloodReqs = $scope.bloodReqs = data;
      $rootScope.reqsDone = $scope.reqsDone;
    });

    // Initiate detail view of a list item
    $scope.detail = function (req, type) {
      $rootScope.detailView = req;
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'detailRequest.html'
      })
      .then(function (ans) {
        // done / undone
        if (type == 'undone') {
          index = _.findIndex($scope.bloodReqs,
                              _.matchesProperty('reqId', ans.reqId));
          $rootScope.bloodReqs[index] = $scope.bloodReqs[index] = ans;
        } else if (type == 'done') {
          index = _.findIndex($scope.reqsDone,
                              _.matchesProperty('reqId', ans.reqId));
          $rootScope.reqsDone[index] = $scope.reqsDone[index] = ans;
        }
        if (ans.done) {
          removed = $scope.bloodReqs.splice(index, 1);
          $rootScope.bloodReqs = $scope.bloodReqs;
          $scope.reqsDone.push(removed[0]);
          $rootScope.reqsDone = $scope.reqsDone;
        } else {
          removed = $scope.reqsDone.splice(index, 1);
          $rootScope.reqsDone = $scope.reqsDone;
          $scope.bloodReqs.push(removed[0]);
          $rootScope.bloodReqs = $scope.bloodReqs;
        }
      }, function () {
        // cancelled
      });
    };
  }
]);


redDashboard.controller('DonorsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList) {
    $scope.donors = $rootScope.donors;
    $scope.donorsDone = $rootScope.donorsDone;
    var index, elem, removed;

    getList('/donors').then(function (data) {
      $scope.donors = $scope.donorsDone = [];
      index = _.findIndex(data, _.matchesProperty('done', true));
      while (index > -1) {
        elem = data.splice(index, 1);
        $scope.donorsDone.push(elem[0]);
        index = _.findIndex(data, _.matchesProperty('done', true));
      }
      $rootScope.donors = $scope.donors = data;
      $rootScope.donorsDone = $scope.donorsDone;
    });

    // Initiate detail view of a list item
    $scope.detail = function (don, type) {
      $rootScope.detailView = don;
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'detailDonor.html'
      })
      .then(function (ans) {
        // done / undone
        if (type == 'undone') {
          index = _.findIndex($scope.donors,
                              _.matchesProperty('donId', ans.donId));
          $rootScope.donors[index] = $scope.donors[index] = ans;
        } else if (type == 'done') {
          index = _.findIndex($scope.donorsDone,
                              _.matchesProperty('donId', ans.donId));
          $rootScope.donorsDone[index] = $scope.donorsDone[index] = ans;
        }
        if (ans.done) {
          removed = $scope.donors.splice(index, 1);
          $rootScope.donors = $scope.donors;
          $scope.donorsDone.push(removed[0]);
          $rootScope.donorsDone = $scope.donorsDone;
        } else {
          removed = $scope.donorsDone.splice(index, 1);
          $rootScope.donorsDone = $scope.donorsDone;
          $scope.donors.push(removed[0]);
          $rootScope.donors = $scope.donors;
        }
      }, function () {
        // cancelled
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


redDashboard.factory('done', ['$http',
  function ($http) {
    return function (uri, data) {
      var promise = $http.post(uri, {
                      data: data, done: true
                    }).then(function (resp) {
                      return resp.data;
                    });
      return promise;
    }
  }
]);

redDashboard.factory('undone', ['$http',
  function ($http) {
    return function (uri, data) {
      var promise = $http.post(uri, {
                      data: data, done: false
                    }).then(function (resp) {
                      return resp.data;
                    });
      return promise;
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
