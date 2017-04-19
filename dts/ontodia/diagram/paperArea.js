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
var Backbone = require("backbone");
var joint = require("jointjs");
var React = require("react");
var react_dom_1 = require("react-dom");
var lodash_1 = require("lodash");
var spinner_1 = require("../viewUtils/spinner");
var PaperArea = (function (_super) {
    __extends(PaperArea, _super);
    function PaperArea() {
        var _this = _super.apply(this, arguments) || this;
        _this.listener = new Backbone.Model();
        _this.padding = { x: 0, y: 0 };
        _this.isPanning = false;
        _this.adjustPaper = function () {
            _this.center = _this.clientToPaperCoords(_this.area.clientWidth / 2, _this.area.clientHeight / 2);
            var scale = _this.getScale();
            // bbox in paper coordinates
            var bboxPaper = _this.getContentFittingBox();
            // bbox in area client coordinates
            var bboxArea = {
                left: bboxPaper.x * scale,
                right: (bboxPaper.x + bboxPaper.width) * scale,
                top: bboxPaper.y * scale,
                bottom: (bboxPaper.y + bboxPaper.height) * scale,
            };
            var gridWidth = _this.pageSize.x * scale;
            var gridHeight = _this.pageSize.y * scale;
            // bbox in integer grid coordinates (open-closed intervals)
            var bboxGrid = {
                left: Math.floor(bboxArea.left / gridWidth),
                right: Math.ceil(bboxArea.right / gridWidth),
                top: Math.floor(bboxArea.top / gridHeight),
                bottom: Math.ceil(bboxArea.bottom / gridHeight),
            };
            var oldOrigin = _this.paper.options.origin;
            var newOrigin = {
                x: (-bboxGrid.left) * gridWidth,
                y: (-bboxGrid.top) * gridHeight,
            };
            if (newOrigin.x !== oldOrigin.x || newOrigin.y !== oldOrigin.y) {
                _this.paper.setOrigin(newOrigin.x, newOrigin.y);
            }
            var oldWidth = _this.paper.options.width;
            var oldHeight = _this.paper.options.height;
            var newWidth = Math.max(bboxGrid.right - bboxGrid.left, 1) * gridWidth;
            var newHeight = Math.max(bboxGrid.bottom - bboxGrid.top, 1) * gridHeight;
            if (newWidth !== oldWidth || newHeight !== oldHeight) {
                _this.paper.setDimensions(newWidth, newHeight);
            }
            _this.updatePaperMargins();
        };
        _this.onPaperScale = function (scaleX, scaleY, originX, originY) {
            _this.adjustPaper();
            if (originX !== undefined || originY !== undefined) {
                _this.centerTo({ x: originX, y: originY });
            }
        };
        _this.onPaperResize = function () {
            if (_this.center) {
                _this.centerTo(_this.center);
            }
        };
        _this.onPaperTranslate = function (originX, originY) {
            if (_this.previousOrigin) {
                var _a = _this.previousOrigin, x = _a.x, y = _a.y;
                var translatedX = originX - x;
                var translatedY = originY - y;
                // update visible area when paper change origin without resizing
                // e.g. paper shinks from left side and grows from right
                _this.area.scrollLeft += translatedX;
                _this.area.scrollTop += translatedY;
            }
            _this.previousOrigin = { x: originX, y: originY };
        };
        _this.onAreaPointerDown = function (e) {
            if (e.target === _this.area) {
                if (_this.shouldStartPanning(e)) {
                    e.preventDefault();
                    _this.startPanning(e);
                }
            }
        };
        _this.onPointerMove = function (e) {
            if (_this.isPanning) {
                var offsetX = e.pageX - _this.panningOrigin.pageX;
                var offsetY = e.pageY - _this.panningOrigin.pageY;
                _this.area.scrollLeft = _this.panningScrollOrigin.scrollLeft - offsetX;
                _this.area.scrollTop = _this.panningScrollOrigin.scrollTop - offsetY;
            }
        };
        _this.stopPanning = function () {
            if (_this.isPanning) {
                _this.isPanning = false;
                document.removeEventListener('mousemove', _this.onPointerMove);
                document.removeEventListener('mouseup', _this.stopPanning);
            }
        };
        _this.onWheel = function (e) {
            if (e.ctrlKey) {
                e.preventDefault();
                var delta = Math.max(-1, Math.min(1, e.deltaY));
                var _a = _this.area, offsetLeft = _a.offsetLeft, offsetTop = _a.offsetTop;
                var pivot = _this.clientToPaperCoords(e.pageX - offsetLeft, e.pageY - offsetTop);
                _this.zoomBy(-delta * 0.1, { pivot: pivot });
            }
        };
        _this.onDragOver = function (e) {
            // Necessary. Allows us to drop.
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        };
        _this.onDragDrop = function (e) {
            if (_this.props.onDragDrop) {
                var _a = _this.area, offsetLeft = _a.offsetLeft, offsetTop = _a.offsetTop;
                var paperPosition = _this.clientToPaperCoords(e.pageX - offsetLeft, e.pageY - offsetTop);
                _this.props.onDragDrop(e, paperPosition);
            }
        };
        return _this;
    }
    PaperArea.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { className: 'paper-area', ref: function (area) { return _this.area = area; }, onMouseDown: this.onAreaPointerDown, onWheel: this.onWheel });
    };
    PaperArea.prototype.componentDidMount = function () {
        var _this = this;
        this.paper = this.props.paper;
        this.pageSize = {
            x: this.paper.options.width,
            y: this.paper.options.height,
        };
        this.paper.svg.style.overflow = 'visible';
        this.area.appendChild(this.paper.el);
        this.updatePaperMargins();
        this.centerTo();
        this.spinnerElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.paper.svg.appendChild(this.spinnerElement);
        this.listener.listenTo(this.paper, 'scale', this.onPaperScale);
        this.listener.listenTo(this.paper, 'resize', this.onPaperResize);
        this.listener.listenTo(this.paper, 'translate', this.onPaperTranslate);
        this.listener.listenTo(this.paper, 'blank:pointerdown', function (e) {
            if (_this.shouldStartPanning(e)) {
                e.preventDefault();
                _this.startPanning(e);
            }
        });
        this.listener.listenTo(this.paper, 'render:done', function () {
            _this.adjustPaper();
            _this.centerTo();
        });
        this.listener.listenTo(this.paper, 'cell:pointerdown', function () {
            _this.props.preventTextSelection();
        });
        // automatic paper adjust on element dragged
        this.listener.listenTo(this.paper, 'cell:pointerup', this.adjustPaper);
        this.listener.listenTo(this.paper.options.model, 'add remove change:position', lodash_1.debounce(this.adjustPaper, 50));
        this.listener.listenTo(this.paper.options.model, 'change:size', this.adjustPaper);
        this.listener.listenTo(this.paper, 'ontodia:adjustSize', this.adjustPaper);
        this.area.addEventListener('dragover', this.onDragOver);
        this.area.addEventListener('drop', this.onDragDrop);
        var model = this.props.model;
        this.listener.listenTo(model, 'state:beginLoad', function () { return _this.showIndicator(); });
        this.listener.listenTo(model, 'state:endLoad', function (elementCount) { return _this.renderLoadingIndicator(elementCount); });
        this.listener.listenTo(model, 'state:loadError', function (error) { return _this.renderLoadingIndicator(undefined, error); });
        this.listener.listenTo(model, 'state:renderStart', function () {
            react_dom_1.unmountComponentAtNode(_this.spinnerElement);
        });
        this.listener.listenTo(model, 'state:dataLoaded', function () {
            _this.zoomToFit();
        });
    };
    PaperArea.prototype.shouldComponentUpdate = function () {
        return false;
    };
    PaperArea.prototype.componentWillUnmount = function () {
        this.stopPanning();
        this.listener.stopListening();
        this.area.removeEventListener('dragover', this.onDragOver);
        this.area.removeEventListener('drop', this.onDragDrop);
        react_dom_1.unmountComponentAtNode(this.spinnerElement);
    };
    PaperArea.prototype.clientToPaperCoords = function (areaClientX, areaClientY) {
        var ctm = this.paper.viewport.getCTM();
        var x = areaClientX + this.area.scrollLeft - this.padding.x - ctm.e;
        x /= ctm.a;
        var y = areaClientY + this.area.scrollTop - this.padding.y - ctm.f;
        y /= ctm.d;
        return { x: x, y: y };
    };
    /** Returns bounding box of paper content in paper coordinates. */
    PaperArea.prototype.getContentFittingBox = function () {
        return joint.V(this.paper.viewport).bbox(true, this.paper.svg);
    };
    /** Returns paper size in paper coordinates. */
    PaperArea.prototype.getPaperSize = function () {
        var scale = this.getScale();
        var _a = this.paper.options, width = _a.width, height = _a.height;
        return { width: width / scale, height: height / scale };
    };
    PaperArea.prototype.updatePaperMargins = function () {
        var previousPadding = this.padding;
        this.padding = {
            x: Math.ceil(this.area.clientWidth * 0.75),
            y: Math.ceil(this.area.clientHeight * 0.75),
        };
        var paddingUnchanged = this.padding.x === previousPadding.x &&
            this.padding.y === previousPadding.y;
        if (paddingUnchanged) {
            return;
        }
        var paperElement = this.paper.el;
        paperElement.style.marginLeft = this.padding.x + "px";
        paperElement.style.marginRight = this.padding.x + "px";
        paperElement.style.marginTop = this.padding.y + "px";
        paperElement.style.marginBottom = this.padding.y + "px";
        if (previousPadding) {
            this.area.scrollLeft += this.padding.x - previousPadding.x;
            this.area.scrollTop += this.padding.y - previousPadding.y;
        }
    };
    PaperArea.prototype.shouldStartPanning = function (e) {
        return e.ctrlKey || e.shiftKey || this.props.panningAlwaysActive;
    };
    PaperArea.prototype.startPanning = function (event) {
        this.props.preventTextSelection();
        var pageX = event.pageX, pageY = event.pageY;
        this.panningOrigin = { pageX: pageX, pageY: pageY };
        var _a = this.area, scrollLeft = _a.scrollLeft, scrollTop = _a.scrollTop;
        this.panningScrollOrigin = { scrollLeft: scrollLeft, scrollTop: scrollTop };
        this.isPanning = true;
        document.addEventListener('mousemove', this.onPointerMove);
        document.addEventListener('mouseup', this.stopPanning);
    };
    PaperArea.prototype.centerTo = function (paperPosition) {
        var ctm = this.paper.viewport.getCTM();
        var clientX;
        var clientY;
        if (paperPosition) {
            var scale = ctm.a;
            clientX = paperPosition.x * scale;
            clientY = paperPosition.y * scale;
        }
        else {
            var x1 = -ctm.e;
            var y1 = -ctm.f;
            var x2 = x1 + this.paper.options.width;
            var y2 = y1 + this.paper.options.height;
            clientX = (x1 + x2) / 2;
            clientY = (y1 + y2) / 2;
        }
        var _a = this.area, clientWidth = _a.clientWidth, clientHeight = _a.clientHeight;
        this.updatePaperMargins();
        this.area.scrollLeft = clientX - clientWidth / 2 + ctm.e + this.padding.x;
        this.area.scrollTop = clientY - clientHeight / 2 + ctm.f + this.padding.y;
    };
    PaperArea.prototype.centerContent = function () {
        var _a = this.paper.viewport.getBBox(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        var viewportCenter = {
            x: x + width / 2,
            y: y + height / 2,
        };
        this.centerTo(viewportCenter);
    };
    PaperArea.prototype.getScale = function () {
        var ctm = this.paper.viewport.getCTM();
        // scale should be uniform (scaleX == scaleY)
        // and no rotation present, so
        // ctm.a == ctm.d and ctm.b == ctm.c == 0
        return ctm.a;
    };
    PaperArea.prototype.setScale = function (value, options) {
        if (options === void 0) { options = {}; }
        var scale = value;
        var _a = this.props.zoomOptions, zoomOptions = _a === void 0 ? {} : _a;
        var min = zoomOptions.min, max = zoomOptions.max;
        if (min !== undefined) {
            scale = Math.max(scale, min);
        }
        if (max !== undefined) {
            scale = Math.min(scale, max);
        }
        var center = this.clientToPaperCoords(this.area.clientWidth / 2, this.area.clientHeight / 2);
        var pivot;
        if (options.pivot) {
            var _b = options.pivot, x = _b.x, y = _b.y;
            var previousScale = this.getScale();
            var scaledBy = scale / previousScale;
            pivot = {
                x: x - (x - center.x) / scaledBy,
                y: y - (y - center.y) / scaledBy,
            };
        }
        else {
            pivot = center;
        }
        this.paper.scale(scale, scale);
        this.centerTo(pivot);
    };
    PaperArea.prototype.zoomBy = function (value, options) {
        if (options === void 0) { options = {}; }
        this.setScale(this.getScale() + value, options);
    };
    PaperArea.prototype.zoomToFit = function () {
        if (this.paper.options.model.get('cells').length === 0) {
            this.centerTo();
            return;
        }
        var _a = this.paper.options.origin, originX = _a.x, originY = _a.y;
        var fittingBBox = {
            x: originX,
            y: originY,
            width: this.area.clientWidth,
            height: this.area.clientHeight,
        };
        var _b = this.props.zoomOptions, zoomOptions = _b === void 0 ? {} : _b;
        this.paper.scaleContentToFit({
            fittingBBox: fittingBBox,
            padding: (this.props.zoomOptions || {}).fitPadding,
            minScale: zoomOptions.min,
            maxScale: zoomOptions.maxFit || zoomOptions.max,
        });
        this.paper.setOrigin(originX, originY);
        this.adjustPaper();
        this.centerContent();
    };
    PaperArea.prototype.renderSpinner = function (props) {
        if (props === void 0) { props = {}; }
        var paperRect = this.paper.svg.getBoundingClientRect();
        var x = props.statusText ? paperRect.width / 3 : paperRect.width / 2;
        var position = { x: x, y: paperRect.height / 2 };
        react_dom_1.render(React.createElement(spinner_1.Spinner, __assign({ position: position }, props)), this.spinnerElement);
    };
    PaperArea.prototype.showIndicator = function (operation) {
        var _this = this;
        this.centerTo();
        this.renderSpinner();
        if (operation) {
            operation.then(function () {
                react_dom_1.unmountComponentAtNode(_this.spinnerElement);
            }).catch(function (error) {
                console.error(error);
                _this.renderSpinner({ statusText: 'Unknown error occured', errorOccured: true });
            });
        }
    };
    PaperArea.prototype.renderLoadingIndicator = function (elementCount, error) {
        var WARN_ELEMENT_COUNT = 70;
        if (error) {
            this.renderSpinner({ statusText: error.statusText || error.message, errorOccured: true });
        }
        else if (elementCount > WARN_ELEMENT_COUNT) {
            this.renderSpinner({ statusText: "The diagram contains more than " + WARN_ELEMENT_COUNT + " " +
                    "elements. Please wait until it is fully loaded." });
        }
        else {
            this.renderSpinner();
        }
    };
    ;
    return PaperArea;
}(React.Component));
exports.PaperArea = PaperArea;
