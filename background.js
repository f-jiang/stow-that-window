var stowedWindows = [];

var stowWindow = function(id, callback) {
    chrome.windows.get(id, {populate: true}, function(window) {
		stowedWindows.push(window);

		if (!callback) {
			chrome.windows.remove(id);
		} else {
			chrome.windows.remove(id, callback);
		}
    });
};

var unstowWindow = function(index, callback) {
    var window = stowedWindows[index];
    var createData = {
        focused: window.focused,
        width: window.width,
        height: window.height,
        left: window.left,
        top: window.top,
        state: window.state,
        type: window.type
    };

    var len = window.tabs.length;
    if (len === 1) {
        createData.url = window.tabs[0].url;
    } else {
        createData.url = [];
        for (i = 0; i < len; i++) {
            createData.url.push(window.tabs[i].url);
        }
    }

    removeWindow(index);

    if (!callback) {
        chrome.windows.create(createData);
    } else {
        chrome.windows.create(createData, callback);
    }
};

var removeWindow = function(index) {
    stowedWindows.splice(index, 1);
};