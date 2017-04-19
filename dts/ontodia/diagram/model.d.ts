/// <reference types="backbone" />
import * as Backbone from 'backbone';
import * as joint from 'jointjs';
import { Dictionary, LocalizedString, ElementModel, LinkModel } from '../data/model';
import { DataProvider } from '../data/provider';
import { LayoutData } from './layoutData';
import { Element, Link, FatLinkType, FatClassModel, RichProperty } from './elements';
export declare type IgnoreCommandHistory = {
    ignoreCommandManager?: boolean;
};
export declare type PreventLinksLoading = {
    preventLoading?: boolean;
};
/**
 * Model of diagram.
 *
 * Properties:
 *     isViewOnly: boolean
 *
 * Events:
 *     state:beginLoad
 *     state:endLoad (diagramElementCount?: number)
 *     state:loadError (error: any)
 *     state:renderStart
 *     state:renderDone
 *     state:dataLoaded
 *
 *     history:undo
 *     history:redo
 *     history:reset
 *     history:initBatchCommand
 *     history:storeBatchCommand
 */
export declare class DiagramModel extends Backbone.Model {
    graph: joint.dia.Graph;
    dataProvider: DataProvider;
    classTree: ClassTreeElement[];
    private classesById;
    private propertyLabelById;
    private nextLinkTypeIndex;
    private linkTypes;
    private linksByType;
    private classFetchingThread;
    private linkFetchingThread;
    private propertyLabelFetchingThread;
    constructor(isViewOnly?: boolean);
    isViewOnly(): boolean;
    readonly cells: Backbone.Collection<joint.dia.Cell>;
    readonly elements: Element[];
    readonly links: Link[];
    getElement(elementId: string): Element | undefined;
    getLinkType(linkTypeId: string): FatLinkType | undefined;
    linksOfType(linkTypeId: string): ReadonlyArray<Link>;
    sourceOf(link: Link): Element;
    targetOf(link: Link): Element;
    isSourceAndTargetVisible(link: Link): boolean;
    undo(): void;
    redo(): void;
    resetHistory(): void;
    initBatchCommand(): void;
    storeBatchCommand(): void;
    private initializeExternalAddRemoveSupport();
    createNewDiagram(dataProvider: DataProvider): Promise<void>;
    private initLinkTypes(linkTypes);
    importLayout(params: {
        dataProvider: DataProvider;
        preloadedElements?: Dictionary<ElementModel>;
        layoutData?: LayoutData;
        validateLinks?: boolean;
        linkSettings?: LinkTypeOptions[];
        hideUnusedLinkTypes?: boolean;
    }): Promise<void>;
    exportLayout(): {
        layoutData: LayoutData;
        linkSettings: LinkTypeOptions[];
    };
    private setClassTree(rootClasses);
    private initDiagram(params);
    private initLinkSettings(linkSettings?);
    private initLayout(layoutData, preloadedElements, markLinksAsLayoutOnly);
    private hideUnusedLinkTypes();
    createElement(idOrModel: string | ElementModel): Element;
    requestElementData(elements: Element[]): Promise<void> | Promise<any[]>;
    requestLinksOfType(linkTypeIds?: string[]): Promise<void>;
    getPropertyById(labelId: string): RichProperty;
    getClassesById(typeId: string): FatClassModel;
    createLinkType(linkTypeId: string): FatLinkType;
    private onElementInfoLoaded(elements);
    private onLinkInfoLoaded(links);
    createLink(linkModel: LinkModel & {
        suggestedId?: string;
        vertices?: Array<{
            x: number;
            y: number;
        }>;
    }, options?: IgnoreCommandHistory): Link | undefined;
    private registerLink(link);
    getLink(linkModel: LinkModel): Link | undefined;
    private removeLinkReferences(linkModel);
}
export default DiagramModel;
export interface ClassTreeElement {
    id: string;
    label: {
        values: LocalizedString[];
    };
    count: number;
    children: ClassTreeElement[];
    a_attr?: {
        href: string;
        draggable: boolean;
    };
}
export interface LinkTypeOptions {
    id: string;
    visible: boolean;
    showLabel?: boolean;
}
export declare function uri2name(uri: string): string;
export declare function chooseLocalizedText(texts: LocalizedString[], language: string): LocalizedString;
