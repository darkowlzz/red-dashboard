var redDashboard = angular.module('redDashboard', [
                              'ngRoute', 'ngMaterial', 'ngMdIcons'
                              ]);


// Controllers
// ============================================================

redDashboard.controller('MainCtrl', [
  '$scope', '$rootScope', '$route', '$routeParams',
  '$location', '$mdMedia', '$mdSidenav', '$window',
  function ($scope, $rootScope, $route, $routeParams,
            $location, $mdMedia, $mdSidenav, $window) {

    /**
     * Goes to the given path
     *
     * @param {String} path
     *    Navigation path, applied to the page url.
     * @param {String} sectionName
     *    Title of the Nav section, used in the page header.
     */
    $rootScope.go = $scope.go = function (path, sectionName) {
      $location.url(path);
      $scope.currentSection = sectionName;

      if ($mdMedia('sm')) {
        $scope.toggleSidebar();
      }
    };

    // Check if the session is logged in
    $rootScope.isLoggedIn = $scope.isLoggedIn = function () {
      if ($window.sessionStorage.token) {
        return true;
      } else {
        return false;
      }
    };

    // Initialize data
    $rootScope.init = function (user) {
      $scope.username = user.first_name;
    }

    // Reset all the data
    $rootScope.reset = function () {
      $rootScope.username = '';
      $rootScope.bloodReqs = [];
      $rootScope.reqsDone = [];
      $rootScope.donors = [];
      $rootScope.donorsDone = [];
      $rootScope.camps = [];
      $rootScope.campsDone = [];
      $rootScope.stats = {
        camps: 0,
        campsDone: 0,
        bloodReqs: 0,
        bloodReqsDone: 0,
        donors: 0,
        donorsDone: 0
      };
      $rootScope.data = {
        collection: null,
        //qTerm: '',
        qGroup: null, qPlace: '', qDay: null, qMonth: null, qYear: null,
        resultCollection: null,
        resultData: [],
        primaryProp: null,
        secondaryProp: null,
        advancedSearch: false
      }
    }

    $rootScope.reset();
    if ($window.sessionStorage.token) {
      console.log('session', $window.sessionStorage.token);
    } else {
      console.log('resetting');
      $rootScope.loggedIn = false;
    }

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
  '$scope', '$rootScope', '$routeParams', '$http', 'getList',
  function ($scope, $rootScope, $routeParams, $http, getList) {
    $scope.stats = $rootScope.stats;

    getList('/api/stats/bloodreqs').then(function (data) {
      $rootScope.stats.bloodReqs = $scope.stats.bloodReqs = data.count;
    });

    getList('/api/stats/bloodreqs/done').then(function (data) {
      $rootScope.stats.bloodReqsDone = $scope.stats.bloodReqsDone = data.count;
    });

    getList('/api/stats/donors').then(function (data) {
      $rootScope.stats.donors = $scope.stats.donors = data.count;
    });

    getList('/api/stats/donors/done').then(function (data) {
      $rootScope.stats.donorsDone = $scope.stats.donorsDone = data.count;
    });

    getList('/api/stats/camps').then(function (data) {
      $rootScope.stats.camps = $scope.stats.camps = data.count;
    });

    getList('/api/stats/camps/done').then(function (data) {
      $rootScope.stats.campsDone = $scope.stats.campsDone = data.count;
    });
  }
]);


/**
 * Profile Controller
 */
redDashboard.controller('ProfileCtrl', [
  '$scope', '$rootScope', '$routeParams',
  function ($scope, $rootScope, $routeParams) {
    if (! $rootScope.isLoggedIn()) {
      $rootScope.go('/login');
    }
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
      done('/api/request/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else if (context == 'donor') {
      // it is blood donor
      done('/api/donor/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else if (context == 'camp') {
      done('/api/camp/done', data).then(function (resp) {
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
      undone('/api/request/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else if (context == 'donor') {
      // it is blood donor
      undone('/api/donor/done', data).then(function (resp) {
        $mdDialog.hide(resp);
        $scope.loading = false;
      });
    } else if (context == 'camp') {
      undone('/api/camp/done', data).then(function (resp) {
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
    $scope.undone = $rootScope.bloodReqs;
    $scope.done = $rootScope.reqsDone = [];
    $scope.loading = true;

    // Properties to be displayed in brief
    $scope.primaryProp = 'name';
    $scope.secondaryProp = 'group';
    $scope.type = 'person'; // type of icons

    var index, elem, removed;

    // Get blood request list
    getList('/api/bloodreqs/pending').then(function (data) {
      $rootScope.bloodReqs = $scope.undone = data;
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
          applyDetailChange(type, ans, $scope.undone, $scope.done),
          'bloodreqs'));
        _.assign($rootScope, { bloodReqs: $scope.undone,
                               reqsDone: $scope.done });
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
    $scope.undone = $rootScope.donors;
    $scope.done = $rootScope.donorsDone = [];
    $scope.loading = true;

    // Properties to be displayed in breif
    $scope.primaryProp = 'name';
    $scope.secondaryProp = 'group';
    $scope.type = 'person'; // type of icons

    var index, elem, removed;

    // Update, check for any new data and fetch if available.
    getList('/api/donors/pending').then(function (data) {
      $rootScope.donors = $scope.undone = data;
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
          applyDetailChange(type, ans, $scope.undone, $scope.done),
          'donors'));
        _.assign($rootScope, { donors: $scope.undone,
                               donorsDone: $scope.done });
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
    $scope.undone = $rootScope.camps;
    $scope.done = $rootScope.campsDone = [];
    $scope.loading = true;

    // Properties to be displayed in brief
    $scope.primaryProp = 'title';
    $scope.secondaryProp = 'location';
    $scope.type = 'camp'; // type of icons

    var index, elem, removed;

    // Get camps list
    getList('/api/camps/pending').then(function (data) {
      $scope.undone = $rootScope.camps = data;
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
          applyDetailChange(type, ans, $scope.undone, $scope.done),
          'camps'));
        _.assign($rootScope, { camps: $scope.undone,
                               campsDone: $scope.done });
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
  '$scope', '$rootScope', '$routeParams', 'submitCamp',
  function ($scope, $rootScope, $routeParams, submitCamp) {

    if (! $rootScope.isLoggedIn()) {
      $rootScope.go('/login');
    }

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
        submitCamp('/api/camp/new', $scope.camp).then(function (resp) {
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


/**
 * Data Controller
 */
redDashboard.controller('DataCtrl', [
  '$scope', '$rootScope', '$routeParams', 'queryData',
  function ($scope, $rootScope, $routeParams, queryData) {

    if (! $rootScope.isLoggedIn()) {
      $rootScope.go('/login');
    }

    $scope.collection = $rootScope.data.collection;
    //$scope.qTerm = $rootScope.data.qTerm;
    $scope.qGroup = $rootScope.data.qGroup;
    $scope.qPlace = $rootScope.data.qPlace;
    $scope.resultCollection = $rootScope.data.resultCollection;
    $scope.resultData = $rootScope.data.resultData;
    $scope.primaryProp = $rootScope.data.primaryProp;
    $scope.secondaryProp = $rootScope.data.secondaryProp;
    $scope.advancedSearch = $rootScope.data.advancedSearch;

    $scope.groups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'];

    // Returns true if the group option has to be disabled
    $scope.isCampsEnabled = function () {
      if ($scope.collection == 'camps') {
        $scope.qGroup = $rootScope.data.qGroup = null;
        return true;
      } else {
        $scope.qDay = $rootScope.data.qDay = null;
        $scope.qMonth = $rootScope.data.qMonth = null;
        $scope.qYear = $rootScope.data.qYear = null;
        return false;
      }
    };

    // Toggle advanced search options
    $scope.toggleAdvSearch = function () {
      $rootScope.data.advancedSearch
        = $scope.advancedSearch = ! $scope.advancedSearch;
    };

    $scope.search = function () {
      if ($scope.collection) {
        var queryObj = {collection: $scope.collection};

        /*
        if ($scope.qTerm != null) {
          queryObj.qTerm = $scope.qTerm;
        }
        */

        if (($scope.qGroup != null) && ($scope.qGroup != 'All') &&
            ($scope.advancedSearch)) {
          queryObj.qGroup = $scope.qGroup;
        }

        if (($scope.qPlace != '') && ($scope.advancedSearch)) {
          queryObj.qPlace = $scope.qPlace;
        }

        if (($scope.qDay != null) && ($scope.qMonth != null) &&
            ($scope.qYear != null) && ($scope.advancedSearch)) {
          queryObj.qDate = new Date($scope.qYear, $scope.qMonth - 1,
                                    $scope.qDay);
        }

        queryData(queryObj).
          then(function (data) {
            $rootScope.data.resultData = $scope.resultData = data;
            $rootScope.data.resultCollection = $scope.resultCollection
              = $rootScope.data.collection = $scope.collection;
            $rootScope.data.qTerm = $scope.qTerm;

            switch ($scope.resultCollection) {
              case 'bloodReqs':

              case 'donors':
                $rootScope.data.primaryProp = $scope.primaryProp = 'name';
                $rootScope.data.secondaryProp = $scope.secondaryProp = 'group';
                break;

              case 'camps':
                $rootScope.data.primaryProp = $scope.primaryProp = 'title';
                $rootScope.data.secondaryProp
                  = $scope.secondaryProp = 'address';
                break;

              default:

            }
          });
      } else {
        console.log('collection is null');
      }
    }
  }
]);


/**
 * User Controller
 */
redDashboard.controller('UserCtrl', [
  '$scope', '$rootScope', '$http', '$window',
  function ($scope, $rootScope, $http, $window) {
    $rootScope.reset();
    delete $window.sessionStorage.token;
    $scope.user = {username: 'john.doe', password: 'foobar'};
    $scope.message = '';
    $scope.submit = function () {
      console.log('sending data');
      $http.post('/authenticate', $scope.user)
           .success(function (data, status, headers, config) {
             console.log('got reply', data);
             $window.sessionStorage.token = data.token;
             $rootScope.init(data.user);
             $window.history.back();
           })
           .error(function (data, status, headers, config) {
            delete $window.sessionStorage.token;

            $scope.message = 'Error: Invalid user or password';
           });
    };
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


redDashboard.factory('queryData', ['$http',
  function ($http) {
    return function (data) {
      var promise = $http.post('/api/data', data).
                      then(function (resp) {
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
redDashboard.factory('getList', ['$http', '$rootScope',
  function ($http, $rootScope) {
    return function (uri) {
      var promise = $http.get(uri).then(function (resp) {
        return resp.data;
      }, function (err) {
        console.log('failed to fetch', err);
        $rootScope.reset();

        $rootScope.go('/login');
      });
      return promise;
    };
  }
]);


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
});


redDashboard.factory('authInterceptor', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401) {

      }
      return response || $q.when(response);
    }
  }
});


redDashboard.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});


redDashboard.directive('cardDone', function () {
  return {
    restrict: 'E',
    templateUrl: 'templates/cardDone.html'
  };
});


redDashboard.directive('cardUndone', function () {
  return {
    restrict: 'E',
    templateUrl: 'templates/cardUndone.html'
  };
});
