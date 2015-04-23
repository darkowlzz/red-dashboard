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
 * Query data from the db.
 *
 * @param {Object} data
 *    Query attributes
 *    {
 *      collection: '',
 *      qGroup: '',
 *      qPlace: '',
 *      qDate: '',
 *      ...
 *    }
 *
 * @return {Promise}
 *    Returns a promise object with query results when the query is completed.
 */
redDashboard.factory('queryData', ['$http', function ($http) {
  return function (data) {
    var promise = $http.post('/api/data', data).
                    then(function (resp) {
                      return resp.data;
                    });
    return promise;
  }
}]);


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


/**
 * Delete item
 *
 * @param {String} collectionName
 *    Name of the collection the item belongs to.
 *
 * @param {Object} data
 *    Object with properties to identify the item to be deleted.
 *
 * @return {Promise}
 *    Returns a promise which is completed when the item is deleted.
 */
redDashboard.factory('deleteItem', ['$http', function ($http) {
  return function (collectionName, data) {
    var promise = $http.post('/api/delete/' + collectionName, data)
                       .then(function (resp) {
                         return resp.data;
                       });
    return promise;
  };
}]);


/**
 * Authentication Interceptor: Intercepts httpProvider to include auth headers
 * in every request.
 */
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


/**
 * Delete item from done/undone list.
 *
 * @param {Number} id
 *    id of the item to be deleted.
 *
 * @param {String} type
 *    Type of the list ('done'/'undone')
 *
 * @param {Object} undone
 *    Undone list
 *
 * @param {Object} done
 *    Done list
 *
 * @return {Object}
 *    Returns the lists after performing deletion.
 *    {
 *      done: [],
 *      undone: []
 *    }
 */
redDashboard.factory('deleteFromList', ['indexOfId', function (indexOfId) {
  return function (id, type, undone, done) {
    var targetList, index;
    if (type == 'undone') {
      targetList = undone;
    } else if (type == 'done') {
      targetList = done;
    }
    index = indexOfId(targetList, id);
    targetList.splice(index, 1);
    return {
      done: done,
      undone: undone
    };
  }
}]);
