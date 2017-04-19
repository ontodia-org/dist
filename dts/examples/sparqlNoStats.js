"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
                'http://www.researchspace.org/ontology/PX_has_main_representation',
                'http://xmlns.com/foaf/0.1/img',
            ],
        }, __assign({}, index_1.OWLRDFSSettings, {
            defaultPrefix: index_1.OWLRDFSSettings.defaultPrefix + "\nPREFIX rso: <http://www.researchspace.org/ontology/>",
            dataLabelProperty: "rso:displayLabel",
            ftsSettings: {
                ftsPrefix: 'PREFIX bds: <http://www.bigdata.com/rdf/search#>' + '\n',
                ftsQueryPattern: " \n              ?inst rso:displayLabel ?searchLabel. \n              SERVICE bds:search {\n                     ?searchLabel bds:search \"${text}*\" ;\n                                  bds:minRelevance '0.5' ;\n                                  \n                                  bds:matchAllTerms 'true';\n                                  bds:relevance ?score.\n              }\n            "
            },
            elementInfoQuery: "\n            SELECT ?inst ?class ?label ?propType ?propValue\n            WHERE {\n                OPTIONAL {?inst rdf:type ?class . }\n                OPTIONAL {?inst ${dataLabelProperty} ?label}\n                OPTIONAL {?inst ?propType ?propValue.\n                FILTER (isLiteral(?propValue)) }\n\t\t\t    VALUES (?labelProp) { (rso:displayLabel) (rdfs:label) }\n            } VALUES (?inst) {${ids}}\n        ",
        })),
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
