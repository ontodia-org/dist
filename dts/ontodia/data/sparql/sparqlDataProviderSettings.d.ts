/**
 * this is dataset-schema specific settings
 */
export interface SparqlDataProviderSettings {
    /**
     * default prefix to be used in every query
     */
    defaultPrefix: string;
    /**
     *  property to use as label in schema (classes, properties)
     */
    schemaLabelProperty: string;
    /**
     * property to use as instance label
     * todo: make it an array
     */
    dataLabelProperty: string;
    /**
     * full-text search settings
     */
    fullTextSearch: FullTextSearchSettings;
    /**
     * query to retreive class tree. Should return class, label, parent, instcount (optional)
     */
    classTreeQuery: string;
    /**
     * link types pattern - what to consider a link on initial fetch
     */
    linkTypesPattern: string;
    /**
     * query for fetching all information on element: labels, classes, properties
     */
    elementInfoQuery: string;
    /**
     * this should return image URL for ?inst as instance and ?linkType for image property IRI
     * todo: move to runtime settings instead? proxying is runtime thing
     */
    imageQueryPattern: string;
    /**
     * link types of returns possible link types from specified instance with statistics
     */
    linkTypesOfQuery: string;
    /**
     * when fetching all links from element, we could specify additional filter
     */
    filterRefElementLinkPattern: string;
    /**
     * filter by type pattern. One could use transitive type resolution here.
     */
    filterTypePattern: string;
    /**
     * how to fetch elements info when fetching data.
     */
    filterElementInfoPattern: string;
    /**
     * imposes additional filtering on elements within filter
     */
    filterAdditionalRestriction: string;
}
/**
 * Full text search settings,
 * developer could use anything from search extensions of triplestore to regular expressions match
 * See wikidata and dbpedia examples for reusing full text search capabilities of Blazegraph and Virtuozo
 */
export interface FullTextSearchSettings {
    /**
     * prefix to use in FTS queries
     */
    prefix: string;
    /**
     * query pattern should return ?inst and ?score for given ${text}.
     */
    queryPattern: string;
    /**
     * try to extract label from IRI for usage in search purposes.
     * If you have no labels in the dataset and want to search, you
     * can use ?extractedLabel as something to search for.
     */
    extractLabel?: boolean;
}
export declare const WikidataSettings: SparqlDataProviderSettings;
export declare const OWLRDFSSettings: SparqlDataProviderSettings;
export declare const OWLStatsSettings: SparqlDataProviderSettings;
export declare const DBPediaSettings: SparqlDataProviderSettings;
