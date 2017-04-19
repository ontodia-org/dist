/// <reference types="backbone" />
import * as joint from 'jointjs';
import { Element } from './elements';
import { DiagramView } from './view';
export declare class SeparatedElementView extends joint.dia.ElementView {
    model: Element;
    paper?: {
        diagramView?: DiagramView;
    };
    private view;
    private rect;
    render(): Backbone.View<joint.dia.Cell>;
    private setView(view);
    private updateSize;
}
