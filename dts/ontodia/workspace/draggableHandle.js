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
var DraggableHandle = (function (_super) {
    __extends(DraggableHandle, _super);
    function DraggableHandle() {
        var _this = _super.apply(this, arguments) || this;
        _this.isHoldingMouse = false;
        _this.onHandleMouseDown = function (e) {
            if (e.target !== e.currentTarget) {
                return;
            }
            if (_this.isHoldingMouse) {
                return;
            }
            var LEFT_BUTTON = 0;
            if (e.button !== LEFT_BUTTON) {
                return;
            }
            _this.isHoldingMouse = true;
            _this.originPageX = e.pageX;
            _this.originPageY = e.pageY;
            document.addEventListener('mousemove', _this.onMouseMove);
            document.addEventListener('mouseup', _this.onMouseUp);
            _this.props.onBeginDragHandle(e);
        };
        _this.onMouseMove = function (e) {
            if (!_this.isHoldingMouse) {
                return;
            }
            e.preventDefault();
            _this.props.onDragHandle(e, e.pageX - _this.originPageX, e.pageY - _this.originPageY);
        };
        _this.onMouseUp = function (e) {
            _this.removeListeners();
            if (_this.props.onEndDragHandle) {
                _this.props.onEndDragHandle(e);
            }
        };
        return _this;
    }
    DraggableHandle.prototype.render = function () {
        // remove custom handlers from `div` props
        // tslint:disable-next-line:no-unused-variable
        var _a = this.props, onBeginDragHandle = _a.onBeginDragHandle, onDragHandle = _a.onDragHandle, onEndDragHandle = _a.onEndDragHandle, props = __rest(_a, ["onBeginDragHandle", "onDragHandle", "onEndDragHandle"]);
        return React.createElement("div", __assign({}, props, { onMouseDown: this.onHandleMouseDown }), this.props.children);
    };
    DraggableHandle.prototype.componentWillUnmount = function () {
        this.removeListeners();
    };
    DraggableHandle.prototype.removeListeners = function () {
        if (this.isHoldingMouse) {
            this.isHoldingMouse = false;
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        }
    };
    return DraggableHandle;
}(React.Component));
exports.DraggableHandle = DraggableHandle;
