"use strict";
var layout_1 = require("../../viewUtils/layout");
var GREED_STEP = 150;
var GraphBuilder = (function () {
    function GraphBuilder(dataProvider) {
        this.dataProvider = dataProvider;
    }
    GraphBuilder.prototype.createGraph = function (graph) {
        var _this = this;
        return this.dataProvider.elementInfo({ elementIds: graph.elementIds }).then(function (elementsInfo) { return ({
            preloadedElements: elementsInfo,
            layoutData: _this.getLayout(elementsInfo, graph.links),
        }); });
    };
    GraphBuilder.prototype.getLayout = function (elementsInfo, linksInfo) {
        var keys = Object.keys(elementsInfo);
        var rows = Math.ceil(Math.sqrt(keys.length));
        var grid = layout_1.uniformGrid({ rows: rows, cellSize: { x: GREED_STEP, y: GREED_STEP } });
        var layoutElements = keys.map(function (key, index) {
            var element = elementsInfo[key];
            var _a = grid(index), x = _a.x, y = _a.y;
            return {
                id: element.id,
                type: 'element',
                position: { x: x, y: y },
            };
        });
        var layoutLinks = linksInfo.map(function (link, index) {
            return {
                id: 'link_' + index,
                typeId: link.linkTypeId,
                type: 'link',
                source: { id: link.sourceId },
                target: { id: link.targetId },
            };
        });
        return { cells: layoutElements.concat(layoutLinks) };
    };
    return GraphBuilder;
}());
exports.GraphBuilder = GraphBuilder;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GraphBuilder;
