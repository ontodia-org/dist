"use strict";
var react_1 = require("react");
var ReactDOM = require("react-dom");
var index_1 = require("../index");
var common_1 = require("./common");
require('jointjs/css/layout.css');
require('jointjs/css/themes/default.css');
function onWorkspaceMounted(workspace) {
    if (!workspace) {
        return;
    }
    var model = workspace.getModel();
    model.graph.on('action:iriClick', function (iri) { return console.log(iri); });
    var layoutData = common_1.tryLoadLayoutFromLocalStorage();
    model.importLayout({ layoutData: layoutData, dataProvider: new index_1.DemoDataProvider(), validateLinks: true });
}
var props = {
    ref: onWorkspaceMounted,
    onSaveDiagram: function (workspace) {
        var layoutData = workspace.getModel().exportLayout().layoutData;
        window.location.hash = common_1.saveLayoutToLocalStorage(layoutData);
        window.location.reload();
    },
};
common_1.onPageLoad(function (container) { return ReactDOM.render(react_1.createElement(index_1.Workspace, props), container); });
