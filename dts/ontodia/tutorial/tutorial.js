"use strict";
var intro_js_1 = require("intro.js");
var helpAlreadySeenKey = 'helpPopupDisable';
function showTutorial() {
    intro_js_1.introJs()
        .setOption('showStepNumbers', false)
        .onexit(function () {
        localStorage.setItem(helpAlreadySeenKey, 'true');
    }).oncomplete(function () {
        localStorage.setItem(helpAlreadySeenKey, 'true');
    }).start();
}
exports.showTutorial = showTutorial;
function showTutorialIfNotSeen() {
    if (!localStorage.getItem(helpAlreadySeenKey)) {
        showTutorial();
    }
}
exports.showTutorialIfNotSeen = showTutorialIfNotSeen;
