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
    $rootScope.camps = [];
    $rootScope.campsDone = [];

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
  $scope.done = function (data, context) {
    $scope.loading = true;
    if (context == 'request') {
      // it is blood request
      done('/request/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else if (context == 'donor') {
      // it is blood donor
      done('/donor/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else if (context == 'camp') {
      done('/camp/done', data).then(function (resp) {
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
  $scope.undone = function (data, context) {
    $scope.loading = true;
    if (context == 'request') {
      // it is blood request
      undone('/request/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else if (context == 'donor') {
      // it is blood donor
      undone('/donor/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else if (context == 'camp') {
      undone('/camp/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      })
    }
  };
}


/**
 * Requests Controller
 */
redDashboard.controller('RequestsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  'segregateData', 'orgDoneData', 'applyDetailChange',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList,
            segregateData, orgDoneData, applyDetailChange) {
    $scope.bloodReqs = $rootScope.bloodReqs;
    $scope.reqsDone = $rootScope.reqsDone;
    $scope.loading = true;
    var index, elem, removed;

    // Get blood request list
    getList('/bloodreqs').then(function (data) {
      _.assign($scope, orgDoneData(segregateData(data), 'bloodreqs'));
      _.assign($rootScope, { bloodReqs: $scope.bloodReqs,
                             reqsDone: $scope.reqsDone });
      $scope.loading = false;
    });

    // Initiate detail view of a list item
    $scope.detail = function (req, type) {
      $rootScope.detailView = req;
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'templates/detailRequest.html'
      })
      .then(function (ans) {
        // organize done & undone
        _.assign($scope, orgDoneData(
          applyDetailChange(type, ans, $scope.bloodReqs, $scope.reqsDone),
          'bloodreqs'));
        _.assign($rootScope, { bloodReqs: $scope.bloodReqs,
                               reqsDone: $scope.reqsDone });
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
  'segregateData', 'orgDoneData', 'applyDetailChange',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList,
            segregateData, orgDoneData, applyDetailChange) {
    $scope.donors = $rootScope.donors;
    $scope.donorsDone = $rootScope.donorsDone;
    $scope.loading = true;
    var index, elem, removed;

    // Update, check for any new data and fetch if available.
    getList('/donors').then(function (data) {
      _.assign($scope, orgDoneData(segregateData(data), 'donors'));
      _.assign($rootScope, { donors: $scope.donors,
                             donorsDone: $scope.donorsDone });
      $scope.loading = false;
    });

    // Initiate detail view of a list item
    $scope.detail = function (don, type) {
      $rootScope.detailView = don;
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'templates/detailDonor.html'
      })
      .then(function (ans) {
        // organize done & undone
        _.assign($scope, orgDoneData(
          applyDetailChange(type, ans, $scope.donors, $scope.donorsDone),
          'donors'));
        _.assign($rootScope, { donors: $scope.donors,
                               donorsDone: $scope.donorsDone });
      }, function () {
        // cancelled
      });
    };
  }
]);


/**
 * Camps Controller
 */
redDashboard.controller('CampsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  'segregateData', 'orgDoneData', 'applyDetailChange',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList,
            segregateData, orgDoneData, applyDetailChange) {
    $scope.camps = $rootScope.camps;
    $scope.campsDone = $rootScope.campsDone;
    $scope.loading = true;
    var index, elem, removed;

    // Get camps list
    getList('/camps').then(function (data) {
      _.assign($scope, orgDoneData(segregateData(data), 'camps'));
      _.assign($rootScope, { camps: $scope.camps,
                             campsDone: $scope.campsDone });
      $scope.loading = false;
    });

    $scope.detail = function (req, type) {
      $rootScope.detailView = req;
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'templates/detailCamp.html'
      })
      .then(function (ans) {
        _.assign($scope, orgDoneData(
          applyDetailChange(type, ans, $scope.camps, $scope.campsDone),
          'camps'));
        _.assign($rootScope, { camps: $scope.camps,
                               campsDone: $scope.campsDone });
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
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/profile', {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/requests', {
        templateUrl: 'templates/requests.html',
        controller: 'RequestsCtrl'
      })
      .when('/donors', {
        templateUrl: 'templates/donors.html',
        controller: 'DonorsCtrl'
      })
      .when('/camps', {
        templateUrl: 'templates/camps.html',
        controller: 'CampsCtrl'
      })
      .when('/create-camp', {
        templateUrl: 'templates/createCamp.html',
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


/**
 * Segregate the data received into done and undone.
 *
 * @param {Object} data
 *    Data to be segregated, like donors list.
 *
 * @return {Object}
 *    An object with arrays of done and undone data.
 */
redDashboard.factory('segregateData', function () {
  return function (data) {
    var index, elem, removed, item, itemDone;
    item = itemDone = [];
    index = _.findIndex(data, _.matchesProperty('done', true));
    while (index > -1) {
      elem = data.splice(index, 1);
      itemDone.push(elem[0]);
      index = _.findIndex(data, _.matchesProperty('done', true));
    }
    return {
      undone: data,
      done: itemDone
    };
  };
});


/**
 * Organize Done/Undone Data as per their context.
 *
 * @param {Object} data
 *    Segregated data from segregateData
 *
 * @param {String} context
 *    Context of the data.
 *
 * @return {Object}
 *    An object of data with proper contextual property name.
 */
redDashboard.factory('orgDoneData', function () {
  return function (data, context) {
    var result = {};
    switch (context) {
      case 'bloodreqs':
        result.bloodReqs = data.undone;
        result.reqsDone = data.done;
        break;

      case 'donors':
        result.donors = data.undone;
        result.donorsDone = data.done;
        break;

      case 'camps':
        result.camps = data.undone;
        result.campsDone = data.done;

      default:

    }
    return result;
  }
});


/**
 * Apply Detail View Change to the item.
 *
 * @param {String} type
 *    Type of change, 'done' or 'undone'.
 *
 * @param {Object} ans
 *    Object properties retrieved from the detail view.
 *
 * @param {Array} undone
 *    An array of undone items.
 *
 * @param {Array} done
 *    An array of done items.
 *
 * @return {Object}
 *    Object containing done and undone arrays.
 */
redDashboard.factory('applyDetailChange', ['indexOfId', function (indexOfId) {
  return function (type, ans, undone, done) {
    var index, removed;

    if (type == 'undone') {
      index = indexOfId(undone, ans.id);
      undone[index] = ans;
    } else if (type == 'done') {
      index = indexOfId(done, ans.id);
      done[index] = ans;
    }

    if (ans.done) {
      done.push(undone.splice(index, 1)[0]);
    } else {
      undone.push(done.splice(index, 1)[0]);
    }

    return {
      done: done,
      undone: undone
    }
  }
}]);


/**
 * Returns index of given id from a given list.
 *
 * @param {Array} list
 *    List of items.
 *
 * @param {Number} id
 *    ID value.
 *
 * @return {Number}
 *    Index of the item with the required id.
 */
redDashboard.factory('indexOfId', function () {
  return function (list, id) {
    return _.findIndex(list, _.matchesProperty('id', id));
  };
})
