"use strict";
var lodash_1 = require("lodash");
var CLASSES = require('json!./data/classes.json');
var LINK_TYPES = require('json!./data/linkTypes.json');
var ELEMENTS = require('json!./data/elements.json');
var LINKS = require('json!./data/links.json');
var DemoDataProvider = (function () {
    function DemoDataProvider() {
    }
    DemoDataProvider.prototype.simulateNetwork = function (result) {
        var MEAN_DELAY = 200;
        var cloned = lodash_1.cloneDeep(result);
        // simulate exponential distribution
        var delay = -Math.log(Math.random()) * MEAN_DELAY;
        return new Promise(function (resolve) {
            setTimeout(function () { return resolve(cloned); }, delay);
        });
    };
    DemoDataProvider.prototype.classTree = function () {
        return this.simulateNetwork(CLASSES);
    };
    DemoDataProvider.prototype.classInfo = function (params) {
        var classIds = params.classIds || [];
        return this.simulateNetwork(CLASSES.filter(function (cl) { return classIds.indexOf(cl.id); }));
    };
    DemoDataProvider.prototype.linkTypes = function () {
        return this.simulateNetwork(LINK_TYPES);
    };
    DemoDataProvider.prototype.linkTypesInfo = function (params) {
        var types = lodash_1.keyBy(params.linkTypeIds);
        var linkTypes = LINK_TYPES.filter(function (type) { return types[type.id]; });
        return this.simulateNetwork(linkTypes);
    };
    DemoDataProvider.prototype.elementInfo = function (params) {
        var elements = params.elementIds
            .map(function (elementId) { return ELEMENTS[elementId]; })
            .filter(function (element) { return element !== undefined; });
        return this.simulateNetwork(lodash_1.keyBy(elements, function (element) { return element.id; }));
    };
    DemoDataProvider.prototype.linksInfo = function (params) {
        var nodes = lodash_1.keyBy(params.elementIds);
        var types = lodash_1.keyBy(params.linkTypeIds);
        var links = LINKS.filter(function (link) {
            return types[link.linkTypeId] && nodes[link.sourceId] && nodes[link.targetId];
        });
        return this.simulateNetwork(links);
    };
    DemoDataProvider.prototype.linkTypesOf = function (params) {
        var counts = {};
        for (var _i = 0, LINKS_1 = LINKS; _i < LINKS_1.length; _i++) {
            var link = LINKS_1[_i];
            if (link.sourceId === params.elementId ||
                link.targetId === params.elementId) {
                var linkCount = counts[link.linkTypeId];
                var isSource = link.sourceId === params.elementId;
                if (linkCount) {
                    isSource ? linkCount.outCount++ : linkCount.inCount++;
                }
                else {
                    counts[link.linkTypeId] = isSource
                        ? { id: link.linkTypeId, inCount: 0, outCount: 1 }
                        : { id: link.linkTypeId, inCount: 1, outCount: 0 };
                }
            }
        }
        return this.simulateNetwork(lodash_1.map(counts));
    };
    DemoDataProvider.prototype.linkElements = function (params) {
        //for sparql we have rich filtering features and we just reuse filter.
        return this.filter({
            refElementId: params.elementId,
            refElementLinkId: params.linkId,
            linkDirection: params.direction,
            limit: params.limit,
            offset: params.offset,
            languageCode: ""
        });
    };
    DemoDataProvider.prototype.filter = function (params) {
        if (params.offset > 0) {
            return Promise.resolve({});
        }
        var filtered = {};
        if (params.elementTypeId) {
            lodash_1.each(ELEMENTS, function (element) {
                if (element.types.indexOf(params.elementTypeId) >= 0) {
                    filtered[element.id] = element;
                }
            });
        }
        else if (params.refElementId) {
            var filteredLinks = params.refElementLinkId
                ? LINKS.filter(function (link) { return link.linkTypeId === params.refElementLinkId; })
                : LINKS;
            var nodeId = params.refElementId;
            for (var _i = 0, filteredLinks_1 = filteredLinks; _i < filteredLinks_1.length; _i++) {
                var link = filteredLinks_1[_i];
                var linkedElementId = undefined;
                if (link.sourceId === nodeId && params.linkDirection !== 'in') {
                    linkedElementId = link.targetId;
                }
                else if (link.targetId === nodeId && params.linkDirection !== 'out') {
                    linkedElementId = link.sourceId;
                }
                if (linkedElementId !== undefined) {
                    var linkedElement = ELEMENTS[linkedElementId];
                    if (linkedElement) {
                        filtered[linkedElement.id] = linkedElement;
                    }
                }
            }
        }
        else if (params.text) {
            filtered = ELEMENTS; // filtering by text is done below
        }
        else {
            return Promise.reject(new Error('This type of filter is not implemented'));
        }
        if (params.text) {
            var filteredByText_1 = {};
            var text_1 = params.text.toLowerCase();
            lodash_1.each(filtered, function (element) {
                var found = false;
                if (element.id.toLowerCase().indexOf(text_1) >= 0) {
                    found = true;
                }
                else {
                    found = element.label.values.some(function (label) { return label.text.toLowerCase().indexOf(text_1) >= 0; });
                }
                if (found) {
                    filteredByText_1[element.id] = element;
                }
            });
            return this.simulateNetwork(filteredByText_1);
        }
        else {
            return this.simulateNetwork(filtered);
        }
    };
    return DemoDataProvider;
}());
exports.DemoDataProvider = DemoDataProvider;
