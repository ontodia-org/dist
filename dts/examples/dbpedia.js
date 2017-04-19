"use strict";
var react_1 = require("react");
var ReactDOM = require("react-dom");
var index_1 = require("../index");
var common_1 = require("./common");
var sparqlDataProvider_1 = require("../ontodia/data/sparql/sparqlDataProvider");
var sparqlDataProviderSettings_1 = require("../ontodia/data/sparql/sparqlDataProviderSettings");
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
            endpointUrl: 'http://dbpedia.org/sparql',
            imagePropertyUris: [
                'http://xmlns.com/foaf/0.1/depiction',
                'http://xmlns.com/foaf/0.1/img',
            ],
            queryMethod: sparqlDataProvider_1.SparqlQueryMethod.GET,
        }, sparqlDataProviderSettings_1.DBPediaSettings),
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
