import { SparqlDataProvider } from './sparqlDataProvider';
import { Triple } from './sparqlModels';
import { LayoutData } from '../../diagram/layoutData';
import { Dictionary, ElementModel } from '../model';
import { GraphBuilder } from './graphBuilder';
export declare class SparqlGraphBuilder {
    dataProvider: SparqlDataProvider;
    graphBuilder: GraphBuilder;
    constructor(dataProvider: SparqlDataProvider);
    getGraphFromConstruct(constructQuery: string): Promise<{
        preloadedElements: Dictionary<ElementModel>;
        layoutData: LayoutData;
    }>;
    getGraphFromRDFGraph(graph: Triple[]): Promise<{
        preloadedElements: Dictionary<ElementModel>;
        layoutData: LayoutData;
    }>;
    private getConstructElements(response);
}
