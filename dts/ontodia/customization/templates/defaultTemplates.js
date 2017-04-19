"use strict";
var stringTemplates_1 = require("./stringTemplates");
exports.DefaultTemplateBundle = [
    function (types) {
        if (types.indexOf('http://www.w3.org/2000/01/rdf-schema#Class') !== -1) {
            return stringTemplates_1.BigIconTemplate;
        }
        else {
            return undefined;
        }
    },
    function (types) {
        if (types.indexOf('http://www.w3.org/2002/07/owl#Class') !== -1) {
            return stringTemplates_1.BigIconTemplate;
        }
        else {
            return undefined;
        }
    },
    function (types) {
        if (types.indexOf('http://www.w3.org/2002/07/owl#ObjectProperty') !== -1) {
            return stringTemplates_1.LeftBarTemplate;
        }
        else {
            return undefined;
        }
    },
    function (types) {
        if (types.indexOf('http://www.w3.org/2002/07/owl#DatatypeProperty') !== -1) {
            return stringTemplates_1.LeftBarTemplate;
        }
        else {
            return undefined;
        }
    },
    function (types) {
        if (types.indexOf('http://xmlns.com/foaf/0.1/Person') !== -1 ||
            types.indexOf('http://www.wikidata.org/entity/Q5') !== -1) {
            return stringTemplates_1.PersonTemplate;
        }
        else {
            return undefined;
        }
    },
    function (types) {
        if (types.indexOf('http://schema.org/Organization') !== -1 ||
            types.indexOf('http://dbpedia.org/ontology/Organisation') !== -1 ||
            types.indexOf('http://xmlns.com/foaf/0.1/Organization') !== -1) {
            return stringTemplates_1.OrganizationTemplate;
        }
        else {
            return undefined;
        }
    },
];
