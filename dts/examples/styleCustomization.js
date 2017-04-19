"use strict";
var react_1 = require("react");
var ReactDOM = require("react-dom");
var index_1 = require("../index");
var common_1 = require("./common");
require('jointjs/css/layout.css');
require('jointjs/css/themes/default.css');
var CUSTOM_LINK_STYLE = {
    connection: {
        stroke: '#3c4260',
        'stroke-width': 2,
    },
    markerSource: {
        fill: '#4b4a67',
        stroke: '#4b4a67',
        d: 'M0,3a3,3 0 1,0 6,0a3,3 0 1,0 -6,0',
        width: 6,
        height: 6,
    },
    markerTarget: {
        fill: '#4b4a67',
        stroke: '#4b4a67',
        d: 'm 20,5.88 -10.3,-5.95 0,5.6 -9.7,-5.6 0,11.82 9.7,-5.53 0,5.6 z',
        width: 20,
        height: 12,
    },
    labels: [{
            attrs: {
                text: { fill: '#3c4260' },
            },
        }],
    connector: { name: 'rounded' },
    router: { name: 'orthogonal' },
};
function onWorkspaceMounted(workspace) {
    if (!workspace) {
        return;
    }
    var model = workspace.getModel();
    model.graph.on('action:iriClick', function (iri) {
        console.log(iri);
    });
    var layoutData = common_1.tryLoadLayoutFromLocalStorage();
    model.importLayout({
        layoutData: layoutData,
        dataProvider: new index_1.SparqlDataProvider({
            endpointUrl: '/sparql-endpoint',
            imagePropertyUris: [
                'http://collection.britishmuseum.org/id/ontology/PX_has_main_representation',
                'http://xmlns.com/foaf/0.1/img',
            ],
        }),
    });
}
var props = {
    ref: onWorkspaceMounted,
    onSaveDiagram: function (workspace) {
        var layoutData = workspace.getModel().exportLayout().layoutData;
        window.location.hash = common_1.saveLayoutToLocalStorage(layoutData);
        window.location.reload();
    },
    viewOptions: {
        typeStyleResolvers: [
            function (types) {
                if (types.indexOf('http://www.w3.org/2000/01/rdf-schema#Class') !== -1) {
                    return { icon: 'glyphicon glyphicon-certificate' };
                }
                else if (types.indexOf('http://www.w3.org/2002/07/owl#Class') !== -1) {
                    return { icon: 'glyphicon glyphicon-certificate' };
                }
                else if (types.indexOf('http://www.w3.org/2002/07/owl#ObjectProperty') !== -1) {
                    return { icon: 'glyphicon glyphicon-cog' };
                }
                else if (types.indexOf('http://www.w3.org/2002/07/owl#DatatypeProperty') !== -1) {
                    return { color: '#046380' };
                }
                else {
                    return undefined;
                }
            },
        ],
        linkStyleResolvers: [
            function (type) {
                return CUSTOM_LINK_STYLE;
            },
        ],
    },
};
common_1.onPageLoad(function (container) { return ReactDOM.render(react_1.createElement(index_1.Workspace, props), container); });
