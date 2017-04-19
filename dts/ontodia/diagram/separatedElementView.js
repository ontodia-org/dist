"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var joint = require("jointjs");
var DEBUG_BOUNDS = false;
var SeparatedElementView = (function (_super) {
    __extends(SeparatedElementView, _super);
    function SeparatedElementView() {
        var _this = _super.apply(this, arguments) || this;
        _this.updateSize = function () {
            var size = _this.model.get('size') || { width: 0, height: 0 };
            _this.rect.setAttribute('width', size.width || 0);
            _this.rect.setAttribute('height', size.height || 0);
        };
        return _this;
    }
    SeparatedElementView.prototype.render = function () {
        var result = _super.prototype.render.call(this);
        if (!this.view && this.paper && this.paper.diagramView) {
            this.setView(this.paper.diagramView);
        }
        this.rect = this.el.querySelector('.rootOfUI');
        this.rect.setAttribute('cursor', 'pointer');
        if (DEBUG_BOUNDS) {
            this.rect.style.fill = 'green';
            this.rect.style.stroke = 'red';
            this.rect.style.strokeWidth = '3';
        }
        this.updateSize();
        return result;
    };
    SeparatedElementView.prototype.setView = function (view) {
        this.view = view;
        this.listenTo(this.model, 'change:size', this.updateSize);
    };
    return SeparatedElementView;
}(joint.dia.ElementView));
exports.SeparatedElementView = SeparatedElementView;
