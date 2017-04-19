"use strict";
function isIE11() {
    return !(window.ActiveXObject) && 'ActiveXObject' in window;
}
exports.isIE11 = isIE11;
