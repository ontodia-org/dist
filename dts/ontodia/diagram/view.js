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
var d3_color_1 = require("d3-color");
var Backbone = require("backbone");
var joint = require("jointjs");
var lodash_1 = require("lodash");
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var defaultTypeStyles_1 = require("../customization/defaultTypeStyles");
var defaultLinkStyles_1 = require("../customization/defaultLinkStyles");
var defaultTemplate_1 = require("../customization/defaultTemplate");
var defaultTemplates_1 = require("../customization/templates/defaultTemplates");
var halo_1 = require("../viewUtils/halo");
var connectionsMenu_1 = require("../viewUtils/connectionsMenu");
var toSvg_1 = require("../viewUtils/toSvg");
var model_1 = require("./model");
var elements_1 = require("./elements");
var linkView_1 = require("./linkView");
var separatedElementView_1 = require("./separatedElementView");
var elementLayer_1 = require("./elementLayer");
var DefaultToSVGOptions = {
    elementsToRemoveSelector: '.link-tools, .marker-vertices',
    convertImagesToDataUris: true,
};
/**
 * Properties:
 *     language: string
 *
 * Events:
 *     (private) dispose - fires on view dispose
 */
var DiagramView = (function (_super) {
    __extends(DiagramView, _super);
    function DiagramView(model, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.model = model;
        _this.options = options;
        _this.selection = new Backbone.Collection();
        _this.colorSeed = 0x0BADBEEF;
        _this.linkMarkers = {};
        _this.onKeyUp = function (e) {
            var DELETE_KEY_CODE = 46;
            if (e.keyCode === DELETE_KEY_CODE &&
                document.activeElement.localName !== 'input') {
                _this.removeSelectedElements();
            }
        };
        _this.setLanguage('en');
        _this.paper = new joint.dia.Paper({
            model: _this.model.graph,
            gridSize: 1,
            elementView: separatedElementView_1.SeparatedElementView,
            linkView: linkView_1.LinkView,
            width: 1500,
            height: 800,
            async: true,
            preventContextMenu: false,
            guard: function (evt, view) {
                // filter right mouse button clicks
                if (evt.type === 'mousedown' && evt.button !== 0) {
                    return true;
                }
                return false;
            },
        });
        _this.paper.diagramView = _this;
        _this.typeStyleResolvers = options.typeStyleResolvers
            ? options.typeStyleResolvers : defaultTypeStyles_1.DefaultTypeStyleBundle;
        _this.linkStyleResolvers = options.linkStyleResolvers
            ? _this.options.linkStyleResolvers : defaultLinkStyles_1.DefaultLinkStyleBundle;
        _this.templatesResolvers = options.templatesResolvers
            ? options.templatesResolvers : defaultTemplates_1.DefaultTemplateBundle;
        _this.listenTo(_this.paper, 'render:done', function () {
            _this.model.trigger('state:renderDone');
        });
        _this.listenTo(model, 'state:dataLoaded', function () {
            _this.model.resetHistory();
        });
        return _this;
    }
    DiagramView.prototype.getLanguage = function () { return this.get('language'); };
    DiagramView.prototype.setLanguage = function (value) { this.set('language', value); };
    DiagramView.prototype.cancelSelection = function () { this.selection.reset([]); };
    DiagramView.prototype.print = function () {
        toSvg_1.toSVG(this.paper, DefaultToSVGOptions).then(function (svg) {
            var printWindow = window.open('', undefined, 'width=1280,height=720');
            printWindow.document.write(svg);
            printWindow.print();
        });
    };
    DiagramView.prototype.exportSVG = function () {
        return toSvg_1.toSVG(this.paper, __assign({}, DefaultToSVGOptions, { preserveDimensions: true }));
    };
    DiagramView.prototype.exportPNG = function (options) {
        if (options === void 0) { options = {}; }
        return toSvg_1.toDataURL(this.paper, __assign({}, options, { svgOptions: __assign({}, DefaultToSVGOptions, options.svgOptions) }));
    };
    DiagramView.prototype.adjustPaper = function () {
        this.paper.trigger('ontodia:adjustSize');
    };
    DiagramView.prototype.initializePaperComponents = function () {
        var _this = this;
        this.configureElementLayer();
        if (!this.model.isViewOnly()) {
            this.configureSelection();
            this.configureDefaultHalo();
            document.addEventListener('keyup', this.onKeyUp);
            this.onDispose(function () { return document.removeEventListener('keyup', _this.onKeyUp); });
        }
    };
    DiagramView.prototype.configureElementLayer = function () {
        var _this = this;
        var container = document.createElement('div');
        this.paper.el.appendChild(container);
        react_dom_1.render(react_1.createElement(elementLayer_1.ElementLayer, { paper: this.paper, view: this }), container);
        this.onDispose(function () {
            react_dom_1.unmountComponentAtNode(container);
            _this.paper.el.removeChild(container);
        });
    };
    DiagramView.prototype.removeSelectedElements = function () {
        var elementsToRemove = this.selection.toArray();
        if (elementsToRemove.length === 0) {
            return;
        }
        this.cancelSelection();
        this.model.graph.trigger('batch:start');
        for (var _i = 0, elementsToRemove_1 = elementsToRemove; _i < elementsToRemove_1.length; _i++) {
            var element = elementsToRemove_1[_i];
            element.remove();
        }
        this.model.graph.trigger('batch:stop');
    };
    ;
    DiagramView.prototype.configureSelection = function () {
        var _this = this;
        if (this.model.isViewOnly()) {
            return;
        }
        this.listenTo(this.paper, 'cell:pointerup', function (cellView, evt) {
            // We don't want a Halo for links.
            if (cellView.model instanceof joint.dia.Link) {
                return;
            }
            if (evt.ctrlKey || evt.shiftKey || evt.metaKey) {
                return;
            }
            var element = cellView.model;
            _this.selection.reset([element]);
            element.focus();
        });
        var pointerScreenCoords = { x: NaN, y: NaN };
        this.listenTo(this.paper, 'blank:pointerdown', function (evt) {
            pointerScreenCoords = { x: evt.screenX, y: evt.screenY };
        });
        this.listenTo(this.paper, 'blank:pointerup', function (evt) {
            if (evt.screenX !== pointerScreenCoords.x || evt.screenY !== pointerScreenCoords.y) {
                return;
            }
            _this.selection.reset();
            _this.hideNavigationMenu();
            if (document.activeElement) {
                document.activeElement.blur();
            }
        });
    };
    DiagramView.prototype.configureDefaultHalo = function () {
        var _this = this;
        if (this.options.disableDefaultHalo) {
            return;
        }
        var container = document.createElement('div');
        this.paper.el.appendChild(container);
        var renderDefaultHalo = function (selectedElement) {
            var cellView = undefined;
            if (selectedElement) {
                cellView = _this.paper.findViewByModel(selectedElement);
            }
            react_dom_1.render(react_1.createElement(halo_1.Halo, {
                paper: _this.paper,
                diagramView: _this,
                cellView: cellView,
                onDelete: function () { return _this.removeSelectedElements(); },
                onExpand: function () {
                    cellView.model.set('isExpanded', !cellView.model.get('isExpanded'));
                },
                navigationMenuOpened: Boolean(_this.connectionsMenu),
                onToggleNavigationMenu: function () {
                    if (_this.connectionsMenu) {
                        _this.hideNavigationMenu();
                    }
                    else {
                        _this.showNavigationMenu(selectedElement);
                    }
                    renderDefaultHalo(selectedElement);
                },
                onAddToFilter: function () { return selectedElement.addToFilter(); },
            }), container);
        };
        this.listenTo(this.selection, 'add remove reset', function () {
            var selected = _this.selection.length === 1 ? _this.selection.first() : undefined;
            if (_this.connectionsMenu && selected !== _this.connectionsMenu.cellView.model) {
                _this.hideNavigationMenu();
            }
            renderDefaultHalo(selected);
        });
        renderDefaultHalo();
        this.onDispose(function () {
            react_dom_1.unmountComponentAtNode(container);
            _this.paper.el.removeChild(container);
        });
    };
    DiagramView.prototype.showNavigationMenu = function (element) {
        var _this = this;
        var cellView = this.paper.findViewByModel(element);
        this.connectionsMenu = new connectionsMenu_1.ConnectionsMenu({
            paper: this.paper,
            view: this,
            cellView: cellView,
            onClose: function () {
                _this.connectionsMenu.remove();
                _this.connectionsMenu = undefined;
            },
        });
    };
    DiagramView.prototype.hideNavigationMenu = function () {
        if (this.connectionsMenu) {
            this.connectionsMenu.remove();
            this.connectionsMenu = undefined;
        }
    };
    DiagramView.prototype.onDragDrop = function (e, paperPosition) {
        e.preventDefault();
        var elementIds;
        try {
            elementIds = JSON.parse(e.dataTransfer.getData('application/x-ontodia-elements'));
        }
        catch (ex) {
            try {
                elementIds = JSON.parse(e.dataTransfer.getData('text')); // IE fix
            }
            catch (ex) {
                var draggedUri = e.dataTransfer.getData('text/uri-list');
                // element dragged from the class tree has URI of the form:
                // <window.location without hash>#<class URI>
                var uriFromTreePrefix = window.location.href.split('#')[0] + '#';
                var uri = draggedUri.indexOf(uriFromTreePrefix) === 0
                    ? draggedUri.substring(uriFromTreePrefix.length) : draggedUri;
                elementIds = [uri];
            }
        }
        if (!elementIds || elementIds.length === 0) {
            return;
        }
        this.model.initBatchCommand();
        var elementsToSelect = [];
        var totalXOffset = 0;
        var x = paperPosition.x, y = paperPosition.y;
        for (var _i = 0, elementIds_1 = elementIds; _i < elementIds_1.length; _i++) {
            var elementId = elementIds_1[_i];
            var center = elementIds.length === 1;
            var element = this.createElementAt(elementId, { x: x + totalXOffset, y: y, center: center });
            totalXOffset += element.get('size').width + 20;
            elementsToSelect.push(element);
            element.focus();
        }
        this.model.requestElementData(elementsToSelect);
        this.model.requestLinksOfType();
        this.selection.reset(elementsToSelect);
        this.model.storeBatchCommand();
    };
    DiagramView.prototype.createElementAt = function (elementId, position) {
        var element = this.model.createElement(elementId);
        var x = position.x, y = position.y;
        var size = element.get('size');
        if (position.center) {
            x -= size.width / 2;
            y -= size.height / 2;
        }
        element.set('position', { x: x, y: y });
        return element;
    };
    DiagramView.prototype.getLocalizedText = function (texts) {
        return model_1.chooseLocalizedText(texts, this.getLanguage());
    };
    DiagramView.prototype.getElementTypeString = function (elementModel) {
        var _this = this;
        return elementModel.types.map(function (typeId) {
            var type = _this.model.getClassesById(typeId);
            return _this.getElementTypeLabel(type).text;
        }).sort().join(', ');
    };
    DiagramView.prototype.getElementTypeLabel = function (type) {
        var label = this.getLocalizedText(type.get('label').values);
        return label ? label : { text: model_1.uri2name(type.id), lang: '' };
    };
    DiagramView.prototype.getLinkLabel = function (linkTypeId) {
        var type = this.model.getLinkType(linkTypeId);
        var label = type ? this.getLocalizedText(type.get('label').values) : null;
        return label ? label : { text: model_1.uri2name(linkTypeId), lang: '' };
    };
    DiagramView.prototype.getTypeStyle = function (types) {
        types.sort();
        var customStyle;
        for (var _i = 0, _a = this.typeStyleResolvers; _i < _a.length; _i++) {
            var resolver = _a[_i];
            var result = resolver(types);
            if (result) {
                customStyle = result;
                break;
            }
        }
        var icon = customStyle ? customStyle.icon : undefined;
        var color;
        if (customStyle && customStyle.color) {
            color = d3_color_1.hcl(customStyle.color);
        }
        else {
            var hue = getHueFromClasses(types, this.colorSeed);
            color = { h: hue, c: 40, l: 75 };
        }
        return { icon: icon, color: color };
    };
    DiagramView.prototype.registerElementStyleResolver = function (resolver) {
        this.typeStyleResolvers.unshift(resolver);
        return resolver;
    };
    DiagramView.prototype.unregisterElementStyleResolver = function (resolver) {
        var index = this.typeStyleResolvers.indexOf(resolver);
        if (index !== -1) {
            return this.typeStyleResolvers.splice(index, 1)[0];
        }
        else {
            return undefined;
        }
    };
    DiagramView.prototype.getElementTemplate = function (types) {
        for (var _i = 0, _a = this.templatesResolvers; _i < _a.length; _i++) {
            var resolver = _a[_i];
            var result = resolver(types);
            if (result) {
                return result;
            }
        }
        return defaultTemplate_1.DefaultTemplate;
    };
    DiagramView.prototype.registerTemplateResolver = function (resolver) {
        this.templatesResolvers.unshift(resolver);
        return resolver;
    };
    DiagramView.prototype.unregisterTemplateResolver = function (resolver) {
        var index = this.templatesResolvers.indexOf(resolver);
        if (index !== -1) {
            return this.templatesResolvers.splice(index, 1)[0];
        }
        else {
            return undefined;
        }
    };
    DiagramView.prototype.getLinkStyle = function (linkTypeId) {
        var style = getDefaultLinkStyle();
        for (var _i = 0, _a = this.linkStyleResolvers; _i < _a.length; _i++) {
            var resolver = _a[_i];
            var result = resolver(linkTypeId);
            if (result) {
                lodash_1.merge(style, lodash_1.cloneDeep(result));
                break;
            }
        }
        if (!this.linkMarkers[linkTypeId]) {
            this.linkMarkers[linkTypeId] = {
                start: this.createLinkMarker(linkTypeId, true, style.markerSource),
                end: this.createLinkMarker(linkTypeId, false, style.markerTarget),
            };
        }
        return style;
    };
    DiagramView.prototype.createLinkMarker = function (linkTypeId, startMarker, style) {
        if (!style) {
            return undefined;
        }
        var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
        var defs = this.paper.svg.getElementsByTagNameNS(SVG_NAMESPACE, 'defs')[0];
        var marker = document.createElementNS(SVG_NAMESPACE, 'marker');
        var linkTypeIndex = this.model.getLinkType(linkTypeId).index;
        marker.setAttribute('id', elements_1.linkMarkerKey(linkTypeIndex, startMarker));
        marker.setAttribute('markerWidth', style.width.toString());
        marker.setAttribute('markerHeight', style.height.toString());
        marker.setAttribute('orient', 'auto');
        var xOffset = startMarker ? 0 : (style.width - 1);
        marker.setAttribute('refX', xOffset.toString());
        marker.setAttribute('refY', (style.height / 2).toString());
        marker.setAttribute('markerUnits', 'userSpaceOnUse');
        var path = document.createElementNS(SVG_NAMESPACE, 'path');
        path.setAttribute('d', style.d);
        if (style.fill !== undefined) {
            path.setAttribute('fill', style.fill);
        }
        if (style.stroke !== undefined) {
            path.setAttribute('stroke', style.stroke);
        }
        if (style.strokeWidth !== undefined) {
            path.setAttribute('stroke-width', style.strokeWidth);
        }
        marker.appendChild(path);
        defs.appendChild(marker);
        return marker;
    };
    DiagramView.prototype.registerLinkStyleResolver = function (resolver) {
        this.linkStyleResolvers.unshift(resolver);
        return resolver;
    };
    DiagramView.prototype.unregisterLinkStyleResolver = function (resolver) {
        var index = this.linkStyleResolvers.indexOf(resolver);
        if (index !== -1) {
            return this.linkStyleResolvers.splice(index, 1)[0];
        }
        else {
            return undefined;
        }
    };
    DiagramView.prototype.getOptions = function () {
        return this.options;
    };
    DiagramView.prototype.onDispose = function (handler) {
        this.listenTo(this, 'dispose', handler);
    };
    DiagramView.prototype.dispose = function () {
        if (!this.paper) {
            return;
        }
        this.trigger('dispose');
        this.stopListening();
        this.paper.remove();
        this.paper = undefined;
    };
    return DiagramView;
}(Backbone.Model));
exports.DiagramView = DiagramView;
function getHueFromClasses(classes, seed) {
    var hash = seed;
    for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
        var name_1 = classes_1[_i];
        hash = hashFnv32a(name_1, hash);
    }
    var MAX_INT32 = 0x7fffffff;
    return 360 * ((hash === undefined ? 0 : hash) / MAX_INT32);
}
function getDefaultLinkStyle() {
    return {
        markerTarget: { d: 'M0,0 L0,8 L9,4 z', width: 9, height: 8, fill: 'black' },
    };
}
/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
function hashFnv32a(str, seed) {
    if (seed === void 0) { seed = 0x811c9dc5; }
    /* tslint:disable:no-bitwise */
    var i, l, hval = seed & 0x7fffffff;
    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
    /* tslint:enable:no-bitwise */
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DiagramView;
