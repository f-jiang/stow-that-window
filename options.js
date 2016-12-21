'use strict';

(function() {
  // restore options
  document.addEventListener('DOMContentLoaded', () => {
    $.getJSON('defaultOptions.json', (data) => {
      chrome.storage.sync.get(data, (items) => {
        document.getElementById('auto-stow').checked = items.autoStow;
        document.getElementById('exclude-current').checked = items.excludeCurrent;
      });
    });
  });

  // save options
  document.getElementById('save').addEventListener('click', () => {
    chrome.storage.sync.set({
      autoStow: document.getElementById('auto-stow').checked,
      excludeCurrent: document.getElementById('exclude-current').checked
    }, () => {
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    });
  });
})();
