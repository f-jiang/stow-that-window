var app = angular.module('StowThatWindow', ['ngScrollbars', 'ngMaterial', 'ngAnimate']);
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

app.service('WindowManager', function() {
  this.stowedWindows = bg.stowedWindows;

  this.stowCurrentWindow = function() {
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

  this.stowAllWindows = function() {
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

  this.restoreWindow = function(index) {
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

  this.restoreAllWindows = function() {
    for (i = 0, l = this.stowedWindows.length; i < l; i++) {
      bg.unstowWindow(0);
    }
  };

  this.removeWindow = function(index) {
    bg.removeWindow(index);
  };

  this.removeAllWindows = function() {
    for (i = 0, l = this.stowedWindows.length; i < l; i++) {
      bg.removeWindow(0);
    }
  };
});

app.controller('WindowController', function($scope, WindowManager) {
  $scope.stowedWindows = WindowManager.stowedWindows;
  $scope.$watchCollection('stowedWindows', function() { });

  $scope.stowCurrentWindow = WindowManager.stowCurrentWindow;
  $scope.restoreWindow = WindowManager.restoreWindow;
  $scope.removeWindow = WindowManager.removeWindow;
  $scope.stowAllWindows = WindowManager.stowAllWindows;
  $scope.restoreAllWindows = WindowManager.restoreAllWindows;
  $scope.removeAllWindows = WindowManager.removeAllWindows;
  $scope.openOptions = chrome.runtime.openOptionsPage;
});
