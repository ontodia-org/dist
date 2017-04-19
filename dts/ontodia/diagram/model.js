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
var lodash_1 = require("lodash");
var joint = require("jointjs");
var layoutData_1 = require("./layoutData");
var elements_1 = require("./elements");
var dataFetchingThread_1 = require("./dataFetchingThread");
/**
 * Model of diagram.
 *
 * Properties:
 *     isViewOnly: boolean
 *
 * Events:
 *     state:beginLoad
 *     state:endLoad (diagramElementCount?: number)
 *     state:loadError (error: any)
 *     state:renderStart
 *     state:renderDone
 *     state:dataLoaded
 *
 *     history:undo
 *     history:redo
 *     history:reset
 *     history:initBatchCommand
 *     history:storeBatchCommand
 */
var DiagramModel = (function (_super) {
    __extends(DiagramModel, _super);
    function DiagramModel(isViewOnly) {
        if (isViewOnly === void 0) { isViewOnly = false; }
        var _this = _super.call(this) || this;
        _this.graph = new joint.dia.Graph();
        _this.classesById = {};
        _this.propertyLabelById = {};
        _this.nextLinkTypeIndex = 0;
        _this.linksByType = {};
        _this.set('isViewOnly', isViewOnly);
        _this.initializeExternalAddRemoveSupport();
        _this.classFetchingThread = new dataFetchingThread_1.DataFetchingThread();
        _this.linkFetchingThread = new dataFetchingThread_1.DataFetchingThread();
        _this.propertyLabelFetchingThread = new dataFetchingThread_1.DataFetchingThread();
        return _this;
    }
    DiagramModel.prototype.isViewOnly = function () { return this.get('isViewOnly'); };
    Object.defineProperty(DiagramModel.prototype, "cells", {
        get: function () { return this.graph.get('cells'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiagramModel.prototype, "elements", {
        get: function () { return this.graph.getElements(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiagramModel.prototype, "links", {
        get: function () { return this.graph.getLinks(); },
        enumerable: true,
        configurable: true
    });
    DiagramModel.prototype.getElement = function (elementId) {
        var cell = this.cells.get(elementId);
        return cell instanceof elements_1.Element ? cell : undefined;
    };
    DiagramModel.prototype.getLinkType = function (linkTypeId) {
        return this.linkTypes[linkTypeId];
    };
    DiagramModel.prototype.linksOfType = function (linkTypeId) { return this.linksByType[linkTypeId] || []; };
    DiagramModel.prototype.sourceOf = function (link) { return this.getElement(link.get('source').id); };
    DiagramModel.prototype.targetOf = function (link) { return this.getElement(link.get('target').id); };
    DiagramModel.prototype.isSourceAndTargetVisible = function (link) {
        return Boolean(this.sourceOf(link) && this.targetOf(link));
    };
    DiagramModel.prototype.undo = function () { this.trigger('history:undo'); };
    DiagramModel.prototype.redo = function () { this.trigger('history:redo'); };
    DiagramModel.prototype.resetHistory = function () { this.trigger('history:reset'); };
    DiagramModel.prototype.initBatchCommand = function () { this.trigger('history:initBatchCommand'); };
    DiagramModel.prototype.storeBatchCommand = function () { this.trigger('history:storeBatchCommand'); };
    DiagramModel.prototype.initializeExternalAddRemoveSupport = function () {
        var _this = this;
        // override graph.addCell to support CommandManager's undo/redo
        var superAddCell = this.graph.addCell;
        this.graph['addCell'] = function (cell, options) {
            if (cell instanceof elements_1.Element || cell instanceof elements_1.Link) {
                superAddCell.call(_this.graph, cell, options);
            }
            else if (cell.type === 'link') {
                _this.createLink({
                    sourceId: cell.source.id,
                    targetId: cell.target.id,
                    linkTypeId: cell.typeId,
                    suggestedId: cell.id,
                    vertices: cell.vertices,
                });
            }
            else if (cell.type === 'element') {
                var _a = cell, id = _a.id, position = _a.position, angle = _a.angle, isExpanded = _a.isExpanded;
                var element = new elements_1.Element({ id: id, position: position, angle: angle, isExpanded: isExpanded });
                element.template = placeholderTemplateFromIri(cell.id);
                superAddCell.call(_this.graph, element, options);
                _this.requestElementData([element]);
                _this.requestLinksOfType();
            }
            else {
                superAddCell.call(_this.graph, cell, options);
            }
        };
        // listen to external add/remove calls to graph (Halo's remove for example)
        this.listenTo(this.graph, 'add', function (cell) {
            if (cell instanceof elements_1.Link) {
                var linkType = _this.getLinkType(cell.get('typeId'));
                linkType.set('visible', true);
            }
        });
        this.listenTo(this.graph, 'remove', function (cell) {
            if (cell instanceof elements_1.Link) {
                var typeId = cell.typeId, sourceId = cell.sourceId, targetId = cell.targetId;
                _this.removeLinkReferences({ linkTypeId: typeId, sourceId: sourceId, targetId: targetId });
            }
        });
    };
    DiagramModel.prototype.createNewDiagram = function (dataProvider) {
        var _this = this;
        this.dataProvider = dataProvider;
        this.trigger('state:beginLoad');
        return Promise.all([
            this.dataProvider.classTree(),
            this.dataProvider.linkTypes(),
        ]).then(function (_a) {
            var classTree = _a[0], linkTypes = _a[1];
            _this.setClassTree(classTree);
            _this.initLinkTypes(linkTypes);
            _this.trigger('state:endLoad', 0);
            _this.initLinkSettings();
            return _this.initDiagram({ preloadedElements: {}, markLinksAsLayoutOnly: false });
        }).catch(function (err) {
            console.error(err);
            _this.trigger('state:endLoad', null, err.errorKind, err.message);
        });
    };
    DiagramModel.prototype.initLinkTypes = function (linkTypes) {
        var _this = this;
        this.linkTypes = {};
        lodash_1.each(linkTypes, function (_a) {
            var id = _a.id, label = _a.label;
            var linkType = new elements_1.FatLinkType({ id: id, label: label, diagram: _this, index: _this.nextLinkTypeIndex++ });
            _this.linkTypes[linkType.id] = linkType;
        });
    };
    DiagramModel.prototype.importLayout = function (params) {
        var _this = this;
        this.dataProvider = params.dataProvider;
        this.trigger('state:beginLoad');
        return Promise.all([
            this.dataProvider.classTree(),
            this.dataProvider.linkTypes(),
        ]).then(function (_a) {
            var classTree = _a[0], linkTypes = _a[1];
            _this.setClassTree(classTree);
            _this.initLinkTypes(linkTypes);
            _this.trigger('state:endLoad', lodash_1.size(params.preloadedElements));
            _this.initLinkSettings(params.linkSettings);
            return _this.initDiagram({
                layoutData: params.layoutData,
                preloadedElements: params.preloadedElements || {},
                markLinksAsLayoutOnly: params.validateLinks || false,
                hideUnusedLinkTypes: params.hideUnusedLinkTypes,
            }).then(function () {
                if (params.validateLinks) {
                    _this.requestLinksOfType();
                }
            });
        }).catch(function (err) {
            console.error(err);
            _this.trigger('state:endLoad', null, err.errorKind, err.message);
        });
    };
    DiagramModel.prototype.exportLayout = function () {
        var layoutData = layoutData_1.cleanExportedLayout(this.graph.toJSON());
        var linkSettings = lodash_1.values(this.linkTypes).map(function (type) { return ({
            id: type.id,
            visible: type.get('visible'),
            showLabel: type.get('showLabel'),
        }); });
        return { layoutData: layoutData, linkSettings: linkSettings };
    };
    DiagramModel.prototype.setClassTree = function (rootClasses) {
        var _this = this;
        this.classTree = rootClasses;
        var addClass = function (cl) {
            _this.classesById[cl.id] = new elements_1.FatClassModel(cl);
            lodash_1.each(cl.children, addClass);
        };
        lodash_1.each(rootClasses, addClass);
    };
    DiagramModel.prototype.initDiagram = function (params) {
        var _this = this;
        var layoutData = params.layoutData, preloadedElements = params.preloadedElements, markLinksAsLayoutOnly = params.markLinksAsLayoutOnly, hideUnusedLinkTypes = params.hideUnusedLinkTypes;
        return new Promise(function (resolve, reject) {
            _this.graph.trigger('batch:start', { batchName: 'to-back' });
            _this.listenToOnce(_this, 'state:renderDone', function () {
                if (hideUnusedLinkTypes) {
                    _this.hideUnusedLinkTypes();
                }
                _this.graph.trigger('batch:stop', { batchName: 'to-back' });
                resolve();
                // notify when graph model is fully initialized
                _this.trigger('state:dataLoaded');
            });
            _this.initLayout(layoutData || { cells: [] }, preloadedElements, markLinksAsLayoutOnly);
        });
    };
    DiagramModel.prototype.initLinkSettings = function (linkSettings) {
        if (linkSettings) {
            var existingDefaults_1 = { visible: false, showLabel: true };
            var indexedSettings_1 = lodash_1.keyBy(linkSettings, 'id');
            lodash_1.each(this.linkTypes, function (type, typeId) {
                var settings = indexedSettings_1[typeId] || { isNew: true };
                var options = { preventLoading: true };
                type.set(lodash_1.defaults(settings, existingDefaults_1), options);
            });
        }
        else {
            var newDefaults_1 = { visible: true, showLabel: true };
            var options_1 = { preventLoading: true };
            lodash_1.each(this.linkTypes, function (type) { return type.set(newDefaults_1, options_1); });
        }
    };
    DiagramModel.prototype.initLayout = function (layoutData, preloadedElements, markLinksAsLayoutOnly) {
        this.linksByType = {};
        var cellModels = [];
        var elementToRequestData = [];
        for (var _i = 0, _a = layoutData.cells; _i < _a.length; _i++) {
            var layoutCell = _a[_i];
            var cell = layoutData_1.normalizeImportedCell(layoutCell);
            if (cell.type === 'element') {
                // set size to zero to always recompute it on the first render
                var element = new elements_1.Element(__assign({}, cell, { size: { width: 0, height: 0 } }));
                var template = preloadedElements[cell.id];
                if (!template) {
                    elementToRequestData.push(element);
                }
                element.template = template || placeholderTemplateFromIri(cell.id);
                cellModels.push(element);
            }
            else if (cell.type === 'link') {
                var link = new elements_1.Link(cell);
                link.layoutOnly = markLinksAsLayoutOnly;
                link.typeIndex = this.createLinkType(link.typeId).index;
                cellModels.push(link);
            }
        }
        this.requestElementData(elementToRequestData);
        this.trigger('state:renderStart');
        this.graph.resetCells(cellModels);
        for (var _b = 0, _c = this.links; _b < _c.length; _b++) {
            var link = _c[_b];
            this.registerLink(link);
        }
    };
    DiagramModel.prototype.hideUnusedLinkTypes = function () {
        var unusedLinkTypes = __assign({}, this.linkTypes);
        for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
            var link = _a[_i];
            delete unusedLinkTypes[link.typeId];
        }
        for (var typeId in unusedLinkTypes) {
            if (!unusedLinkTypes.hasOwnProperty(typeId)) {
                continue;
            }
            var unusedLinkType = unusedLinkTypes[typeId];
            unusedLinkType.set('visible', false);
        }
    };
    DiagramModel.prototype.createElement = function (idOrModel) {
        var id = typeof idOrModel === 'string' ? idOrModel : idOrModel.id;
        var existing = this.getElement(id);
        if (existing) {
            return existing;
        }
        var model = typeof idOrModel === 'string'
            ? placeholderTemplateFromIri(idOrModel) : idOrModel;
        var element = new elements_1.Element({ id: model.id });
        element.template = model;
        this.graph.addCell(element);
        return element;
    };
    DiagramModel.prototype.requestElementData = function (elements) {
        var _this = this;
        if (elements.length == 0)
            return Promise.resolve([]);
        return this.dataProvider.elementInfo({ elementIds: elements.map(function (e) { return e.id; }) })
            .then(function (models) { return _this.onElementInfoLoaded(models); })
            .catch(function (err) {
            console.error(err);
            return Promise.reject(err);
        });
    };
    DiagramModel.prototype.requestLinksOfType = function (linkTypeIds) {
        var _this = this;
        var linkTypes = linkTypeIds;
        if (!linkTypes) {
            linkTypeIds = lodash_1.values(this.linkTypes).map(function (type) { return type.id; });
        }
        return this.dataProvider.linksInfo({
            elementIds: this.graph.getElements().map(function (element) { return element.id; }),
            linkTypeIds: linkTypeIds,
        }).then(function (links) { return _this.onLinkInfoLoaded(links); })
            .catch(function (err) {
            console.error(err);
            return Promise.reject(err);
        });
    };
    DiagramModel.prototype.getPropertyById = function (labelId) {
        var _this = this;
        if (!this.propertyLabelById[labelId]) {
            this.propertyLabelById[labelId] = new elements_1.RichProperty({
                id: labelId,
                label: { values: [{ lang: '', text: uri2name(labelId) }] },
            });
            this.propertyLabelFetchingThread.startFetchingThread(labelId).then(function (propertyIds) {
                if (!_this.dataProvider.propertyInfo) {
                    return;
                }
                if (propertyIds.length === 0) {
                    return;
                }
                _this.dataProvider.propertyInfo({ propertyIds: propertyIds }).then(function (propertyModels) {
                    for (var propertyId in propertyModels) {
                        if (!Object.hasOwnProperty.call(propertyModels, propertyId)) {
                            continue;
                        }
                        var propertyModel = propertyModels[propertyId];
                        if (!_this.propertyLabelById[propertyModel.id]) {
                            continue;
                        }
                        _this.propertyLabelById[propertyModel.id].set('label', propertyModel.label);
                    }
                });
            });
        }
        return this.propertyLabelById[labelId];
    };
    DiagramModel.prototype.getClassesById = function (typeId) {
        var _this = this;
        if (!this.classesById[typeId]) {
            this.classesById[typeId] = new elements_1.FatClassModel({
                id: typeId,
                label: { values: [{ lang: '', text: uri2name(typeId) }] },
                count: 0,
                children: [],
            });
            this.classFetchingThread.startFetchingThread(typeId).then(function (typeIds) {
                if (typeIds.length > 0) {
                    _this.dataProvider.classInfo({ classIds: typeIds }).then(function (classes) {
                        for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
                            var cl = classes_1[_i];
                            if (!_this.classesById[cl.id]) {
                                continue;
                            }
                            _this.classesById[cl.id].set('label', cl.label);
                            _this.classesById[cl.id].set('count', cl.count);
                        }
                    });
                }
            });
        }
        return this.classesById[typeId];
    };
    DiagramModel.prototype.createLinkType = function (linkTypeId) {
        var _this = this;
        if (this.linkTypes.hasOwnProperty(linkTypeId)) {
            return this.linkTypes[linkTypeId];
        }
        var defaultLabel = { values: [{ text: uri2name(linkTypeId), lang: '' }] };
        var fatLinkType = new elements_1.FatLinkType({
            id: linkTypeId,
            index: this.nextLinkTypeIndex++,
            label: defaultLabel,
            diagram: this,
        });
        this.linkFetchingThread.startFetchingThread(linkTypeId).then(function (linkTypeIds) {
            if (linkTypeIds.length > 0) {
                _this.dataProvider.linkTypesInfo({ linkTypeIds: linkTypeIds }).then(function (linkTypesInfo) {
                    for (var _i = 0, linkTypesInfo_1 = linkTypesInfo; _i < linkTypesInfo_1.length; _i++) {
                        var lt = linkTypesInfo_1[_i];
                        if (!_this.linkTypes[lt.id]) {
                            continue;
                        }
                        _this.linkTypes[lt.id].label = lt.label;
                    }
                });
            }
        });
        this.linkTypes[linkTypeId] = fatLinkType;
        return fatLinkType;
    };
    DiagramModel.prototype.onElementInfoLoaded = function (elements) {
        for (var _i = 0, _a = Object.keys(elements); _i < _a.length; _i++) {
            var id = _a[_i];
            var element = this.getElement(id);
            if (element) {
                element.template = elements[id];
                element.trigger('state:loaded');
            }
        }
    };
    DiagramModel.prototype.onLinkInfoLoaded = function (links) {
        this.initBatchCommand();
        for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
            var linkModel = links_1[_i];
            this.createLink(linkModel);
        }
        this.storeBatchCommand();
    };
    DiagramModel.prototype.createLink = function (linkModel, options) {
        var existingLink = this.getLink(linkModel);
        if (existingLink) {
            if (existingLink.layoutOnly) {
                existingLink.set('layoutOnly', false, { ignoreCommandManager: true });
            }
            return existingLink;
        }
        var linkTypeId = linkModel.linkTypeId, sourceId = linkModel.sourceId, targetId = linkModel.targetId, suggestedId = linkModel.suggestedId, vertices = linkModel.vertices;
        var suggestedIdAvailable = Boolean(suggestedId && !this.cells.get(suggestedId));
        var link = new elements_1.Link({
            id: suggestedIdAvailable ? suggestedId : "link_" + generateRandomID(),
            typeId: linkTypeId,
            source: { id: sourceId },
            target: { id: targetId },
            vertices: vertices,
        });
        if (this.isSourceAndTargetVisible(link) && this.createLinkType(link.typeId).visible) {
            this.registerLink(link);
            this.graph.addCell(link, options);
            return link;
        }
        return undefined;
    };
    DiagramModel.prototype.registerLink = function (link) {
        var typeId = link.typeId;
        if (!this.linksByType.hasOwnProperty(typeId)) {
            this.linksByType[typeId] = [];
        }
        this.linksByType[typeId].push(link);
        if (link.typeIndex === undefined) {
            link.typeIndex = this.createLinkType(typeId).index;
        }
        this.sourceOf(link).links.push(link);
        this.targetOf(link).links.push(link);
    };
    DiagramModel.prototype.getLink = function (linkModel) {
        var source = this.getElement(linkModel.sourceId);
        if (!source) {
            return undefined;
        }
        var index = findLinkIndex(source.links, linkModel);
        return index >= 0 && source.links[index];
    };
    DiagramModel.prototype.removeLinkReferences = function (linkModel) {
        var source = this.getElement(linkModel.sourceId);
        removeLinkFrom(source && source.links, linkModel);
        var target = this.getElement(linkModel.targetId);
        removeLinkFrom(target && target.links, linkModel);
        var linksOfType = this.linksByType[linkModel.linkTypeId];
        removeLinkFrom(linksOfType, linkModel);
    };
    return DiagramModel;
}(Backbone.Model));
exports.DiagramModel = DiagramModel;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DiagramModel;
function placeholderTemplateFromIri(iri) {
    return {
        id: iri,
        types: [],
        label: { values: [{ lang: '', text: uri2name(iri) }] },
        properties: {},
    };
}
function removeLinkFrom(links, model) {
    if (!links) {
        return;
    }
    var index = findLinkIndex(links, model);
    links.splice(index, 1);
}
function findLinkIndex(haystack, needle) {
    var sourceId = needle.sourceId, targetId = needle.targetId, linkTypeId = needle.linkTypeId;
    for (var i = 0; i < haystack.length; i++) {
        var link = haystack[i];
        if (link.sourceId === sourceId &&
            link.targetId === targetId &&
            link.typeId === linkTypeId) {
            return i;
        }
    }
    return -1;
}
/** Generates random 16-digit hexadecimal string. */
function generateRandomID() {
    function randomHalfDigits() {
        return Math.floor((1 + Math.random()) * 0x100000000)
            .toString(16).substring(1);
    }
    // generate by half because of restricted numerical precision
    return randomHalfDigits() + randomHalfDigits();
}
function uri2name(uri) {
    var hashIndex = uri.lastIndexOf('#');
    if (hashIndex !== -1 && hashIndex !== uri.length - 1) {
        return uri.substring(hashIndex + 1);
    }
    var lastPartStart = uri.lastIndexOf('/');
    if (lastPartStart !== -1 && lastPartStart !== uri.length - 1) {
        return uri.substring(lastPartStart + 1);
    }
    return uri;
}
exports.uri2name = uri2name;
function chooseLocalizedText(texts, language) {
    if (texts.length === 0) {
        return null;
    }
    // undefined if default language string isn't present
    var defaultLanguageValue;
    for (var _i = 0, texts_1 = texts; _i < texts_1.length; _i++) {
        var text = texts_1[_i];
        if (text.lang === language) {
            return text;
        }
        else if (text.lang === '') {
            defaultLanguageValue = text;
        }
    }
    return typeof defaultLanguageValue === 'undefined' ? texts[0] : defaultLanguageValue;
}
exports.chooseLocalizedText = chooseLocalizedText;
