"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var react_dom_1 = require("react-dom");
var Backbone = require("backbone");
var d3_color_1 = require("d3-color");
var handlebarsTemplate_1 = require("../customization/handlebarsTemplate");
var model_1 = require("./model");
var ElementLayer = (function (_super) {
    __extends(ElementLayer, _super);
    function ElementLayer() {
        var _this = _super.apply(this, arguments) || this;
        _this.listener = new Backbone.Model();
        _this.updateAll = function () { return _this.forceUpdate(); };
        _this.updateElementSize = function (element, node) {
            var clientWidth = node.clientWidth, clientHeight = node.clientHeight;
            element.set('size', { width: clientWidth, height: clientHeight });
        };
        return _this;
    }
    ElementLayer.prototype.render = function () {
        var _this = this;
        var models = this.props.view.model.elements;
        var ctm = this.props.paper.viewport.getCTM();
        var scale = { x: ctm.a, y: ctm.d };
        var translate = { x: ctm.e, y: ctm.f };
        return React.createElement("div", { className: 'ontodia-element-layer', ref: function (layer) { return _this.layer = layer; }, style: {
                position: 'absolute', left: 0, top: 0,
                transform: "translate(" + translate.x + "px," + translate.y + "px) scale(" + scale.x + "," + scale.y + ")",
            } }, models.map(function (model) { return React.createElement(OverlayedElement, { key: model.id, model: model, view: _this.props.view, onResize: _this.updateElementSize, onRender: _this.updateElementSize }); }));
    };
    ElementLayer.prototype.componentDidMount = function () {
        var paper = this.props.paper;
        var graph = paper.model;
        this.listener.listenTo(graph, 'add remove reset', this.updateAll);
        this.listener.listenTo(paper, 'scale', this.updateAll);
        this.listener.listenTo(paper, 'translate resize', this.updateAll);
    };
    ElementLayer.prototype.componentWillUnmount = function () {
        this.listener.stopListening();
    };
    return ElementLayer;
}(React.Component));
exports.ElementLayer = ElementLayer;
var OverlayedElement = (function (_super) {
    __extends(OverlayedElement, _super);
    function OverlayedElement(props) {
        var _this = _super.call(this, props) || this;
        _this.listener = new Backbone.Model();
        _this.typesObserver = new KeyedObserver({
            subscribe: function (key) {
                var type = _this.props.view.model.getClassesById(key);
                if (type) {
                    _this.listener.listenTo(type, 'change:label', _this.rerenderTemplate);
                }
            },
            unsubscribe: function (key) {
                var type = _this.props.view.model.getClassesById(key);
                if (type) {
                    _this.listener.stopListening(type);
                }
            },
        });
        _this.propertyObserver = new KeyedObserver({
            subscribe: function (key) {
                var property = _this.props.view.model.getPropertyById(key);
                if (property) {
                    _this.listener.listenTo(property, 'change:label', _this.rerenderTemplate);
                }
            },
            unsubscribe: function (key) {
                var property = _this.props.view.model.getPropertyById(key);
                if (property) {
                    _this.listener.stopListening(property);
                }
            },
        });
        _this.rerenderTemplate = function () { return _this.setState({ templateProps: _this.templateProps() }); };
        _this.state = {
            templateProps: _this.templateProps(),
        };
        return _this;
    }
    OverlayedElement.prototype.render = function () {
        var _this = this;
        var _a = this.props, model = _a.model, view = _a.view, onResize = _a.onResize, onRender = _a.onRender;
        this.typesObserver.observe(model.template.types);
        this.propertyObserver.observe(Object.keys(model.template.properties));
        var template = view.getElementTemplate(model.template.types);
        var _b = model.get('position') || {}, _c = _b.x, x = _c === void 0 ? 0 : _c, _d = _b.y, y = _d === void 0 ? 0 : _d;
        var transform = "translate(" + x + "px," + y + "px)";
        var angle = model.get('angle') || 0;
        if (angle) {
            transform += "rotate(" + angle + "deg)";
        }
        return React.createElement("div", { className: 'ontodia-overlayed-element', style: { position: 'absolute', transform: transform }, tabIndex: 0, 
            // resize element when child image loaded
            onLoad: function () { return onResize(model, react_dom_1.findDOMNode(_this)); }, onError: function () { return onResize(model, react_dom_1.findDOMNode(_this)); }, onClick: function (e) {
                if (e.target instanceof HTMLElement && e.target.localName === 'a') {
                    var anchor = e.target;
                    model.iriClick(anchor.href);
                    e.preventDefault();
                }
            }, onDoubleClick: function () {
                model.isExpanded = !model.isExpanded;
            }, ref: function (node) {
                if (!node) {
                    return;
                }
                // set `model-id` to translate mouse events to paper
                node.setAttribute('model-id', model.id);
                onRender(model, node);
            } }, typeof template === 'string'
            ? React.createElement(handlebarsTemplate_1.HandlebarsTemplate, { template: template, templateProps: this.state.templateProps, onLoad: function () { return onResize(model, react_dom_1.findDOMNode(_this)); } })
            : React.createElement(template, this.state.templateProps));
    };
    OverlayedElement.prototype.componentDidMount = function () {
        var _this = this;
        var _a = this.props, model = _a.model, view = _a.view;
        this.listener.listenTo(view, 'change:language', this.rerenderTemplate);
        this.listener.listenTo(model, 'state:loaded', this.rerenderTemplate);
        this.listener.listenTo(model, 'focus-on-me', function () {
            var element = react_dom_1.findDOMNode(_this);
            if (element) {
                element.focus();
            }
        });
        this.listener.listenTo(model, 'change', function () {
            var invalidateRendering = false, invalidateAll = false;
            for (var changedKey in model.changed) {
                if (!model.changed.hasOwnProperty(changedKey)) {
                    continue;
                }
                if (changedKey === 'size') {
                }
                else if (changedKey === 'position' || changedKey === 'angle') {
                    invalidateRendering = true;
                }
                else {
                    invalidateAll = true;
                }
            }
            if (invalidateAll) {
                _this.rerenderTemplate();
            }
            else if (invalidateRendering) {
                _this.forceUpdate();
            }
        });
    };
    OverlayedElement.prototype.componentWillUnmount = function () {
        this.listener.stopListening();
    };
    OverlayedElement.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return nextState !== this.state;
    };
    OverlayedElement.prototype.componentDidUpdate = function () {
        this.props.onResize(this.props.model, react_dom_1.findDOMNode(this));
    };
    OverlayedElement.prototype.templateProps = function () {
        var _a = this.props, model = _a.model, view = _a.view;
        var types = model.template.types.length > 0
            ? view.getElementTypeString(model.template) : 'Thing';
        var label = view.getLocalizedText(model.template.label.values).text;
        var _b = this.styleFor(model), color = _b.color, icon = _b.icon;
        var propsAsList = this.getPropertyTable();
        return {
            types: types,
            label: label,
            color: color,
            icon: icon,
            iri: model.template.id,
            imgUrl: model.template.image,
            isExpanded: model.isExpanded,
            props: model.template.properties,
            propsAsList: propsAsList,
        };
    };
    OverlayedElement.prototype.getPropertyTable = function () {
        var _a = this.props, model = _a.model, view = _a.view;
        if (!model.template.properties) {
            return [];
        }
        var propTable = Object.keys(model.template.properties).map(function (key) {
            var property = view ? view.model.getPropertyById(key) : undefined;
            var name = view ? view.getLocalizedText(property.label.values).text : model_1.uri2name(key);
            return {
                id: key,
                name: name,
                property: model.template.properties[key],
            };
        });
        propTable.sort(function (a, b) {
            var aLabel = (a.name || a.id).toLowerCase();
            var bLabel = (b.name || b.id).toLowerCase();
            return aLabel.localeCompare(bLabel);
        });
        return propTable;
    };
    OverlayedElement.prototype.styleFor = function (model) {
        var _a = this.props.view.getTypeStyle(model.template.types), _b = _a.color, h = _b.h, c = _b.c, l = _b.l, icon = _a.icon;
        return {
            icon: icon ? icon : 'ontodia-default-icon',
            color: d3_color_1.hcl(h, c, l).toString(),
        };
    };
    return OverlayedElement;
}(React.Component));
var KeyedObserver = (function () {
    function KeyedObserver(params) {
        this.observedKeys = this.createMap();
        this.subscribe = params.subscribe;
        this.unsubscribe = params.unsubscribe;
    }
    KeyedObserver.prototype.createMap = function () {
        var map = Object.create(null);
        delete map['hint'];
        return map;
    };
    KeyedObserver.prototype.observe = function (keys) {
        var newObservedKeys = this.createMap();
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (newObservedKeys[key]) {
                continue;
            }
            newObservedKeys[key] = true;
            if (!this.observedKeys[key]) {
                this.subscribe(key);
            }
        }
        for (var key in this.observedKeys) {
            if (!newObservedKeys[key]) {
                this.unsubscribe(key);
            }
        }
        this.observedKeys = newObservedKeys;
    };
    return KeyedObserver;
}());
