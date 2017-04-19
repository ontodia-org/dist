"use strict";
var cola = require("webcola");
function forceLayout(params) {
    var layout = new cola.Layout()
        .nodes(params.nodes)
        .links(params.links)
        .convergenceThreshold(1e-9)
        .jaccardLinkLengths(params.preferredLinkLength)
        .handleDisconnected(true);
    layout.start(30, 0, 10, undefined, false);
}
exports.forceLayout = forceLayout;
function removeOverlaps(nodes) {
    var nodeRectangles = [];
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        nodeRectangles.push(new cola.vpsc.Rectangle(node.x, node.x + node.width, node.y, node.y + node.height));
    }
    cola.vpsc.removeOverlaps(nodeRectangles);
    for (var i = 0; i < nodeRectangles.length; i++) {
        var node = nodes[i];
        var rectangle = nodeRectangles[i];
        node.x = rectangle.x;
        node.y = rectangle.y;
    }
}
exports.removeOverlaps = removeOverlaps;
function translateToPositiveQuadrant(params) {
    var minX = Infinity, minY = Infinity;
    for (var _i = 0, _a = params.nodes; _i < _a.length; _i++) {
        var node = _a[_i];
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
    }
    var _b = params.padding, padding = _b === void 0 ? { x: 0, y: 0 } : _b;
    for (var _c = 0, _d = params.nodes; _c < _d.length; _c++) {
        var node = _d[_c];
        node.x = node.x - minX + padding.x;
        node.y = node.y - minY + padding.y;
    }
}
exports.translateToPositiveQuadrant = translateToPositiveQuadrant;
function translateToCenter(params) {
    var paperSize = params.paperSize, contentBBox = params.contentBBox;
    var graphPos = {
        x: (paperSize.width - contentBBox.width) / 2 - contentBBox.x,
        y: (paperSize.height - contentBBox.height) / 2 - contentBBox.y,
    };
    for (var _i = 0, _a = params.nodes; _i < _a.length; _i++) {
        var node = _a[_i];
        node.x = graphPos.x + node.x;
        node.y = graphPos.y + node.y;
    }
}
exports.translateToCenter = translateToCenter;
function uniformGrid(params) {
    return function (cellIndex) {
        var row = Math.floor(cellIndex / params.rows);
        var column = cellIndex - row * params.rows;
        return {
            x: column * params.cellSize.x,
            y: row * params.cellSize.y,
            width: params.cellSize.x,
            height: params.cellSize.y,
        };
    };
}
exports.uniformGrid = uniformGrid;
function padded(nodes, padding, transform) {
    if (padding) {
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var node = nodes_2[_i];
            node.x -= padding.x;
            node.y -= padding.y;
            node.width += 2 * padding.x;
            node.height += 2 * padding.y;
        }
    }
    transform();
    if (padding) {
        for (var _a = 0, nodes_3 = nodes; _a < nodes_3.length; _a++) {
            var node = nodes_3[_a];
            node.x += padding.x;
            node.y += padding.y;
            node.width -= 2 * padding.x;
            node.height -= 2 * padding.y;
        }
    }
}
exports.padded = padded;
function flowLayout(params) {
    var layout = new cola.Layout()
        .nodes(params.nodes)
        .links(params.links)
        .avoidOverlaps(true)
        .flowLayout('x', params.preferredLinkLength)
        .jaccardLinkLengths(params.preferredLinkLength);
    layout.start(30, 0, 10, undefined, false);
    for (var _i = 0, _a = params.nodes; _i < _a.length; _i++) {
        var node = _a[_i];
        node.innerBounds = node.bounds.inflate(-50);
    }
    layout.prepareEdgeRouting(50 / 3);
    for (var _b = 0, _c = params.links; _b < _c.length; _b++) {
        var link = _c[_b];
        params.route(link, layout.routeEdge(link, undefined));
    }
}
exports.flowLayout = flowLayout;
