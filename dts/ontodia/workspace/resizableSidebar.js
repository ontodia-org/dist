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
var DockSide;
(function (DockSide) {
    DockSide[DockSide["Left"] = 1] = "Left";
    DockSide[DockSide["Right"] = 2] = "Right";
})(DockSide = exports.DockSide || (exports.DockSide = {}));
var CLASS_NAME = 'ontodia-drag-resizable-column';
var ResizableSidebar = (function (_super) {
    __extends(ResizableSidebar, _super);
    function ResizableSidebar(props) {
        var _this = _super.call(this, props) || this;
        _this.onBeginDragHandle = function () {
            _this.originWidth = _this.state.open ? _this.state.width : 0;
            _this.props.onStartResize();
        };
        _this.onDragHandle = function (e, dx, dy) {
            var xDifference = dx;
            if (_this.props.dockSide === DockSide.Right) {
                xDifference = -xDifference;
            }
            var newWidth = _this.originWidth + xDifference;
            var clampedWidth = Math.max(Math.min(newWidth, _this.props.maxWidth), _this.props.minWidth);
            _this.toggle({ open: clampedWidth > _this.props.minWidth, newWidth: clampedWidth });
        };
        var initiallyOpen = _this.props.initiallyOpen;
        _this.state = {
            open: initiallyOpen,
            width: _this.defaultWidth(),
        };
        return _this;
    }
    ResizableSidebar.prototype.defaultWidth = function () {
        var _a = this.props, defaultWidth = _a.defaultWidth, maxWidth = _a.maxWidth;
        return Math.min(defaultWidth, maxWidth);
    };
    ResizableSidebar.prototype.render = function () {
        var _this = this;
        var isDockedLeft = this.props.dockSide === DockSide.Left;
        var _a = this.state, open = _a.open, width = _a.width;
        var className = CLASS_NAME + " " +
            (CLASS_NAME + "--" + (isDockedLeft ? 'docked-left' : 'docked-right') + " ") +
            (CLASS_NAME + "--" + (open ? 'opened' : 'closed') + " ") +
            ("" + (this.props.className || ''));
        return React.createElement("div", __assign({ className: className, style: { width: open ? width : 0 } }, this.props.tutorialProps),
            this.props.children,
            React.createElement(draggableHandle_1.DraggableHandle, { className: CLASS_NAME + "__handle", onBeginDragHandle: this.onBeginDragHandle, onDragHandle: this.onDragHandle },
                React.createElement("div", { className: CLASS_NAME + "__handle-btn", onClick: function () { return _this.toggle({ open: !_this.state.open }); } })));
    };
    ResizableSidebar.prototype.toggle = function (params) {
        var _this = this;
        var open = params.open, newWidth = params.newWidth;
        var openChanged = open !== this.state.open;
        var onStateChanged = function () {
            if (openChanged && _this.props.onOpenOrClose) {
                _this.props.onOpenOrClose(open);
            }
        };
        var useDefaultWidth = open && this.state.width === 0 && newWidth === undefined;
        if (useDefaultWidth) {
            this.setState({ open: open, width: this.defaultWidth() }, onStateChanged);
        }
        else {
            this.setState(newWidth === undefined ? { open: open } : { open: open, width: newWidth }, onStateChanged);
        }
    };
    return ResizableSidebar;
}(React.Component));
ResizableSidebar.defaultProps = {
    dockSide: DockSide.Left,
    minWidth: 0,
    maxWidth: 500,
    defaultWidth: 275,
    initiallyOpen: true,
};
exports.ResizableSidebar = ResizableSidebar;
