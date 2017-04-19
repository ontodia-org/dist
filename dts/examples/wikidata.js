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
        //using default template for country as a temporary solution
        if (types.indexOf('http://www.wikidata.org/entity/Q6256') !== -1) {
            return index_1.DefaultElementTemplate;
        }
        else if (types.indexOf('http://www.wikidata.org/entity/Q43229') !== -1) {
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
        if (types.indexOf('http://www.wikidata.org/entity/Q6256') !== -1) {
            return { color: '#77ca98', icon: 'ontodia-country-icon' };
        }
        else if (types.indexOf('http://www.wikidata.org/entity/Q43229') !== -1) {
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
    var layoutData = common_1.tryLoadLayoutFromLocalStorage();
    var dataProvider = new index_1.SparqlDataProvider({
        endpointUrl: '/sparql-endpoint',
        imagePropertyUris: [
            'http://www.wikidata.org/prop/direct/P18',
            'http://www.wikidata.org/prop/direct/P154',
        ],
        queryMethod: index_1.SparqlQueryMethod.POST,
    }, index_1.WikidataSettings);
    model.importLayout({ layoutData: layoutData, dataProvider: dataProvider, validateLinks: true });
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
