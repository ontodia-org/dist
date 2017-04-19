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
    var endpointUrl = '/sparql-endpoint';
    var sparqlDataProvider = new index_1.SparqlDataProvider({ endpointUrl: endpointUrl, queryMethod: index_1.SparqlQueryMethod.GET }, index_1.OWLStatsSettings);
    var graphBuilder = new index_1.SparqlGraphBuilder(sparqlDataProvider);
    var loadingGraph = graphBuilder.getGraphFromConstruct("CONSTRUCT {\n            ?inst rdf:type ?class.\n            ?inst ?propType1 ?propValue1.\n            ?inst rdfs:label ?label .\n            ?propValue2 ?propType2 ?inst .\n        } WHERE {\n            BIND (<http://collection.britishmuseum.org/id/object/JCF8939> as ?inst)\n            ?inst rdf:type ?class.\t\n            OPTIONAL {?inst rdfs:label ?label}\n            OPTIONAL {?inst ?propType1 ?propValue1.  FILTER(isURI(?propValue1)). }  \t\n            OPTIONAL {?propValue2 ?propType2 ?inst.  FILTER(isURI(?propValue2)). }  \n        } LIMIT 100");
    workspace.showWaitIndicatorWhile(loadingGraph);
    loadingGraph.then(function (_a) {
        var layoutData = _a.layoutData, preloadedElements = _a.preloadedElements;
        return model.importLayout({
            layoutData: layoutData,
            preloadedElements: preloadedElements,
            dataProvider: sparqlDataProvider,
        });
    }).then(function () {
        workspace.forceLayout();
        workspace.zoomToFit();
    });
}
var props = {
    ref: onWorkspaceMounted,
    onSaveDiagram: function (workspace) {
        var layout = workspace.getModel().exportLayout();
        console.log(layout);
    },
};
common_1.onPageLoad(function (container) { return ReactDOM.render(react_1.createElement(index_1.Workspace, props), container); });
