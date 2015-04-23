// Directives
// ==================================================

// Card for 'done' item
redDashboard.directive('cardDone', function () {
  return {
    restrict: 'E',
    templateUrl: 'templates/cardDone.html'
  };
});

// Card for 'undone' item
redDashboard.directive('cardUndone', function () {
  return {
    restrict: 'E',
    templateUrl: 'templates/cardUndone.html'
  };
});


// Stop event propagation from child to parent.
redDashboard.directive('stopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind('click', function (e) {
        e.stopPropagation();
      });
    }
  };
});
