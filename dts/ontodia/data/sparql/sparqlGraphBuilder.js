"use strict";
var graphBuilder_1 = require("./graphBuilder");
var DEFAULT_PREFIX = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n PREFIX owl:  <http://www.w3.org/2002/07/owl#>" + '\n\n';
var SparqlGraphBuilder = (function () {
    function SparqlGraphBuilder(dataProvider) {
        this.dataProvider = dataProvider;
        this.graphBuilder = new graphBuilder_1.GraphBuilder(dataProvider);
    }
    SparqlGraphBuilder.prototype.getGraphFromConstruct = function (constructQuery) {
        var _this = this;
        var query = DEFAULT_PREFIX + constructQuery;
        return this.dataProvider.executeSparqlConstruct(query)
            .then(function (graph) { return _this.getGraphFromRDFGraph(graph); });
    };
    ;
    SparqlGraphBuilder.prototype.getGraphFromRDFGraph = function (graph) {
        var _a = this.getConstructElements(graph), elementIds = _a.elementIds, links = _a.links;
        return this.graphBuilder.createGraph({ elementIds: elementIds, links: links });
    };
    ;
    SparqlGraphBuilder.prototype.getConstructElements = function (response) {
        var elements = {};
        var links = [];
        for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
            var _a = response_1[_i], subject = _a.subject, predicate = _a.predicate, object = _a.object;
            if (subject.type === 'uri' && object.type === 'uri') {
                if (!elements[subject.value]) {
                    elements[subject.value] = true;
                }
                if (!elements[object.value]) {
                    elements[object.value] = true;
                }
                links.push({
                    linkTypeId: predicate.value,
                    sourceId: subject.value,
                    targetId: object.value,
                });
            }
        }
        return { elementIds: Object.keys(elements), links: links };
    };
    return SparqlGraphBuilder;
}());
exports.SparqlGraphBuilder = SparqlGraphBuilder;
