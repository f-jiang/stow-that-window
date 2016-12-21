'use strict';

(function() {
  var app = angular.module('StowThatWindow', ['ngScrollbars', 'ngMaterial', 'ngAnimate']);
  var bg = chrome.extension.getBackgroundPage();

  app.config((ScrollBarsProvider) => {
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

  app.service('WindowManager', function($q) {
    var self = this;

    self.stowedWindows = bg.stowedWindows;

    self.findStowedWindowIndex = function(window) {
      return self.stowedWindows.findIndex((element) => {
        return element.id === window.id;
      });
    };

    self.allActiveWindows = function() {
      var deferred = $q.defer();

      chrome.windows.getAll({populate: false}, (windows) => {
        deferred.resolve(windows);
      });

      return deferred.promise;
    };

    self.currentActiveWindow = function() {
      var deferred = $q.defer();

      chrome.windows.getCurrent({populate: false}, (window) => {
        deferred.resolve(window);
      });

      return deferred.promise;
    };

    self.stowActive = function(window) {
      $q.all([
          self.allActiveWindows(), self.currentActiveWindow()
      ]).then((results) => {
        let all = results[0];
        let current = results[1];

        if (all.length === 1) {
          chrome.windows.create({'state': 'maximized'}, bg.stowWindow(current.id));
        } else if (window === self.allActiveWindows) {
          chrome.storage.sync.get('excludeCurrent', (items) => {
            for (let i = 0; i < all.length; i++) {
              if (!items.excludeCurrent || (!all[i].focused && all[i].id !== current.id)) {
                bg.stowWindow(all[i].id);
              }
            }

            if (!items.excludeCurrent) {
              chrome.windows.create({'state': 'maximized'});
            }
          });
        } else if (window === self.currentActiveWindow) {
          bg.stowWindow(current.id);
        } else if (window.constructor === Array || window.length) {
          for (let i = 0; i < window.length; i++) {
            bg.stowWindow(window[i].id);
          }
        } else {
          bg.stowWindow(window.id);
        }
      });
    };

    self.restoreStowed = function(window) {
      var index;

      if (window.constructor === Array || window.length) {
        for (let i = 0, j = window.length; i < j; i++) {
          index = self.findStowedWindowIndex(window[0]);

          if (index !== -1) {
            bg.unstowWindow(index);
          }
        }
      } else {
        chrome.storage.sync.get('autoStow', (items) => {
          index = self.findStowedWindowIndex(window);

          if (items.autoStow) {
            self.currentActiveWindow().then((current) => {
              bg.unstowWindow(index, () => {
                bg.stowWindow(current.id);
              });
            });
          } else {
            bg.unstowWindow(index);
          }
        });
      }
    };

    self.removeStowed = function(window) {
      var index;

      if (window.constructor === Array || window.length) {
        for (let i = 0, j = window.length; i < j; i++) {
          index = self.findStowedWindowIndex(window[0]);

          if (index !== -1) {
            bg.removeWindow(index);
          }
        }
      } else {
        index = self.findStowedWindowIndex(window);
        bg.removeWindow(index);
      }
    };
  });

  app.controller('WindowController', function($scope, WindowManager) {
    $scope.stowedWindows = WindowManager.stowedWindows;
    $scope.$watchCollection('stowedWindows', () => { });

    $scope.stowCurrentWindow = function() {
      WindowManager.stowActive(WindowManager.currentActiveWindow);
    };
    $scope.stowAllWindows = function() {
      WindowManager.stowActive(WindowManager.allActiveWindows);
    };

    $scope.restoreWindow = function(index) {
      WindowManager.restoreStowed($scope.stowedWindows[index]);
    };
    $scope.restoreAllWindows = function() {
      WindowManager.restoreStowed($scope.stowedWindows);
    };

    $scope.removeWindow = function(index) {
      WindowManager.removeStowed($scope.stowedWindows[index]);
    };
    $scope.removeAllWindows = function() {
      WindowManager.removeStowed($scope.stowedWindows);
    };

    $scope.openOptions = chrome.runtime.openOptionsPage;
  });
})();
