var app = angular.module('StowThatWindow', ['ngMaterial']);
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
	$scope.updateConfig = function() {
		chrome.storage.sync.get(null, function(items) {
			$scope.autoStow = items.autoStow;
			$scope.remember = items.remember;
			$scope.excludeCurrent = items.excludeCurrent;
		});
	};

	$scope.windows = bg.stowedWindows;
    
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
		chrome.storage.sync.get('autoStow', function(items) {
			if (items.autoStow) {
				chrome.windows.getCurrent({populate: false}, function(window) {
					for (i = 0, l = $scope.windows.length; i < l - 1; i++) {
						bg.unstowWindow(0);
					}

					bg.unstowWindow(0, function() {
						bg.stowWindow(window.id);
					});
				});
			} else {
				for (i = 0, l = $scope.windows.length; i < l; i++) {
					bg.unstowWindow(0);
				}
			}
		});
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
