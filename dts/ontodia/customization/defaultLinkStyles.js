"use strict";
var LINK_SUB_CLASS_OF = {
    connection: {
        stroke: '#f8a485',
        'stroke-width': 2,
    },
    markerTarget: {
        fill: '#f8a485',
        stroke: '#cf8e76',
    },
};
var LINK_DOMAIN = {
    connection: {
        stroke: '#34c7f3',
        'stroke-width': 2,
    },
    markerTarget: {
        fill: '#34c7f3',
        stroke: '#38b5db',
    },
};
var LINK_RANGE = {
    connection: {
        stroke: '#34c7f3',
        'stroke-width': 2,
    },
    markerTarget: {
        fill: '#34c7f3',
        stroke: '#38b5db',
    },
};
var LINK_TYPE_OF = {
    connection: {
        stroke: '#8cd965',
        'stroke-width': 2,
    },
    markerTarget: {
        fill: '#8cd965',
        stroke: '#5b9a3b',
    },
};
exports.DefaultLinkStyleBundle = [
    function (type) {
        if (type === 'http://www.w3.org/2000/01/rdf-schema#subClassOf') {
            return LINK_SUB_CLASS_OF;
        }
        else if (type === 'http://www.w3.org/2000/01/rdf-schema#domain') {
            return LINK_DOMAIN;
        }
        else if (type === 'http://www.w3.org/2000/01/rdf-schema#range') {
            return LINK_RANGE;
        }
        else if (type === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
            return LINK_TYPE_OF;
        }
        else {
            return undefined;
        }
    },
];
