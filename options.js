function saveOptions() {
    chrome.storage.sync.set({
        autoStow: document.getElementById('auto-stow').checked,
        remember: document.getElementById('remember').checked,
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
    chrome.storage.sync.get({
        autoStow: false,
        remember: true,
        excludeCurrent: true
    }, function(items) {
        document.getElementById('auto-stow').checked = items.autoStow;
        document.getElementById('remember').checked = items.remember;
        document.getElementById('exclude-current').checked = items.excludeCurrent;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
