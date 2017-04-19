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
var React = require("react");
var draggableHandle_1 = require("./draggableHandle");
var CLASS_NAME = 'ontodia-accordion-item';
var AccordionItem = (function (_super) {
    __extends(AccordionItem, _super);
    function AccordionItem() {
        return _super.apply(this, arguments) || this;
    }
    Object.defineProperty(AccordionItem.prototype, "element", {
        get: function () { return this._element; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AccordionItem.prototype, "header", {
        get: function () { return this._header; },
        enumerable: true,
        configurable: true
    });
    AccordionItem.prototype.render = function () {
        var _this = this;
        var _a = this.props, heading = _a.heading, bodyClassName = _a.bodyClassName, children = _a.children, tutorialProps = _a.tutorialProps, bodyRef = _a.bodyRef, collapsed = _a.collapsed, height = _a.height, onBeginDragHandle = _a.onBeginDragHandle, onDragHandle = _a.onDragHandle, onEndDragHandle = _a.onEndDragHandle;
        var shouldRenderHandle = onBeginDragHandle && onDragHandle && onEndDragHandle;
        return React.createElement("div", __assign({ className: CLASS_NAME + " " + CLASS_NAME + "--" + (collapsed ? 'collapsed' : 'expanded'), ref: function (element) { return _this._element = element; }, style: { height: height } }, tutorialProps),
            React.createElement("div", { className: CLASS_NAME + "__inner" },
                React.createElement("div", { className: CLASS_NAME + "__header", ref: function (header) { return _this._header = header; }, onClick: function () { return _this.props.onChangeCollapsed(!collapsed); } }, heading),
                React.createElement("div", { className: CLASS_NAME + "__body" }, children ? children :
                    React.createElement("div", { ref: bodyRef, className: "" + (bodyClassName || '') }))),
            shouldRenderHandle ? React.createElement(draggableHandle_1.DraggableHandle, { className: CLASS_NAME + "__handle", onBeginDragHandle: function (e) { return onBeginDragHandle(); }, onDragHandle: function (e, x, y) { return onDragHandle(x, y); }, onEndDragHandle: function (e) { return onEndDragHandle(); } }) : null);
    };
    return AccordionItem;
}(React.Component));
exports.AccordionItem = AccordionItem;
