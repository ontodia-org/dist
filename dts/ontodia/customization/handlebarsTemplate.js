"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var react_dom_1 = require("react-dom");
var handlebars_1 = require("handlebars");
var HANDLEBARS_HELPERS = {
    getProperty: function (props, id) {
        if (props && props[id]) {
            return props[id].values.map(function (v) { return v.text; }).join(', ');
        }
        else {
            return undefined;
        }
    },
};
var HandlebarsTemplate = (function (_super) {
    __extends(HandlebarsTemplate, _super);
    function HandlebarsTemplate(props) {
        var _this = _super.call(this, props) || this;
        _this.cancelLoad = function () { };
        _this.compiledTemplate = handlebars_1.compile(_this.props.template);
        return _this;
    }
    HandlebarsTemplate.prototype.render = function () {
        return React.createElement("div", { dangerouslySetInnerHTML: this.renderTemplate() });
    };
    HandlebarsTemplate.prototype.renderTemplate = function () {
        var templateProps = this.props.templateProps;
        var html = this.compiledTemplate(templateProps, { helpers: HANDLEBARS_HELPERS });
        return { __html: html };
    };
    HandlebarsTemplate.prototype.componentDidMount = function () {
        this.subscribeOnLoad();
    };
    HandlebarsTemplate.prototype.componentDidUpdate = function () {
        this.subscribeOnLoad();
    };
    HandlebarsTemplate.prototype.componentWillUnmount = function () {
        this.cancelLoad();
    };
    HandlebarsTemplate.prototype.subscribeOnLoad = function () {
        this.cancelLoad();
        var onLoad = this.props.onLoad;
        var node = react_dom_1.findDOMNode(this);
        if (onLoad) {
            var cancelled_1 = false;
            this.cancelLoad = function () { return cancelled_1 = true; };
            this.subscribeOnImagesLoad(node).then(function () {
                if (!cancelled_1) {
                    onLoad();
                }
            });
        }
    };
    HandlebarsTemplate.prototype.subscribeOnImagesLoad = function (node) {
        var loadingImages = [];
        var images = node.querySelectorAll('img');
        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            var loadPromise = whenImageLoad(image);
            if (loadPromise) {
                loadingImages.push(loadPromise);
            }
        }
        return Promise.all(loadingImages).then(function () { });
    };
    return HandlebarsTemplate;
}(React.Component));
exports.HandlebarsTemplate = HandlebarsTemplate;
function whenImageLoad(image) {
    if (image.complete) {
        return undefined;
    }
    return new Promise(function (resolve) {
        var removeListeners;
        var loadListener = function () {
            removeListeners();
            resolve();
        };
        var errorListener = function () {
            removeListeners();
            resolve();
        };
        removeListeners = function () {
            image.removeEventListener('load', loadListener, true);
            image.removeEventListener('error', loadListener, true);
        };
        image.addEventListener('load', loadListener, true);
        image.addEventListener('error', errorListener, true);
    });
}
