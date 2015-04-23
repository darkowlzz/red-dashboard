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
 * Confirm delete dialog box
 */
function confirmDelete ($mdDialog, ev) {
  return $mdDialog.confirm()
    //.parent(angular.element(document.body)); // `parent` is undefined
    .title('Delete confirmation')
    .content('Would you like to delete this item?')
    .ariaLabel('delete confirmation')
    .ok('Yes, Delete it')
    .cancel('Cancel')
    .targetEvent(ev);
}


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
  'segregateData', 'orgDoneData', 'applyDetailChange', 'deleteItem',
  'deleteFromList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList,
            segregateData, orgDoneData, applyDetailChange, deleteItem,
            deleteFromList) {
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

    // Delete an item
    $scope.delete = function (ev, id, type) {
      $mdDialog.show(confirmDelete($mdDialog, ev)).then(function () {
        deleteItem('request', { id: id }).then(function (resp) {
          _.assign($scope,
                   deleteFromList(id, type, $scope.undone, $scope.done));
        });
      }, function () {
        console.log('cancelled delete');
      });
    };
  }
]);


/**
 * Donors Controller
 */
redDashboard.controller('DonorsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  'segregateData', 'orgDoneData', 'applyDetailChange', 'deleteItem',
  'deleteFromList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList,
            segregateData, orgDoneData, applyDetailChange, deleteItem,
            deleteFromList) {
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

    // Delete an item
    $scope.delete = function (ev, id, type) {
      $mdDialog.show(confirmDelete($mdDialog, ev)).then(function () {
        deleteItem('donor', { id: id }).then(function (resp) {
          _.assign($scope,
                   deleteFromList(id, type, $scope.undone, $scope.done));
        });
      }, function () {
        console.log('cancelled delete');
      });
    };
  }
]);


/**
 * Camps Controller
 */
redDashboard.controller('CampsCtrl', [
  '$scope', '$rootScope', '$routeParams', '$http', '$mdDialog', 'getList',
  'segregateData', 'orgDoneData', 'applyDetailChange', 'deleteItem',
  'deleteFromList',
  function ($scope, $rootScope, $routeParams, $http, $mdDialog, getList,
            segregateData, orgDoneData, applyDetailChange, deleteItem,
            deleteFromList) {
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

    // Delete an item
    $scope.delete = function (ev, id, type) {
      $mdDialog.show(confirmDelete($mdDialog, ev)).then(function () {
        deleteItem('camp', { id: id }).then(function (resp) {
          _.assign($scope,
                   deleteFromList(id, type, $scope.undone, $scope.done));
        });
      }, function () {
        console.log('cancelled delete');
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
      $http.post('/authenticate', $scope.user)
           .success(function (data, status, headers, config) {
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

