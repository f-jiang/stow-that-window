var app = angular.module('StowThatWindow', ['ngScrollbars', 'ngMaterial']);
var bg = chrome.extension.getBackgroundPage();

app.config(function(ScrollBarsProvider) {
  ScrollBarsProvider.defaults = {
    setHeight: 100,
    scrollInertia: 500,
    axis: 'y',
    advanced: {
      updateOnContentResize: true
    },
    theme: 'minimal-dark'
  };
});

app.controller('WindowController', function($scope) {
  $scope.windows = bg.stowedWindows;
  $scope.$watchCollection('windows', function() { });

  $scope.stowCurrentWindow = function() {
    chrome.windows.getCurrent({populate: false}, function(window) {
      chrome.windows.getAll({populate: false}, function(windows) {
        if (windows.length === 1) {
          chrome.windows.create({'state': 'maximized'}, bg.stowWindow(window.id));
        } else {
          bg.stowWindow(window.id);
        }
      });
    });
  };

  $scope.restoreWindow = function(index) {
    chrome.storage.sync.get('autoStow', function(items) {
      if (items.autoStow) {
        chrome.windows.getCurrent({populate: false}, function(window) {
          bg.unstowWindow(index, function() {
            bg.stowWindow(window.id);
          });
        });
      } else {
        bg.unstowWindow(index);
      }
    });
  };

  $scope.removeWindow = bg.removeWindow;

  $scope.stowAllWindows = function() {
    chrome.windows.getCurrent({populate: false}, function(window) {
      chrome.windows.getAll({populate: false}, function(windows) {
        chrome.storage.sync.get('excludeCurrent', function(items) {
          if (windows.length > 1) {
            for (i = 0; i < windows.length; i++) {
              if (items.excludeCurrent && (windows[i].focused || windows[i].id === window.id)) {
                continue;
              }

              bg.stowWindow(windows[i].id);
            }

            if (!items.excludeCurrent) {
              chrome.windows.create({'state': 'maximized'});
            }
          } else {
            chrome.windows.create({'state': 'maximized'}, bg.stowWindow(window.id));
          }
        });
      });
    });
  };

  $scope.restoreAllWindows = function() {
    for (i = 0, l = $scope.windows.length; i < l; i++) {
      bg.unstowWindow(0);
    }
  };

  $scope.removeAllWindows = function() {
    for (i = 0, l = $scope.windows.length; i < l; i++) {
      bg.removeWindow(0);
    }
  };

  $scope.openOptions = function() {
    chrome.runtime.openOptionsPage();
  };
});
