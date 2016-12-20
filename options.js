'use strict';

(function() {
  // restore options
  document.addEventListener('DOMContentLoaded', function() {
    $.getJSON('defaultOptions.json', function(data) {
      chrome.storage.sync.get(data, function(items) {
        document.getElementById('auto-stow').checked = items.autoStow;
        document.getElementById('exclude-current').checked = items.excludeCurrent;
      });
    });
  });

  // save options
  document.getElementById('save').addEventListener('click', function() {
    chrome.storage.sync.set({
      autoStow: document.getElementById('auto-stow').checked,
      excludeCurrent: document.getElementById('exclude-current').checked
    }, function() {
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  });
})();
