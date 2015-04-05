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
    $rootScope.bloodReqs = [];
    $rootScope.reqsDone = [];
    $rootScope.donors = [];
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
  $scope.loading = false;
  $scope.hide = function () {
    $mdDialog.hide();
  };
  $scope.cancel = function () {
    $mdDialog.cancel();
  };
  $scope.done = function (data) {
    $scope.loading = true;
    if (! _.isUndefined(data.reqId)) {
      // it is blood request
      done('/request/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else {
      // it is blood donor
      done('/donor/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    }
  };
  $scope.undone = function (data) {
    $scope.loading = true;
    if (! _.isUndefined(data.reqId)) {
      // it is blood request
      undone('/request/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else {
      // it is blood donor
      undone('/donor/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    }
  };
}

redDashboard.controller('RequestsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList) {
    $scope.bloodReqs = $rootScope.bloodReqs;
    $scope.reqsDone = $rootScope.reqsDone;
    $scope.loading = true;
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
      $scope.loading = false;
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
    $scope.loading = true;
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
      $scope.loading = false;
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
  '$scope', '$routeParams', 'submitCamp',
  function ($scope, $routeParams, submitCamp) {
    $scope.camp = {};
    $scope.loading = false;
    $scope.submitted = false;
    $scope.error = false;

    $scope.submit = function () {
      var result = validate($scope.camp);

      if (result) {
        $scope.error = false;
        $scope.loading = true;

        submitCamp('/camp/new', $scope.camp).then(function (resp) {
          $scope.loading = false;
          $scope.submitted = true;
        });
      } else {
        $scope.error = true;
      }
    }

    function validate (data) {
      var result = true;
      if (_.isEmpty(data.title) && _.isEmpty(data.location) &&
          _.isEmpty(data.organizer) && _.isEmpty(data.contact) &&
          _.isEmpty(data.date)) {
        result = false;
      }
      return result;
    }
  }
]);


redDashboard.config(['$mdThemingProvider', '$routeProvider',
  function($mdThemingProvider, $routeProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('pink');

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
        templateUrl: 'camp.html',
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

redDashboard.factory('submitCamp', ['$http', function ($http) {
  return function (uri, data) {
    var promise = $http.post(uri, data).then(function (resp) {
                    return resp.data;
                  });
    return promise;
  };
}]);
