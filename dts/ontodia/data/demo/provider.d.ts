import { DataProvider, FilterParams } from '../provider';
import { Dictionary, ClassModel, LinkType, ElementModel, LinkModel } from '../model';
export declare class DemoDataProvider implements DataProvider {
    private simulateNetwork<T>(result);
    classTree(): Promise<ClassModel[]>;
    classInfo(params: {
        classIds: string[];
    }): Promise<ClassModel[]>;
    linkTypes(): Promise<LinkType[]>;
    linkTypesInfo(params: {
        linkTypeIds: string[];
    }): Promise<LinkType[]>;
    elementInfo(params: {
        elementIds: string[];
    }): Promise<Dictionary<ElementModel>>;
    linksInfo(params: {
        elementIds: string[];
        linkTypeIds: string[];
    }): Promise<LinkModel[]>;
    linkTypesOf(params: {
        elementId: string;
    }): Promise<{}[]>;
    linkElements(params: {
        elementId: string;
        linkId: string;
        limit: number;
        offset: number;
        direction?: 'in' | 'out';
    }): Promise<Dictionary<ElementModel>>;
    filter(params: FilterParams): Promise<Dictionary<ElementModel>>;
}
