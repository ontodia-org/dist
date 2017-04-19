"use strict";
function onPageLoad(callback) {
    document.addEventListener('DOMContentLoaded', function () {
        var container = document.createElement('div');
        container.id = 'root';
        document.body.appendChild(container);
        callback(container);
    });
}
exports.onPageLoad = onPageLoad;
function tryLoadLayoutFromLocalStorage() {
    if (window.location.hash.length > 1) {
        try {
            var key = window.location.hash.substring(1);
            var unparsedLayout = localStorage.getItem(key);
            return unparsedLayout && JSON.parse(unparsedLayout);
        }
        catch (e) { }
    }
    return undefined;
}
exports.tryLoadLayoutFromLocalStorage = tryLoadLayoutFromLocalStorage;
function saveLayoutToLocalStorage(layout) {
    var randomKey = Math.floor((1 + Math.random()) * 0x10000000000)
        .toString(16).substring(1);
    localStorage.setItem(randomKey, JSON.stringify(layout));
    return randomKey;
}
exports.saveLayoutToLocalStorage = saveLayoutToLocalStorage;
