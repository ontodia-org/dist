/// <reference types="react" />
import * as joint from 'jointjs';
import * as React from 'react';
import { DiagramModel } from './model';
export interface Props {
    model: DiagramModel;
    paper: joint.dia.Paper;
    preventTextSelection: () => void;
    zoomOptions?: {
        min?: number;
        max?: number;
        /** Used when zooming to fit to limit zoom of small diagrams */
        maxFit?: number;
        fitPadding?: number;
    };
    panningAlwaysActive?: boolean;
    onDragDrop?: (e: DragEvent, paperPosition: {
        x: number;
        y: number;
    }) => void;
}
export interface ZoomOptions {
    pivot?: {
        x: number;
        y: number;
    };
}
export declare class PaperArea extends React.Component<Props, {}> {
    private readonly listener;
    private area;
    private paper;
    private spinnerElement;
    private pageSize;
    private padding;
    private center;
    private previousOrigin;
    private isPanning;
    private panningOrigin;
    private panningScrollOrigin;
    render(): JSX.Element;
    componentDidMount(): void;
    shouldComponentUpdate(): boolean;
    componentWillUnmount(): void;
    clientToPaperCoords(areaClientX: number, areaClientY: number): {
        x: number;
        y: number;
    };
    /** Returns bounding box of paper content in paper coordinates. */
    getContentFittingBox(): joint.g.rect;
    /** Returns paper size in paper coordinates. */
    getPaperSize(): {
        width: number;
        height: number;
    };
    adjustPaper: () => void;
    private updatePaperMargins();
    private onPaperScale;
    private onPaperResize;
    private onPaperTranslate;
    private shouldStartPanning(e);
    private onAreaPointerDown;
    private startPanning(event);
    private onPointerMove;
    private stopPanning;
    private onWheel;
    centerTo(paperPosition?: {
        x: number;
        y: number;
    }): void;
    centerContent(): void;
    getScale(): number;
    setScale(value: number, options?: ZoomOptions): void;
    zoomBy(value: number, options?: ZoomOptions): void;
    zoomToFit(): void;
    private onDragOver;
    private onDragDrop;
    private renderSpinner(props?);
    showIndicator(operation?: Promise<any>): void;
    private renderLoadingIndicator(elementCount, error?);
}
