import * as joint from 'jointjs';
import { Link, FatLinkType } from './elements';
import { DiagramView } from './view';
export declare class LinkView extends joint.dia.LinkView {
    model: Link;
    paper?: {
        diagramView?: DiagramView;
    };
    private view;
    initialize(): void;
    render(): LinkView;
    getTypeModel(): FatLinkType;
    private setView(view);
    private updateLabel();
    private updateLabelWithOptions(options?);
}
