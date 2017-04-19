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
    model.graph.on('action:iriClick', function (iri) {
        window.open(iri);
        console.log(iri);
    });
    var layoutData = common_1.tryLoadLayoutFromLocalStorage();
    model.importLayout({
        layoutData: layoutData,
        validateLinks: true,
        dataProvider: new index_1.SparqlDataProvider({
            endpointUrl: '/sparql-endpoint',
            imagePropertyUris: [
                'http://collection.britishmuseum.org/id/ontology/PX_has_main_representation',
                'http://xmlns.com/foaf/0.1/img',
            ],
            queryMethod: index_1.SparqlQueryMethod.GET
        }, index_1.OWLStatsSettings),
    });
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
