import { LayoutData } from '../../diagram/layoutData';
import { Dictionary, ElementModel, LinkModel } from '../model';
import { DataProvider } from '../provider';
export declare class GraphBuilder {
    dataProvider: DataProvider;
    constructor(dataProvider: DataProvider);
    createGraph(graph: {
        elementIds: string[];
        links: LinkModel[];
    }): Promise<{
        preloadedElements: Dictionary<ElementModel>;
        layoutData: LayoutData;
    }>;
    private getLayout(elementsInfo, linksInfo);
}
export default GraphBuilder;
