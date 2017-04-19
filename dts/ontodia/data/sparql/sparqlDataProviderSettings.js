"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.WikidataSettings = {
    defaultPrefix: "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n PREFIX wd: <http://www.wikidata.org/entity/>\n PREFIX owl:  <http://www.w3.org/2002/07/owl#>\n\n",
    schemaLabelProperty: 'rdfs:label',
    dataLabelProperty: 'rdfs:label',
    fullTextSearch: {
        prefix: 'PREFIX bds: <http://www.bigdata.com/rdf/search#>' + '\n',
        queryPattern: " \n              ?inst rdfs:label ?searchLabel. \n              SERVICE bds:search {\n                     ?searchLabel bds:search \"${text}*\" ;\n                                  bds:minRelevance '0.5' ;\n                                  bds:matchAllTerms 'true' .\n              }\n              BIND(IF(STRLEN(?strInst) > 33,\n                            0-<http://www.w3.org/2001/XMLSchema#integer>(SUBSTR(?strInst, 33)),\n                            -10000) as ?score)\n            ",
    },
    classTreeQuery: "\n            SELECT distinct ?class ?label ?parent WHERE {\n              ?class rdfs:label ?label.                            \n              { ?class wdt:P279 wd:Q35120. }\n                UNION \n              { ?parent wdt:P279 wd:Q35120.\n                ?class wdt:P279 ?parent. }\n                UNION \n              { ?parent wdt:P279/wdt:P279 wd:Q35120.\n                ?class wdt:P279 ?parent. }\n            }\n        ",
    // todo: think more, maybe add a limit here?
    linkTypesPattern: "?link wdt:P279* wd:Q18616576.\n    BIND(0 as ?instcount)\n",
    elementInfoQuery: "\n            SELECT ?inst ?class ?label ?propType ?propValue\n            WHERE {\n                OPTIONAL {\n                    { ?inst wdt:P31 ?class } UNION\n                    { ?inst wdt:P31 ?realClass .\n                        ?realClass wdt:P279 | wdt:P279/wdt:P279 ?class }\n                }\n                OPTIONAL {?inst rdfs:label ?label}\n                OPTIONAL {\n                    ?inst ?propType ?propValue .\n                    FILTER (isLiteral(?propValue))\n                }\n            } VALUES (?inst) {${ids}}\n        ",
    imageQueryPattern: " { ?inst ?linkType ?fullImage } union { ?inst wdt:P163/wdt:P18 ?fullImage }\n                BIND(CONCAT(\"https://commons.wikimedia.org/w/thumb.php?f=\",\n                    STRAFTER(STR(?fullImage), \"Special:FilePath/\"), \"&w=200\") AS ?image)",
    linkTypesOfQuery: "\n        SELECT ?link (count(distinct ?object) as ?instcount)\n        WHERE {\n            { ${elementIri} ?link ?object }\n            UNION { ?object ?link ${elementIri} }\n            #this is to prevent some junk appear on diagram, but can really slow down execution on complex objects\n            FILTER ISIRI(?object)\n            FILTER exists {?object ?someprop ?someobj}\n            FILTER regex(STR(?link), \"direct\")                \n        } GROUP BY ?link\n    ",
    filterRefElementLinkPattern: 'FILTER regex(STR(?link), "direct")',
    filterTypePattern: "?inst wdt:P31 ?instType. ?instType wdt:P279* ${elementTypeIri} . " + '\n',
    filterAdditionalRestriction: "FILTER ISIRI(?inst)\n                        BIND(STR(?inst) as ?strInst)\n                        FILTER exists {?inst ?someprop ?someobj}\n",
    filterElementInfoPattern: "OPTIONAL {?inst wdt:P31 ?foundClass}\n                BIND (coalesce(?foundClass, owl:Thing) as ?class)\n                OPTIONAL {?inst rdfs:label ?label}\n",
};
exports.OWLRDFSSettings = {
    defaultPrefix: "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n PREFIX owl:  <http://www.w3.org/2002/07/owl#> \n\n",
    schemaLabelProperty: 'rdfs:label',
    dataLabelProperty: 'rdfs:label',
    fullTextSearch: {
        prefix: '',
        queryPattern: " OPTIONAL {?inst ${dataLabelProperty} ?search1}\n        FILTER regex(COALESCE(str(?search1), str(?extractedLabel)), \"${text}\", \"i\")\n        BIND(0 as ?score)\n",
        extractLabel: true,
    },
    classTreeQuery: "\n            SELECT ?class ?label ?parent\n            WHERE {\n                {\n                    ?class a rdfs:Class\n                } UNION {\n                    ?class a owl:Class\n                }\n                OPTIONAL { ?class rdfs:label ?label.}\n                OPTIONAL {?class rdfs:subClassOf ?parent}\n            }\n        ",
    // todo: think more, maybe add a limit here?
    linkTypesPattern: "{\t?link a rdf:Property\n                    } UNION {\n                    ?link a owl:ObjectProperty\n                }\n                BIND('' as ?instcount)\n",
    elementInfoQuery: "\n            SELECT ?inst ?class ?label ?propType ?propValue\n            WHERE {\n                OPTIONAL {?inst rdf:type ?class . }\n                OPTIONAL {?inst ${dataLabelProperty} ?label}\n                OPTIONAL {?inst ?propType ?propValue.\n                FILTER (isLiteral(?propValue)) }\n            } VALUES (?inst) {${ids}}\n        ",
    imageQueryPattern: "{ ?inst ?linkType ?image } UNION { [] ?linkType ?inst. BIND(?inst as ?image) }",
    linkTypesOfQuery: "\n        SELECT ?link (count(distinct ?outObject) as ?outCount) (count(distinct ?inObject) as ?inCount) \n        WHERE {\n            { ${elementIri} ?link ?outObject FILTER ISIRI(?outObject)}\n            UNION \n              { ?inObject ?link ${elementIri} FILTER ISIRI(?inObject)}\n        } GROUP BY ?link\n    ",
    filterRefElementLinkPattern: '',
    filterTypePattern: "?inst rdf:type ${elementTypeIri} . " + '\n',
    filterElementInfoPattern: "OPTIONAL {?inst rdf:type ?foundClass}\n                BIND (coalesce(?foundClass, owl:Thing) as ?class)\n                OPTIONAL {?inst ${dataLabelProperty} ?label}",
    filterAdditionalRestriction: '',
};
exports.OWLStatsSettings = __assign({}, exports.OWLRDFSSettings, { classTreeQuery: "\n        SELECT ?class ?instcount ?label ?parent\n        WHERE {\n            {SELECT ?class (count(?inst) as ?instcount)\n                WHERE {\n                    ?inst rdf:type ?class.\n                } GROUP BY ?class } UNION\n            {\n                ?class rdf:type rdfs:Class\n            } UNION {\n                ?class rdf:type owl:Class\n            }\n            OPTIONAL { ?class rdfs:label ?label.}\n            OPTIONAL {?class rdfs:subClassOf ?parent}\n        }\n    " });
exports.DBPediaSettings = __assign({}, exports.OWLRDFSSettings, { fullTextSearch: {
        prefix: 'PREFIX dbo: <http://dbpedia.org/ontology/>\n',
        queryPattern: " \n              ?inst rdfs:label ?searchLabel.\n              ?searchLabel bif:contains \"${text}\".\n              ?inst dbo:wikiPageID ?origScore .\n              BIND(0-?origScore as ?score)\n            ",
    }, classTreeQuery: "\n        SELECT distinct ?class ?label ?parent WHERE {\n            ?class rdfs:label ?label.                            \n            OPTIONAL {?class rdfs:subClassOf ?parent}\n            ?root rdfs:subClassOf owl:Thing.\n            ?class rdfs:subClassOf? | rdfs:subClassOf/rdfs:subClassOf ?root\n        }\n        ", elementInfoQuery: "\n        SELECT ?inst ?class ?label ?propType ?propValue\n        WHERE {\n            ?inst rdf:type ?class . \n            ?inst rdfs:label ?label .\n            FILTER (!contains(str(?class), 'http://dbpedia.org/class/yago'))\n            OPTIONAL {?inst ?propType ?propValue.\n            FILTER (isLiteral(?propValue)) }\n        } VALUES (?inst) {${ids}}\n        ", filterElementInfoPattern: "\n        OPTIONAL {?inst rdf:type ?foundClass. FILTER (!contains(str(?foundClass), 'http://dbpedia.org/class/yago'))}\n        BIND (coalesce(?foundClass, owl:Thing) as ?class)\n        OPTIONAL {?inst ${dataLabelProperty} ?label}", imageQueryPattern: " { ?inst ?linkType ?fullImage } UNION { [] ?linkType ?inst. BIND(?inst as ?fullImage) }\n            BIND(CONCAT(\"https://commons.wikimedia.org/w/thumb.php?f=\",\n            STRAFTER(STR(?fullImage), \"Special:FilePath/\"), \"&w=200\") AS ?image)\n" });
