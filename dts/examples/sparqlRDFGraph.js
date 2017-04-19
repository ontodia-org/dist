"use strict";
var react_1 = require("react");
var ReactDOM = require("react-dom");
var index_1 = require("../index");
var common_1 = require("./common");
require('jointjs/css/layout.css');
require('jointjs/css/themes/default.css');
var GRAPH = [
    {
        subject: {
            'type': 'uri',
            'value': 'http://collection.britishmuseum.org/id/object/JCF8939',
        },
        predicate: {
            'type': 'uri',
            'value': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        object: {
            'type': 'uri',
            'value': 'http://www.cidoc-crm.org/cidoc-crm/E22_Man-Made_Object',
        },
    },
    {
        subject: {
            'type': 'uri',
            'value': 'http://collection.britishmuseum.org/id/object/JCF8939',
        },
        predicate: {
            'type': 'uri',
            'value': 'http://www.cidoc-crm.org/cidoc-crm/P43_has_dimension',
        },
        object: {
            'type': 'uri',
            'value': 'http://collection.britishmuseum.org/id/object/JCF8939/height/1',
        },
    },
    {
        subject: {
            'type': 'uri',
            'value': 'http://www.britishmuseum.org/collectionimages/AN00230/AN00230739_001_l.jpg/digiprocess',
        },
        predicate: {
            'type': 'uri',
            'value': 'http://www.ics.forth.gr/isl/CRMdig/L1_digitized',
        },
        object: {
            'type': 'uri',
            'value': 'http://collection.britishmuseum.org/id/object/JCF8939',
        },
    },
    {
        subject: {
            'type': 'uri',
            'value': 'http://collection.britishmuseum.org/id/object/JCF8939',
        },
        predicate: {
            'type': 'uri',
            'value': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        object: {
            'type': 'uri',
            'value': 'http://www.researchspace.org/ontology/Thing',
        },
    },
];
function onWorkspaceMounted(workspace) {
    if (!workspace) {
        return;
    }
    var model = workspace.getModel();
    var endpointUrl = '/sparql-endpoint';
    var sparqlDataProvider = new index_1.SparqlDataProvider({
        endpointUrl: endpointUrl,
        imagePropertyUris: ['http://collection.britishmuseum.org/id/ontology/PX_has_main_representation'],
    }, index_1.OWLStatsSettings);
    var graphBuilder = new index_1.SparqlGraphBuilder(sparqlDataProvider);
    var loadingGraph = graphBuilder.getGraphFromRDFGraph(GRAPH);
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
