import * as joint from 'jointjs';
import DiagramView from '../diagram/view';
import { ElementModel } from '../data/model';
export interface ReactElementModel {
    model: ElementModel;
    presentOnDiagram: boolean;
}
export interface ConnectionsMenuOptions {
    paper: joint.dia.Paper;
    view: DiagramView;
    cellView: joint.dia.CellView;
    onClose: () => void;
}
export declare class ConnectionsMenu {
    private options;
    private container;
    private handler;
    private view;
    private state;
    private links;
    private countMap;
    private selectedLink;
    private objects;
    private direction;
    cellView: joint.dia.CellView;
    constructor(options: ConnectionsMenuOptions);
    private subscribeOnLinksEevents(linksOfElement);
    private unsubscribeOnLinksEevents(linksOfElement);
    private loadLinks();
    private loadObjects(link, direction?);
    private addSelectedElements;
    private onExpandLink;
    private onMoveToFilter;
    private render;
    remove(): void;
}
