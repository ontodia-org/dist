/// <reference types="react" />
import * as React from 'react';
export interface Props {
    onSaveDiagram?: () => void;
    onSaveToSelf?: () => void;
    onEditAtMainSite?: () => void;
    onResetDiagram?: () => void;
    onForceLayout: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomToFit: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onExportSVG: (link: HTMLAnchorElement) => void;
    onExportPNG: (link: HTMLAnchorElement) => void;
    onPrint: () => void;
    onShare?: () => void;
    onChangeLanguage: (language: string) => void;
    onShowTutorial: () => void;
    isEmbeddedMode?: boolean;
    isDiagramSaved?: boolean;
}
export interface State {
    showModal: boolean;
}
export declare class EditorToolbar extends React.Component<Props, State> {
    private downloadImageLink;
    constructor(props: Props);
    private onChangeLanguage;
    private onExportSVG;
    private onExportPNG;
    render(): JSX.Element;
}
export default EditorToolbar;
