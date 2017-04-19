"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var joint = require("jointjs");
var lodash_1 = require("lodash");
var detectBrowser_1 = require("../viewUtils/detectBrowser");
var LinkView = (function (_super) {
    __extends(LinkView, _super);
    function LinkView() {
        return _super.apply(this, arguments) || this;
    }
    LinkView.prototype.initialize = function () {
        joint.dia.LinkView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:layoutOnly', this.updateLabel);
    };
    LinkView.prototype.render = function () {
        if (!this.view && this.paper && this.paper.diagramView) {
            this.setView(this.paper.diagramView);
        }
        var result = _super.prototype.render.call(this);
        return result;
    };
    LinkView.prototype.getTypeModel = function () {
        return this.view.model.getLinkType(this.model.get('typeId'));
    };
    LinkView.prototype.setView = function (view) {
        this.view = view;
        this.listenTo(this.view, 'change:language', this.updateLabel);
        var typeModel = this.getTypeModel();
        this.listenTo(typeModel, 'change:showLabel', this.updateLabel);
        this.listenTo(typeModel, 'change:label', this.updateLabel);
        this.updateLabelWithOptions({ silent: true });
    };
    LinkView.prototype.updateLabel = function () {
        this.updateLabelWithOptions();
    };
    LinkView.prototype.updateLabelWithOptions = function (options) {
        var linkTypeId = this.model.get('typeId');
        var typeModel = this.view.model.getLinkType(linkTypeId);
        var style = this.view.getLinkStyle(this.model.get('typeId'));
        lodash_1.merge(style, { connection: { 'stroke-dasharray': this.model.layoutOnly ? '5,5' : null } });
        var linkAttributes = {
            labels: style.labels,
            connector: style.connector,
            router: style.router,
            z: 0,
        };
        if (style.connection) {
            lodash_1.merge(linkAttributes, { attrs: { '.connection': style.connection } });
        }
        var showLabels = typeModel && typeModel.get('showLabel');
        var labelAttributes = showLabels ? [{
                position: 0.5,
                attrs: { text: {
                        text: this.view.getLinkLabel(linkTypeId).text,
                    } },
            }] : [];
        lodash_1.merge(linkAttributes, { labels: labelAttributes });
        this.model.set(linkAttributes, options);
    };
    return LinkView;
}(joint.dia.LinkView));
exports.LinkView = LinkView;
if (detectBrowser_1.isIE11()) {
    // workaround for "Dynamically updated SVG path with a marker-end does not update" issue
    // https://connect.microsoft.com/IE/feedback/details/801938/
    LinkView.prototype.update = function () {
        joint.dia.LinkView.prototype.update.apply(this, arguments);
        var path = this.el.querySelector('.connection');
        if (path) {
            var pathParent = path.parentNode;
            if (pathParent) {
                pathParent.removeChild(path);
                pathParent.insertBefore(path, pathParent.firstChild);
            }
        }
    };
}
