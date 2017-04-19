import 'whatwg-fetch';
import { DataProvider, FilterParams } from '../provider';
import { Dictionary, ClassModel, LinkType, ElementModel, LinkModel, LinkCount, PropertyModel } from '../model';
import { SparqlResponse, Triple } from './sparqlModels';
import { SparqlDataProviderSettings } from './sparqlDataProviderSettings';
export declare enum SparqlQueryMethod {
    GET = 1,
    POST = 2,
}
/**
 * Runtime settings of SPARQL data provider
 */
export interface SparqlDataProviderOptions {
    /**
     *  sparql endpoint URL to use
     */
    endpointUrl: string;
    /**
     * properties to use as image URLs
     */
    imagePropertyUris?: string[];
    /**
     * you can specify prepareImages function to extract image URL from element model
     */
    prepareImages?: (elementInfo: Dictionary<ElementModel>) => Promise<Dictionary<string>>;
    /**
     * wether to use GET (more compatible (Virtuozo), more error-prone due to large request URLs)
     * or POST(less compatible, better on large data sets)
     */
    queryMethod?: SparqlQueryMethod;
    labelProperty?: string;
}
export declare class SparqlDataProvider implements DataProvider {
    private options;
    private settings;
    dataLabelProperty: string;
    constructor(options: SparqlDataProviderOptions, settings?: SparqlDataProviderSettings);
    classTree(): Promise<ClassModel[]>;
    propertyInfo(params: {
        propertyIds: string[];
    }): Promise<Dictionary<PropertyModel>>;
    classInfo(params: {
        classIds: string[];
    }): Promise<ClassModel[]>;
    linkTypesInfo(params: {
        linkTypeIds: string[];
    }): Promise<LinkType[]>;
    linkTypes(): Promise<LinkType[]>;
    elementInfo(params: {
        elementIds: string[];
    }): Promise<Dictionary<ElementModel>>;
    private enrichedElementsInfo(elementsInfo, types);
    private prepareElementsImage(elementsInfo);
    linksInfo(params: {
        elementIds: string[];
        linkTypeIds: string[];
    }): Promise<LinkModel[]>;
    linkTypesOf(params: {
        elementId: string;
    }): Promise<LinkCount[]>;
    linkElements(params: {
        elementId: string;
        linkId: string;
        limit: number;
        offset: number;
        direction?: 'in' | 'out';
    }): Promise<Dictionary<ElementModel>>;
    filter(params: FilterParams): Promise<Dictionary<ElementModel>>;
    executeSparqlQuery<Binding>(query: string): Promise<SparqlResponse<Binding>>;
    executeSparqlConstruct(query: string): Promise<Triple[]>;
}
export declare function executeSparqlQuery<Binding>(endpoint: string, query: string, method: SparqlQueryMethod): Promise<SparqlResponse<Binding>>;
export declare function executeSparqlConstruct(endpoint: string, query: string, method: SparqlQueryMethod): Promise<Triple[]>;
export default SparqlDataProvider;
