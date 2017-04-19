"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Backbone = require("backbone");
var _ = require("lodash");
var $ = require("jquery");
var CollectionView = (function (_super) {
    __extends(CollectionView, _super);
    function CollectionView(options) {
        var _this = _super.call(this, options) || this;
        _this.isRendered = false;
        _this.onAdd = _this.onAdd.bind(_this);
        _this.onRemove = _this.onRemove.bind(_this);
        _this.onReset = _this.onReset.bind(_this);
        if (!options.childView) {
            throw new Error('No child view constructor provided');
        }
        if (!options.childOptions) {
            throw new Error('No child view options provided');
        }
        _this.childView = options.childView;
        _this.childOptions = options.childOptions;
        _this.childViews = [];
        _this.collection.each(_this.onAdd);
        _this.collection.bind('add', _this.onAdd);
        _this.collection.bind('remove', _this.onRemove);
        _this.collection.bind('reset', _this.onReset);
        return _this;
    }
    CollectionView.prototype.onAdd = function (model) {
        var childView = new this.childView(_.extend({ model: model }, this.childOptions));
        this.childViews.push(childView);
        if (this.isRendered) {
            $(this.el).append(childView.render().el);
        }
    };
    CollectionView.prototype.onRemove = function (model) {
        var viewToRemove = _.filter(this.childViews, function (cv) { return cv.model === model; })[0];
        if (viewToRemove) {
            this.childViews = _.without(this.childViews, viewToRemove);
            viewToRemove.remove();
        }
    };
    CollectionView.prototype.onReset = function () {
        // 'reset' event on collection do not trigger
        // 'add' and 'remove' events on models
        removeAllViews(this.childViews);
        this.collection.each(this.onAdd);
    };
    CollectionView.prototype.render = function () {
        var _this = this;
        this.isRendered = true;
        $(this.el).empty();
        _.each(this.childViews, function (cv) { return $(_this.el).append(cv.render().el); });
        return this;
    };
    return CollectionView;
}(Backbone.View));
exports.CollectionView = CollectionView;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CollectionView;
function removeAllViews(views) {
    _.each(views, function (view) { view.remove(); });
    views.length = 0;
}
exports.removeAllViews = removeAllViews;
