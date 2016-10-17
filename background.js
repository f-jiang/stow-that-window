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
    type: window.type,
    state: window.state
  };

  if (window.state !== 'maximized') {
    createData.width = window.width;
    createData.height = window.height;
    createData.left = window.left;
    createData.top = window.top;
  }

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

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    $.getJSON('defaultOptions.json', function(data) {
      chrome.storage.sync.set(data);
    });
  }
});
