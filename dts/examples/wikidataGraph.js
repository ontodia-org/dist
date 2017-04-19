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
    var diagram = workspace.getDiagram();
    diagram.registerTemplateResolver(function (types) {
        if (types.indexOf('http://www.wikidata.org/entity/Q43229') !== -1) {
            return index_1.OrganizationTemplate;
        }
        else if (types.indexOf('http://www.wikidata.org/entity/Q5') !== -1) {
            return index_1.PersonTemplate;
        }
        else {
            return undefined;
        }
    });
    diagram.registerElementStyleResolver(function (types) {
        if (types.indexOf('http://www.wikidata.org/entity/Q43229') !== -1) {
            return { color: '#77ca98', icon: 'ontodia-organization-icon' };
        }
        else if (types.indexOf('http://www.wikidata.org/entity/Q5') !== -1) {
            return { color: '#eb7777', icon: 'ontodia-person-icon' };
        }
        else {
            return undefined;
        }
    });
    var model = workspace.getModel();
    model.graph.on('action:iriClick', function (iri) {
        window.open(iri);
        console.log(iri);
    });
    var dataProvider = new index_1.SparqlDataProvider({
        endpointUrl: '/sparql-endpoint',
        imagePropertyUris: [
            'http://www.wikidata.org/prop/direct/P18',
            'http://www.wikidata.org/prop/direct/P154',
        ],
    }, index_1.WikidataSettings);
    var graphBuilder = new index_1.SparqlGraphBuilder(dataProvider);
    var loadingGraph = graphBuilder.getGraphFromConstruct("\n        CONSTRUCT { ?current ?p ?o. }\n        WHERE {\n            {\n            ?current ?p ?o.\n            ?p <http://www.w3.org/2000/01/rdf-schema#label> ?label.\n            FILTER(ISIRI(?o))\n            FILTER exists{?o ?p1 ?o2}\n            }\n        }\n        LIMIT 20\n        VALUES (?current) {\n            (<http://www.wikidata.org/entity/Q567>)\n        }");
    workspace.showWaitIndicatorWhile(loadingGraph);
    loadingGraph.then(function (_a) {
        var layoutData = _a.layoutData, preloadedElements = _a.preloadedElements;
        return model.importLayout({ layoutData: layoutData, preloadedElements: preloadedElements, dataProvider: dataProvider });
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
