var redDashboard = angular.module('redDashboard', [
                              'ngRoute', 'ngMaterial', 'ngMdIcons'
                              ]);


// Controllers
// ============================================================

redDashboard.controller('MainCtrl', [
  '$scope', '$rootScope', '$route', '$routeParams',
  '$location', '$mdMedia', '$mdSidenav',
  function ($scope, $rootScope, $route, $routeParams,
            $location, $mdMedia, $mdSidenav) {

    /**
     * Goes to the given path
     *
     * @param {String} path
     *    Navigation path, applied to the page url.
     * @param {String} sectionName
     *    Title of the Nav section, used in the page header.
     */
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

    // Toggle open/close sidenav bar
    $scope.toggleSidebar = function () {
      $mdSidenav('left').toggle();
    };

    // Open sidenav bar
    $scope.sidebarOpen = function () {
      $mdSidenav('left').open();
    };

    // Close sidenav bar
    $scope.sidebarClose = function () {
      $mdSidenav('left').close();
    };
  }
]);


/**
 * Dashboard Controller
 */
redDashboard.controller('DashboardCtrl', [
  '$scope', '$routeParams',
  function ($scope, $routeParams) {

  }
]);


/**
 * Profile Controller
 */
redDashboard.controller('ProfileCtrl', [
  '$scope', '$routeParams',
  function ($scope, $routeParams) {

  }
]);


/**
 * Dialog box Controller for Detail Views.
 */
function DialogController ($scope, $rootScope, $mdDialog, done, undone) {
  $scope.detail = $rootScope.detailView;
  $scope.loading = false;

  // Hide the dialog box
  $scope.hide = function () {
    $mdDialog.hide();
  };

  // Cancel the dialog box
  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  /**
   * Done option in the dialog box
   *
   * @param {Object} data
   *    An object containing item data to be made DONE.
   */
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

  /**
   * Undone option in the dialog box
   *
   * @param {Object} data
   *    An object containing item data to be made UNDONE.
   */
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


/**
 * Requests Controller
 */
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


/**
 * Donors Controller
 */
redDashboard.controller('DonorsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList) {
    $scope.donors = $rootScope.donors;
    $scope.donorsDone = $rootScope.donorsDone;
    $scope.loading = true;
    var index, elem, removed;

    // Update, check for any new data and fetch if available.
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


/**
 * Create Camp Controller
 */
redDashboard.controller('CreateCampCtrl', [
  '$scope', '$routeParams', 'submitCamp',
  function ($scope, $routeParams, submitCamp) {
    $scope.camp = {};
    $scope.loading = false;
    $scope.submitted = false;
    $scope.error = false;

    // Handle form submit
    $scope.submit = function () {
      var result = validate($scope.camp);

      if (result) {
        $scope.error = false;
        $scope.loading = true;

        // Submit the form data
        submitCamp('/camp/new', $scope.camp).then(function (resp) {
          $scope.loading = false;
          $scope.submitted = true;
        });
      } else {
        $scope.error = true;
      }
    }

    // Validate the form data
    // FIXME: Need improvement
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


// Module configuration
redDashboard.config(['$mdThemingProvider', '$routeProvider',
  function($mdThemingProvider, $routeProvider) {

    // Define theme
    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('pink');

    // Define routes
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


// Services
// =================================================

/**
 * done service to set `done` value to true for donors or requests.
 *
 * @param {String} uri
 *    A valid target uri where the data is stored.
 *
 * @param {Object} data
 *    Data of the document to be changed, used for correct identification
 *    of the document.
 */
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


/**
 * undone service to set `done` value to false for donors or requests.
 *
 * @param {String} uri
 *    A valid target uri where the data is stored.
 *
 * @param {Object} data
 *    Data of the document to be changed, used for correct identifiaction
 *    of the document.
 */
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


/**
 * getList service to fetch the list of items from donors or requests.
 *
 * @param {String} uri
 *    Target uri to fetch the data.
 *
 * @return {Promise}
 *    Returns a promise which is completed when the whole of the requested
 *    data is fetched.
 */
redDashboard.factory('getList', ['$http', function ($http) {
  return function (uri) {
    var promise = $http.get(uri).then(function (resp) {
      return resp.data;
    });
    return promise;
  };
}]);


/**
 * submitCamp service to submit new camp data.
 *
 * @param {String} uri
 *    Target uri to submit the data.
 *
 * @param {Object} data
 *    Camp detailed data to be submitted.
 *
 * @return {Promise}
 *    Returns a promise which is completed when the data is submitted.
 */
redDashboard.factory('submitCamp', ['$http', function ($http) {
  return function (uri, data) {
    var promise = $http.post(uri, data).then(function (resp) {
                    return resp.data;
                  });
    return promise;
  };
}]);
