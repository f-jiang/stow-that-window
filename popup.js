var app = angular.module('StowThatWindow', ['ngScrollbars', 'ngMaterial']);
var bg = chrome.extension.getBackgroundPage();

// temp
var sites = [
  'https://www.google.ca/#gfe_rd=cr',
  'http://www.canadacomputers.com/',
  'https://www.youtube.com/',
  'http://www.newegg.ca/',
  'http://www.ncix.com/',
  'https://www.nzxt.com/',
  'http://www.razerzone.com/',
  'https://steelseries.com/',
  'https://mechanicalkeyboards.com/'
];

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
  // temp
  $scope.openWindows = function(n) {
    for (i = 0; i < n; i++) {
      var urls = [];
      for (j = 0; j < Math.round(Math.random() * sites.length); j++) {
        urls.push(sites[j]);
      }
      chrome.windows.create({url: urls});
    }
  };

  // temp
  document.onkeydown = function(e) {
    if (e.keyCode === 16) {
      $scope.openWindows(5);
    }
  };

  $scope.windows = bg.stowedWindows;
  $scope.$watchCollection('windows', function() { });

  $scope.stowCurrentWindow = function() {
    chrome.windows.getCurrent({populate: false}, function(window) {
      bg.stowWindow(window.id, function() {
        chrome.windows.getAll({populate: false}, function(windows) {
          if (windows.length <= 1) {
            chrome.windows.create();
          }
        });
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
    chrome.windows.getAll({populate: false}, function(windows) {
      chrome.storage.sync.get('excludeCurrent', function(items) {
        for (i = 0; i < windows.length; i++) {
          console.log('info:', windows[i].focused, windows[i].id);
          console.log('windows', $scope.windows);

          if (items.excludeCurrent && windows[i].focused) {
            continue;
          }

          bg.stowWindow(windows[i].id);
        }

        if (!items.excludeCurrent) {
          chrome.windows.create();
        }
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
