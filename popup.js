var app = angular.module('StowThatWindow', ['ngMaterial']);
var bg = chrome.extension.getBackgroundPage();

app.controller('WindowController', function($scope) {
    $scope.windows = bg.stowedWindows;
    
    $scope.stowCurrentWindow = function() {
		chrome.windows.getCurrent({populate: /*false*/true}, function(window) {
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
		chrome.windows.getCurrent({populate: false}, function(window) {
    		bg.unstowWindow(index, function() {
				bg.stowWindow(window.id);
			});
		});
	};

	$scope.removeWindow = bg.removeWindow;
});
