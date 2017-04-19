"use strict";
require("whatwg-fetch");
var N3 = require("n3");
var responseHandler_1 = require("./responseHandler");
var sparqlDataProviderSettings_1 = require("./sparqlDataProviderSettings");
var SparqlQueryMethod;
(function (SparqlQueryMethod) {
    SparqlQueryMethod[SparqlQueryMethod["GET"] = 1] = "GET";
    SparqlQueryMethod[SparqlQueryMethod["POST"] = 2] = "POST";
})(SparqlQueryMethod = exports.SparqlQueryMethod || (exports.SparqlQueryMethod = {}));
var SparqlDataProvider = (function () {
    function SparqlDataProvider(options, settings) {
        if (settings === void 0) { settings = sparqlDataProviderSettings_1.OWLStatsSettings; }
        this.options = options;
        this.settings = settings;
        this.dataLabelProperty = options.labelProperty ? options.labelProperty : settings.dataLabelProperty;
    }
    SparqlDataProvider.prototype.classTree = function () {
        var query = this.settings.defaultPrefix + this.settings.classTreeQuery;
        return this.executeSparqlQuery(query).then(responseHandler_1.getClassTree);
    };
    SparqlDataProvider.prototype.propertyInfo = function (params) {
        var ids = params.propertyIds.map(escapeIri).map(function (id) { return " ( " + id + " )"; }).join(' ');
        var query = this.settings.defaultPrefix + ("\n            SELECT ?prop ?label\n            WHERE {\n                ?prop " + this.settings.schemaLabelProperty + " ?label.\n                VALUES (?prop) {" + ids + "}.\n            }\n        ");
        return this.executeSparqlQuery(query).then(responseHandler_1.getPropertyInfo);
    };
    SparqlDataProvider.prototype.classInfo = function (params) {
        var ids = params.classIds.map(escapeIri).map(function (id) { return " ( " + id + " )"; }).join(' ');
        var query = this.settings.defaultPrefix + ("\n            SELECT ?class ?label ?instcount\n            WHERE {\n                ?class " + this.settings.schemaLabelProperty + " ?label.\n                VALUES (?class) {" + ids + "}.\n                BIND(\"\" as ?instcount)\n            }\n        ");
        return this.executeSparqlQuery(query).then(responseHandler_1.getClassInfo);
    };
    SparqlDataProvider.prototype.linkTypesInfo = function (params) {
        var ids = params.linkTypeIds.map(escapeIri).map(function (id) { return " ( " + id + " )"; }).join(' ');
        var query = this.settings.defaultPrefix + ("\n            SELECT ?typeId ?label ?instcount\n            WHERE {\n                ?typeId " + this.settings.schemaLabelProperty + " ?label.\n                VALUES (?typeId) {" + ids + "}.\n                BIND(\"\" as ?instcount)      \n            }\n        ");
        return this.executeSparqlQuery(query).then(responseHandler_1.getLinkTypesInfo);
    };
    SparqlDataProvider.prototype.linkTypes = function () {
        var query = this.settings.defaultPrefix + ("\n            SELECT ?link ?instcount ?label\n            WHERE {\n                  " + this.settings.linkTypesPattern + "\n                  OPTIONAL {?link " + this.settings.schemaLabelProperty + " ?label.}\n            }\n        ");
        return this.executeSparqlQuery(query).then(responseHandler_1.getLinkTypes);
    };
    SparqlDataProvider.prototype.elementInfo = function (params) {
        var _this = this;
        var ids = params.elementIds.map(escapeIri).map(function (id) { return " (" + id + ")"; }).join(' ');
        var query = this.settings.defaultPrefix
            + resolveTemplate(this.settings.elementInfoQuery, { ids: ids, dataLabelProperty: this.dataLabelProperty });
        return this.executeSparqlQuery(query)
            .then(function (elementsInfo) { return responseHandler_1.getElementsInfo(elementsInfo, params.elementIds); })
            .then(function (elementModels) {
            if (_this.options.prepareImages) {
                return _this.prepareElementsImage(elementModels);
            }
            else if (_this.options.imagePropertyUris && _this.options.imagePropertyUris.length) {
                return _this.enrichedElementsInfo(elementModels, _this.options.imagePropertyUris);
            }
            else {
                return elementModels;
            }
        });
    };
    SparqlDataProvider.prototype.enrichedElementsInfo = function (elementsInfo, types) {
        var ids = Object.keys(elementsInfo).map(escapeIri).map(function (id) { return " ( " + id + " )"; }).join(' ');
        var typesString = types.map(escapeIri).map(function (id) { return " ( " + id + " )"; }).join(' ');
        var query = this.settings.defaultPrefix + ("\n            SELECT ?inst ?linkType ?image\n            WHERE {{\n                VALUES (?inst) {" + ids + "}\n                VALUES (?linkType) {" + typesString + "} \n                " + this.settings.imageQueryPattern + "\n            }}\n        ");
        return this.executeSparqlQuery(query)
            .then(function (imageResponse) { return responseHandler_1.getEnrichedElementsInfo(imageResponse, elementsInfo); }).catch(function (err) {
            console.log(err);
            return elementsInfo;
        });
    };
    SparqlDataProvider.prototype.prepareElementsImage = function (elementsInfo) {
        return this.options.prepareImages(elementsInfo).then(function (images) {
            for (var key in images) {
                if (images.hasOwnProperty(key) && elementsInfo[key]) {
                    elementsInfo[key].image = images[key];
                }
            }
            return elementsInfo;
        });
    };
    SparqlDataProvider.prototype.linksInfo = function (params) {
        var ids = params.elementIds.map(escapeIri).map(function (id) { return " ( " + id + " )"; }).join(' ');
        var query = this.settings.defaultPrefix + ("\n            SELECT ?source ?type ?target\n            WHERE {\n                ?source ?type ?target.\n                VALUES (?source) {" + ids + "}\n                VALUES (?target) {" + ids + "}                \n            }\n        ");
        return this.executeSparqlQuery(query).then(responseHandler_1.getLinksInfo);
    };
    SparqlDataProvider.prototype.linkTypesOf = function (params) {
        var elementIri = escapeIri(params.elementId);
        var query = this.settings.defaultPrefix
            + resolveTemplate(this.settings.linkTypesOfQuery, { elementIri: elementIri });
        return this.executeSparqlQuery(query).then(responseHandler_1.getLinksTypesOf);
    };
    ;
    SparqlDataProvider.prototype.linkElements = function (params) {
        // for sparql we have rich filtering features and we just reuse filter.
        return this.filter({
            refElementId: params.elementId,
            refElementLinkId: params.linkId,
            linkDirection: params.direction,
            limit: params.limit,
            offset: params.offset,
            languageCode: ''
        });
    };
    SparqlDataProvider.prototype.filter = function (params) {
        if (params.limit === 0) {
            params.limit = 100;
        }
        if (!params.refElementId && params.refElementLinkId) {
            throw new Error("Can't execute refElementLink filter without refElement");
        }
        var refQueryPart = createRefQueryPart({
            elementId: params.refElementId,
            linkId: params.refElementLinkId,
            direction: params.linkDirection
        });
        var elementTypePart;
        if (params.elementTypeId) {
            var elementTypeIri = escapeIri(params.elementTypeId);
            elementTypePart = resolveTemplate(this.settings.filterTypePattern, { elementTypeIri: elementTypeIri });
        }
        else {
            elementTypePart = '';
        }
        var textSearchPart;
        if (params.text) {
            var text = params.text;
            textSearchPart = resolveTemplate(this.settings.fullTextSearch.queryPattern, { text: text, dataLabelProperty: this.dataLabelProperty });
        }
        else {
            textSearchPart = '';
        }
        var query = this.settings.defaultPrefix + "\n            " + this.settings.fullTextSearch.prefix + "\n            \n        SELECT ?inst ?class ?label\n        WHERE {\n            {\n                SELECT DISTINCT ?inst ?score WHERE {\n                    " + elementTypePart + "\n                    " + refQueryPart + "\n                    " + textSearchPart + "\n                    " + this.settings.filterAdditionalRestriction + "\n                    " + (this.settings.fullTextSearch.extractLabel ? sparqlExtractLabel('?inst', '?extractedLabel') : '') + "\n                } ORDER BY DESC(?score) LIMIT " + params.limit + " OFFSET " + params.offset + "\n            }\n            " + resolveTemplate(this.settings.filterElementInfoPattern, { dataLabelProperty: this.dataLabelProperty }) + "\n        } ORDER BY DESC(?score)\n        ";
        return this.executeSparqlQuery(query).then(responseHandler_1.getFilteredData);
    };
    ;
    SparqlDataProvider.prototype.executeSparqlQuery = function (query) {
        var method = this.options.queryMethod ? this.options.queryMethod : SparqlQueryMethod.GET;
        return executeSparqlQuery(this.options.endpointUrl, query, method);
    };
    SparqlDataProvider.prototype.executeSparqlConstruct = function (query) {
        var method = this.options.queryMethod ? this.options.queryMethod : SparqlQueryMethod.GET;
        return executeSparqlConstruct(this.options.endpointUrl, query, method);
    };
    return SparqlDataProvider;
}());
exports.SparqlDataProvider = SparqlDataProvider;
function resolveTemplate(template, values) {
    var result = template;
    for (var replaceKey in values) {
        var replaceValue = values[replaceKey];
        result = result.replace(new RegExp('\\${' + replaceKey + '}', 'g'), replaceValue);
    }
    return result;
}
function executeSparqlQuery(endpoint, query, method) {
    var internalQuery;
    if (method == SparqlQueryMethod.GET) {
        internalQuery = queryInternal({
            url: endpoint + "?query=" + encodeURIComponent(query),
            body: null,
            headers: {
                'Accept': 'application/sparql-results+json',
            },
            method: 'GET',
        });
    }
    else {
        internalQuery = queryInternal({
            url: endpoint,
            body: query,
            headers: {
                'Accept': 'application/sparql-results+json',
                'Content-Type': 'application/sparql-query',
            },
            method: 'POST',
        });
    }
    return internalQuery.then(function (response) {
        if (response.ok) {
            return response.json();
        }
        else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    });
}
exports.executeSparqlQuery = executeSparqlQuery;
;
function executeSparqlConstruct(endpoint, query, method) {
    var internalQuery;
    if (method == SparqlQueryMethod.GET) {
        internalQuery = queryInternal({
            url: endpoint + "?query=" + encodeURIComponent(query),
            body: null,
            headers: {
                'Accept': 'text/turtle',
            },
            method: 'GET',
        });
    }
    else {
        internalQuery = queryInternal({
            url: endpoint,
            body: query,
            headers: {
                'Accept': 'text/turtle',
                'Content-Type': 'application/sparql-query',
            },
            method: 'POST',
        });
    }
    return new Promise(function (resolve, reject) {
        internalQuery.then(function (response) {
            if (response.ok) {
                return response.text();
            }
            else {
                var error = new Error(response.statusText);
                error.response = response;
                throw error;
            }
        }).then(function (turtleText) {
            var triples = [];
            N3.Parser().parse(turtleText, function (error, triple, hash) {
                if (triple) {
                    triples.push({
                        subject: toRdfNode(triple.subject),
                        predicate: toRdfNode(triple.predicate),
                        object: toRdfNode(triple.object),
                    });
                }
                else {
                    resolve(triples);
                }
            });
        });
    });
}
exports.executeSparqlConstruct = executeSparqlConstruct;
function toRdfNode(entity) {
    if (entity.length >= 2 && entity[0] === '"' && entity[entity.length - 1] === '"') {
        return { type: 'literal', value: entity.substring(1, entity.length - 1), 'xml:lang': '' };
    }
    else {
        return { type: 'uri', value: entity };
    }
}
function queryInternal(params) {
    return fetch(params.url, {
        method: params.method,
        body: params.body,
        credentials: 'same-origin',
        mode: 'cors',
        cache: 'default',
        headers: params.headers,
    });
}
function sparqlExtractLabel(subject, label) {
    return "\n        BIND ( str( " + subject + " ) as ?uriStr)\n        BIND ( strafter(?uriStr, \"#\") as ?label3)\n        BIND ( strafter(strafter(?uriStr, \"//\"), \"/\") as ?label6) \n        BIND ( strafter(?label6, \"/\") as ?label5)   \n        BIND ( strafter(?label5, \"/\") as ?label4)   \n        BIND (if (?label3 != \"\", ?label3, \n            if (?label4 != \"\", ?label4, \n            if (?label5 != \"\", ?label5, ?label6))) as " + label + ")\n    ";
}
;
function escapeIri(iri) {
    return "<" + iri + ">";
}
function createRefQueryPart(params) {
    var refQueryPart = '';
    var refElementIRI = escapeIri(params.elementId);
    var refElementLinkIRI = params.linkId ? escapeIri(params.linkId) : undefined;
    // link to element with specified link type
    // if direction is not specified, provide both patterns and union them
    // FILTER ISIRI is used to prevent blank nodes appearing in results
    if (params.elementId && params.linkId) {
        refQueryPart += !params.direction || params.direction === 'out' ? "{ " + refElementIRI + " " + refElementLinkIRI + " ?inst . FILTER ISIRI(?inst)}" : '';
        refQueryPart += !params.direction ? ' UNION ' : '';
        refQueryPart += !params.direction || params.direction === 'in' ? "{  ?inst " + refElementLinkIRI + " " + refElementIRI + " . FILTER ISIRI(?inst)}" : '';
    }
    // all links to current element
    if (params.elementId && !params.linkId) {
        refQueryPart += !params.direction || params.direction === 'out' ? "{ " + refElementIRI + " ?link ?inst . FILTER ISIRI(?inst)}" : '';
        refQueryPart += !params.direction ? ' UNION ' : '';
        refQueryPart += !params.direction || params.direction === 'in' ? "{  ?inst ?link " + refElementIRI + " . FILTER ISIRI(?inst)}" : '';
    }
    return refQueryPart;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SparqlDataProvider;
