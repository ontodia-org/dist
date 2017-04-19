"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var CLASS_NAME = 'ontodia-spinner';
var Spinner = (function (_super) {
    __extends(Spinner, _super);
    function Spinner() {
        return _super.apply(this, arguments) || this;
    }
    Spinner.prototype.render = function () {
        var _a = this.props, _b = _a.position, position = _b === void 0 ? { x: 0, y: 0 } : _b, _c = _a.size, size = _c === void 0 ? 50 : _c, statusText = _a.statusText, errorOccured = _a.errorOccured;
        var textLeftMargin = 5;
        var pathGeometry = 'm3.47,-19.7 a20,20 0 1,1 -6.95,0 m0,0 l-6,5 m6,-5 l-8,-0' +
            (errorOccured ? 'M-8,-8L8,8M-8,8L8,-8' : '');
        return React.createElement("g", { className: CLASS_NAME, "data-error": errorOccured, transform: "translate(" + position.x + "," + position.y + ")" },
            React.createElement("g", { className: CLASS_NAME + "__arrow" },
                React.createElement("path", { d: pathGeometry, transform: "scale(0.02)scale(" + size + ")", fill: 'none', stroke: errorOccured ? 'red' : 'black', strokeWidth: '3', strokeLinecap: 'round' })),
            React.createElement("text", { style: { dominantBaseline: 'middle' }, x: size / 2 + textLeftMargin }, statusText));
    };
    return Spinner;
}(React.Component));
exports.Spinner = Spinner;
