/// <reference types="react" />
import { Component, ReactElement } from 'react';
import { DiagramModel } from '../diagram/model';
import { DiagramView, DiagramViewOptions } from '../diagram/view';
import { SearchCriteria } from '../widgets/instancesSearch';
export interface Props {
    onSaveDiagram?: (workspace: Workspace) => void;
    onShareDiagram?: (workspace: Workspace) => void;
    onEditAtMainSite?: (workspace: Workspace) => void;
    isViewOnly?: boolean;
    isDiagramSaved?: boolean;
    hideTutorial?: boolean;
    viewOptions?: DiagramViewOptions;
}
export interface State {
    readonly criteria?: SearchCriteria;
}
export declare class Workspace extends Component<Props, State> {
    static readonly defaultProps: {
        [K in keyof Props]?: any;
    };
    private markup;
    private readonly model;
    private readonly diagram;
    private tree;
    private linksToolbox;
    constructor(props: Props);
    render(): ReactElement<any>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    getModel(): DiagramModel;
    getDiagram(): DiagramView;
    preventTextSelectionUntilMouseUp(): void;
    zoomToFit: () => void;
    showWaitIndicatorWhile(promise: Promise<any>): void;
    forceLayout: () => void;
    exportSvg: (link: HTMLAnchorElement) => void;
    exportPng: (link: HTMLAnchorElement) => void;
    undo: () => void;
    redo: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    print: () => void;
    changeLanguage: (language: string) => void;
}
export default Workspace;
