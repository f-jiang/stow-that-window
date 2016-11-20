'use strict';

function saveOptions() {
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
}

function restoreOptions() {
  $.getJSON('defaultOptions.json', function(data) {
    chrome.storage.sync.get(data, function(items) {
      document.getElementById('auto-stow').checked = items.autoStow;
      document.getElementById('exclude-current').checked = items.excludeCurrent;
    });
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
