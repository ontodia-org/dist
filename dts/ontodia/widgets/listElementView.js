"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var React = require("react");
var d3_color_1 = require("d3-color");
var CLASS_NAME = 'ontodia-list-element-view';
var ListElementView = (function (_super) {
    __extends(ListElementView, _super);
    function ListElementView() {
        return _super.apply(this, arguments) || this;
    }
    ListElementView.prototype.render = function () {
        var _a = this.props, view = _a.view, model = _a.model, selected = _a.selected, disabled = _a.disabled, otherProps = __rest(_a, ["view", "model", "selected", "disabled"]);
        var _b = view.getTypeStyle(model.types).color, h = _b.h, c = _b.c, l = _b.l;
        var frontColor = (selected && !disabled) ? d3_color_1.hcl(h, c, l * 1.2) : d3_color_1.hcl('white');
        var disabledClass = disabled ? CLASS_NAME + "--disabled" : '';
        var className = CLASS_NAME + " " + disabledClass + " " + (otherProps.className || '');
        return React.createElement("li", __assign({}, otherProps, { className: className, draggable: !disabled, title: "Classes: " + view.getElementTypeString(model), style: { background: d3_color_1.hcl(h, c, l) } }),
            React.createElement("div", { className: CLASS_NAME + "__label", style: { background: frontColor } }, view.getLocalizedText(model.label.values).text));
    };
    return ListElementView;
}(React.Component));
exports.ListElementView = ListElementView;
