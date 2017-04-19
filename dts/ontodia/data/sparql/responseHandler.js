"use strict";
var THING_URI = 'http://www.w3.org/2002/07/owl#Thing';
var LABEL_URI = 'http://www.w3.org/2000/01/rdf-schema#label';
function getClassTree(response) {
    var tree = [];
    var treeNodes = createClassMap(response.results.bindings);
    // createClassMap ensures we get both elements and parents and we can use treeNodes[treeNode.parent] safely
    for (var nodeId in treeNodes) {
        var treeNode = treeNodes[nodeId];
        if (treeNode.parent) {
            var parent_1 = treeNodes[treeNode.parent];
            parent_1.children.push(treeNode);
            parent_1.count += treeNode.count;
        }
        else {
            tree.push(treeNode);
        }
    }
    calcCounts(tree);
    return tree;
}
exports.getClassTree = getClassTree;
function createClassMap(sNodes) {
    var treeNodes = {};
    for (var _i = 0, sNodes_1 = sNodes; _i < sNodes_1.length; _i++) {
        var sNode = sNodes_1[_i];
        var sNodeId = sNode.class.value;
        var node = treeNodes[sNodeId];
        if (node) {
            if (sNode.label) {
                var label = node.label;
                if (label.values.length === 1 && !label.values[0].lang) {
                    label.values = [];
                }
                label.values.push(getLocalizedString(sNode.label));
            }
            if (!node.parent && sNode.parent) {
                node.parent = sNode.parent.value;
            }
        }
        else {
            node = getClassModel(sNode);
            treeNodes[sNodeId] = node;
        }
        //ensuring parent will always be there
        if (node.parent && !treeNodes[node.parent]) {
            treeNodes[node.parent] = getClassModel({ class: { value: node.parent, type: 'uri' } });
        }
    }
    return treeNodes;
}
function calcCounts(children) {
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var node = children_1[_i];
        // no more to count
        if (!node.children)
            return;
        // ensure all children have their counts completed;
        calcCounts(node.children);
        // we have to preserve no data here. If nor element nor childs have no count information,
        // we just pass NaN upwards.
        var childCount = node.children.reduce(function (acc, val) {
            // if val.count is not NaN, turn result into number
            return !isNaN(val.count) ? (!isNaN(acc) ? acc + val.count : val.count) : acc;
        }, NaN);
        node.count = !isNaN(childCount) ? (!isNaN(node.count) ? node.count + childCount : childCount) : node.count;
    }
}
function getClassInfo(response) {
    var classes = {};
    var _loop_1 = function (binding) {
        if (!binding.class) {
            return "continue";
        }
        var id = binding.class.value;
        var model = classes[id];
        if (model) {
            var newLabel_1 = getLocalizedString(binding.label);
            if (!model.label.values.some(function (label) { return isLocalizedEqual(label, newLabel_1); })) {
                model.label.values.push(newLabel_1);
            }
            var instanceCount = getInstCount(binding.instcount);
            if (!isNaN(instanceCount)) {
                model.count = Math.max(model.count, instanceCount);
            }
        }
        else {
            var label = getLocalizedString(binding.label);
            classes[id] = {
                id: id,
                children: [],
                label: { values: label ? [label] : [] },
                count: getInstCount(binding.instcount),
            };
        }
    };
    for (var _i = 0, _a = response.results.bindings; _i < _a.length; _i++) {
        var binding = _a[_i];
        _loop_1(binding);
    }
    var classesList = [];
    for (var id in classes) {
        if (!classes.hasOwnProperty(id)) {
            continue;
        }
        var model = classes[id];
        if (model.label.values.length === 0) {
            model.label.values.push(getLocalizedString(undefined, id));
        }
        classesList.push(model);
    }
    return classesList;
}
exports.getClassInfo = getClassInfo;
function getPropertyInfo(response) {
    var models = {};
    for (var _i = 0, _a = response.results.bindings; _i < _a.length; _i++) {
        var sProp = _a[_i];
        var model = getPropertyModel(sProp);
        models[model.id] = model;
    }
    return models;
}
exports.getPropertyInfo = getPropertyInfo;
function getLinkTypes(response) {
    var sInst = response.results.bindings;
    var linkTypes = [];
    var instancesMap = {};
    for (var _i = 0, sInst_1 = sInst; _i < sInst_1.length; _i++) {
        var sLink = sInst_1[_i];
        var sInstTypeId = sLink.link.value;
        if (instancesMap[sInstTypeId]) {
            if (sLink.label) {
                var label = instancesMap[sInstTypeId].label;
                if (label.values.length === 1 && !label.values[0].lang) {
                    label.values = [];
                }
                label.values.push(getLocalizedString(sLink.label));
            }
        }
        else {
            instancesMap[sInstTypeId] = getLinkTypeInfo(sLink);
            linkTypes.push(instancesMap[sInstTypeId]);
        }
    }
    return linkTypes;
}
exports.getLinkTypes = getLinkTypes;
function getElementsInfo(response, ids) {
    var sInstances = response.results.bindings;
    var instancesMap = {};
    for (var _i = 0, sInstances_1 = sInstances; _i < sInstances_1.length; _i++) {
        var sInst = sInstances_1[_i];
        var sInstTypeId = sInst.inst.value;
        if (instancesMap[sInstTypeId]) {
            enrichElement(instancesMap[sInst.inst.value], sInst);
        }
        else {
            instancesMap[sInstTypeId] = getElementInfo(sInst);
        }
    }
    ;
    var proccesedIds = Object.keys(instancesMap);
    for (var _a = 0, ids_1 = ids; _a < ids_1.length; _a++) {
        var id = ids_1[_a];
        if (proccesedIds.indexOf(id) === -1) {
            instancesMap[id] = {
                id: id,
                label: { values: [getLocalizedString(undefined, id)] },
                types: [THING_URI],
                properties: {},
            };
        }
    }
    ;
    return instancesMap;
}
exports.getElementsInfo = getElementsInfo;
function getEnrichedElementsInfo(response, elementsInfo) {
    var respElements = response.results.bindings;
    for (var _i = 0, respElements_1 = respElements; _i < respElements_1.length; _i++) {
        var respEl = respElements_1[_i];
        var elementInfo = elementsInfo[respEl.inst.value];
        if (elementInfo) {
            elementInfo.image = respEl.image.value;
        }
    }
    return elementsInfo;
}
exports.getEnrichedElementsInfo = getEnrichedElementsInfo;
function getLinkTypesInfo(response) {
    var sparqlLinkTypes = response.results.bindings;
    return sparqlLinkTypes.map(function (sLinkType) { return getLinkTypeInfo(sLinkType); });
}
exports.getLinkTypesInfo = getLinkTypesInfo;
function getLinksInfo(response) {
    var sparqlLinks = response.results.bindings;
    return sparqlLinks.map(function (sLink) { return getLinkInfo(sLink); });
}
exports.getLinksInfo = getLinksInfo;
function getLinksTypesOf(response) {
    var sparqlLinkTypes = response.results.bindings;
    return sparqlLinkTypes.map(function (sLink) { return getLinkType(sLink); });
}
exports.getLinksTypesOf = getLinksTypesOf;
function getFilteredData(response) {
    var sInstances = response.results.bindings;
    var instancesMap = {};
    for (var _i = 0, sInstances_2 = sInstances; _i < sInstances_2.length; _i++) {
        var sInst = sInstances_2[_i];
        if (sInst.inst.type === 'literal') {
            continue;
        }
        if (!instancesMap[sInst.inst.value]) {
            instancesMap[sInst.inst.value] = getElementInfo(sInst);
        }
        else {
            enrichElement(instancesMap[sInst.inst.value], sInst);
        }
    }
    ;
    return instancesMap;
}
exports.getFilteredData = getFilteredData;
function enrichElement(element, sInst) {
    if (!element) {
        return;
    }
    if (sInst.label) {
        var localized_1 = getLocalizedString(sInst.label);
        var currentLabels = element.label.values;
        var isAutogeneratedLabel = currentLabels.length === 1 &&
            !currentLabels[0].lang && currentLabels[0].text === getNameFromId(element.id);
        if (isAutogeneratedLabel) {
            element.label.values = [localized_1];
        }
        else if (element.label.values.every(function (value) { return !isLocalizedEqual(value, localized_1); })) {
            element.label.values.push(localized_1);
        }
    }
    if (sInst.class && element.types.indexOf(sInst.class.value) < 0) {
        element.types.push(sInst.class.value);
    }
    if (sInst.propType && sInst.propType.value !== LABEL_URI) {
        var property = element.properties[sInst.propType.value];
        if (!property) {
            property = element.properties[sInst.propType.value] = {
                type: 'string',
                values: [],
            };
        }
        var propertyValue_1 = getPropertyValue(sInst.propValue);
        if (property.values.every(function (value) { return !isLocalizedEqual(value, propertyValue_1); })) {
            property.values.push(propertyValue_1);
        }
    }
}
exports.enrichElement = enrichElement;
function isLocalizedEqual(left, right) {
    return left.lang === right.lang && left.text === right.text;
}
function getNameFromId(id) {
    var sharpIndex = id.indexOf('#');
    if (sharpIndex !== -1) {
        return id.substring(sharpIndex + 1, id.length);
    }
    else {
        var tokens = id.split('/');
        return tokens[tokens.length - 1];
    }
}
exports.getNameFromId = getNameFromId;
function getLocalizedString(label, id) {
    if (label) {
        return {
            text: label.value,
            lang: label['xml:lang'],
        };
    }
    else if (id) {
        return {
            text: getNameFromId(id),
            lang: '',
        };
    }
    else {
        return undefined;
    }
}
exports.getLocalizedString = getLocalizedString;
function getInstCount(instcount) {
    return (instcount ? +instcount.value : NaN);
}
exports.getInstCount = getInstCount;
function getClassModel(node) {
    return {
        id: node.class.value,
        children: [],
        label: { values: [getLocalizedString(node.label, node.class.value)] },
        count: getInstCount(node.instcount),
        parent: node.parent ? node.parent.value : undefined
    };
}
exports.getClassModel = getClassModel;
function getPropertyModel(node) {
    return {
        id: node.prop.value,
        label: { values: [getLocalizedString(node.label, node.prop.value)] },
    };
}
exports.getPropertyModel = getPropertyModel;
function getLinkType(sLinkType) {
    return {
        id: sLinkType.link.value,
        inCount: getInstCount(sLinkType.inCount),
        outCount: getInstCount(sLinkType.outCount),
    };
}
exports.getLinkType = getLinkType;
function getPropertyValue(propValue) {
    if (!propValue) {
        return undefined;
    }
    return {
        lang: propValue['xml:lang'],
        text: propValue.value,
    };
}
exports.getPropertyValue = getPropertyValue;
function getElementInfo(sInfo) {
    var elementInfo = {
        id: sInfo.inst.value,
        label: { values: [getLocalizedString(sInfo.label, sInfo.inst.value)] },
        types: (sInfo.class ? [sInfo.class.value] : []),
        properties: {},
    };
    if (sInfo.propType && sInfo.propType.value !== LABEL_URI) {
        elementInfo.properties[sInfo.propType.value] = {
            type: 'string',
            values: [getPropertyValue(sInfo.propValue)],
        };
    }
    return elementInfo;
}
exports.getElementInfo = getElementInfo;
function getLinkInfo(sLinkInfo) {
    if (!sLinkInfo) {
        return undefined;
    }
    return {
        linkTypeId: sLinkInfo.type.value,
        sourceId: sLinkInfo.source.value,
        targetId: sLinkInfo.target.value,
    };
}
exports.getLinkInfo = getLinkInfo;
function getLinkTypeInfo(sLinkInfo) {
    if (!sLinkInfo) {
        return undefined;
    }
    return {
        id: sLinkInfo.link.value,
        label: { values: [getLocalizedString(sLinkInfo.label, sLinkInfo.link.value)] },
        count: getInstCount(sLinkInfo.instcount),
    };
}
exports.getLinkTypeInfo = getLinkTypeInfo;
