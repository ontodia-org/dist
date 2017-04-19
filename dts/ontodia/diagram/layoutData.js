"use strict";
var lodash_1 = require("lodash");
var serializedCellProperties = [
    'id', 'type',
    'size', 'angle', 'isExpanded', 'position',
    'typeId', 'source', 'target', 'vertices',
];
function normalizeImportedCell(cell) {
    var newCell = lodash_1.pick(cell, serializedCellProperties);
    if (newCell.type === 'Ontodia.Element') {
        newCell.type = 'element';
    }
    return newCell;
}
exports.normalizeImportedCell = normalizeImportedCell;
function cleanExportedLayout(layout) {
    var cells = layout.cells.map(function (cell) { return lodash_1.pick(cell, serializedCellProperties); });
    return { cells: cells };
}
exports.cleanExportedLayout = cleanExportedLayout;
