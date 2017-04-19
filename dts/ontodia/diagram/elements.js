"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Backbone = require("backbone");
var joint = require("jointjs");
var UIElement = (function (_super) {
    __extends(UIElement, _super);
    function UIElement() {
        return _super.apply(this, arguments) || this;
    }
    UIElement.prototype.defaults = function () {
        return joint.util.deepSupplement({
            type: 'element',
            size: { width: 250, height: 50 },
        }, joint.shapes.basic.Generic.prototype.defaults);
    };
    return UIElement;
}(joint.shapes.basic.Generic));
exports.UIElement = UIElement;
UIElement.prototype.markup = '<g class="rotatable"><rect class="rootOfUI"/></g>';
/**
 * Properties:
 *     isExpanded: boolean
 *     position: { x: number, y: number }
 *     size: { width: number, height: number }
 *     angle: number - degrees
 *
 * Events:
 *     state:loaded
 *     add-to-filter
 *     focus-on-me
 *     action:iriClick
 */
var Element = (function (_super) {
    __extends(Element, _super);
    function Element() {
        var _this = _super.apply(this, arguments) || this;
        /** All in and out links of the element */
        _this.links = [];
        return _this;
    }
    Object.defineProperty(Element.prototype, "isExpanded", {
        get: function () { return this.get('isExpanded'); },
        set: function (value) { this.set('isExpanded', value); },
        enumerable: true,
        configurable: true
    });
    Element.prototype.initialize = function () {
        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
        this.set('z', 1);
        // element is collapsed by default
        if (!this.has('isExpanded')) {
            this.set('isExpanded', false);
        }
    };
    Element.prototype.addToFilter = function (linkType, direction) {
        this.trigger('add-to-filter', this, linkType, direction);
    };
    Element.prototype.focus = function () {
        this.trigger('focus-on-me', this);
    };
    Element.prototype.iriClick = function (iri) {
        this.trigger('action:iriClick', iri);
    };
    return Element;
}(UIElement));
exports.Element = Element;
/**
 * Properties:
 *     id: string
 *     label: { values: LocalizedString[] }
 *     count: number
 */
var FatClassModel = (function (_super) {
    __extends(FatClassModel, _super);
    function FatClassModel(classModel) {
        var _this = _super.call(this, { id: classModel.id }) || this;
        _this.model = classModel;
        _this.set('label', classModel.label);
        _this.set('count', classModel.count);
        return _this;
    }
    Object.defineProperty(FatClassModel.prototype, "label", {
        get: function () { return this.get('label'); },
        enumerable: true,
        configurable: true
    });
    return FatClassModel;
}(Backbone.Model));
exports.FatClassModel = FatClassModel;
/**
 * Properties:
 *     id: string
 *     label: { values: LocalizedString[] }
 */
var RichProperty = (function (_super) {
    __extends(RichProperty, _super);
    function RichProperty(model) {
        var _this = _super.call(this, { id: model.id }) || this;
        _this.set('label', model.label);
        return _this;
    }
    Object.defineProperty(RichProperty.prototype, "label", {
        get: function () { return this.get('label'); },
        enumerable: true,
        configurable: true
    });
    return RichProperty;
}(Backbone.Model));
exports.RichProperty = RichProperty;
/**
 * Properties:
 *     typeId: string
 *     typeIndex: number
 *     source: { id: string }
 *     target: { id: string }
 *     layoutOnly: boolean -- link exists only in layout (instead of underlying data)
 *
 * Events:
 *     state:loaded
 */
var Link = (function (_super) {
    __extends(Link, _super);
    function Link() {
        return _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Link.prototype, "markup", {
        get: function () {
            if (typeof this.typeIndex !== 'number') {
                throw new Error('Missing typeIndex when intializing link\'s markup');
            }
            return "<path class=\"connection\" stroke=\"black\" d=\"M 0 0 0 0\""
                + (" marker-start=\"url(#" + linkMarkerKey(this.typeIndex, true) + ")\"")
                + (" marker-end=\"url(#" + linkMarkerKey(this.typeIndex, false) + ")\" />")
                + "<path class=\"connection-wrap\" d=\"M 0 0 0 0\"/>"
                + "<g class=\"labels\"/>"
                + "<g class=\"marker-vertices\"/>"
                + "<g class=\"link-tools\"/>";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Link.prototype, "typeIndex", {
        get: function () { return this.get('typeIndex'); },
        set: function (value) { this.set('typeIndex', value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Link.prototype, "typeId", {
        get: function () { return this.get('typeId'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Link.prototype, "sourceId", {
        get: function () { return this.get('source').id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Link.prototype, "targetId", {
        get: function () { return this.get('target').id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Link.prototype, "layoutOnly", {
        get: function () { return this.get('layoutOnly'); },
        set: function (value) { this.set('layoutOnly', value); },
        enumerable: true,
        configurable: true
    });
    Link.prototype.initialize = function (attributes) {
        this.set('labels', [{ position: 0.5 }]);
    };
    return Link;
}(joint.dia.Link));
exports.Link = Link;
Link.prototype.arrowheadMarkup = null;
function linkMarkerKey(linkTypeIndex, startMarker) {
    return "ontodia-" + (startMarker ? 'mstart' : 'mend') + "-" + linkTypeIndex;
}
exports.linkMarkerKey = linkMarkerKey;
/**
 * Properties:
 *     visible: boolean
 *     showLabel: boolean
 *     isNew?: boolean
 *     label?: { values: LocalizedString[] }
 */
var FatLinkType = (function (_super) {
    __extends(FatLinkType, _super);
    function FatLinkType(params) {
        var _this = _super.call(this, {
            id: params.id,
            label: params.label,
            visible: true,
            showLabel: true,
        }) || this;
        _this.index = params.index;
        _this.diagram = params.diagram;
        _this.listenTo(_this, 'change:visible', _this.onVisibilityChanged);
        return _this;
    }
    Object.defineProperty(FatLinkType.prototype, "label", {
        get: function () { return this.get('label'); },
        set: function (value) { this.set('label', value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FatLinkType.prototype, "visible", {
        get: function () { return this.get('visible'); },
        enumerable: true,
        configurable: true
    });
    FatLinkType.prototype.setVisibility = function (params, options) {
        this.set(params, options);
    };
    FatLinkType.prototype.onVisibilityChanged = function (self, visible, options) {
        if (visible) {
            if (!options.preventLoading) {
                this.diagram.requestLinksOfType([this.id]);
            }
        }
        else {
            var links = this.diagram.linksOfType(this.id).slice();
            for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                var link = links_1[_i];
                link.remove();
            }
        }
    };
    return FatLinkType;
}(Backbone.Model));
exports.FatLinkType = FatLinkType;
