/// <reference types="backbone" />
import * as Backbone from 'backbone';
import * as joint from 'jointjs';
import { ClassModel, ElementModel, LocalizedString } from '../data/model';
import { DiagramModel, PreventLinksLoading } from './model';
export declare class UIElement extends joint.shapes.basic.Generic {
    markup: string;
    defaults(): any;
}
/**
 * Properties:
 *     isExpanded: boolean
 *     position: { x: number, y: number }
 *     size: { width: number, height: number }
 *     angle: number - degrees
 *
 * Events:
 *     state:loaded
 *     add-to-filter
 *     focus-on-me
 *     action:iriClick
 */
export declare class Element extends UIElement {
    template: ElementModel;
    /** All in and out links of the element */
    links: Link[];
    isExpanded: boolean;
    initialize(): void;
    addToFilter(linkType?: FatLinkType, direction?: 'in' | 'out'): void;
    focus(): void;
    iriClick(iri: string): void;
}
/**
 * Properties:
 *     id: string
 *     label: { values: LocalizedString[] }
 *     count: number
 */
export declare class FatClassModel extends Backbone.Model {
    model: ClassModel;
    readonly label: {
        values: LocalizedString[];
    };
    constructor(classModel: ClassModel);
}
/**
 * Properties:
 *     id: string
 *     label: { values: LocalizedString[] }
 */
export declare class RichProperty extends Backbone.Model {
    readonly label: {
        values: LocalizedString[];
    };
    constructor(model: {
        id: string;
        label: {
            values: LocalizedString[];
        };
    });
}
/**
 * Properties:
 *     typeId: string
 *     typeIndex: number
 *     source: { id: string }
 *     target: { id: string }
 *     layoutOnly: boolean -- link exists only in layout (instead of underlying data)
 *
 * Events:
 *     state:loaded
 */
export declare class Link extends joint.dia.Link {
    arrowheadMarkup: string;
    readonly markup: string;
    typeIndex: number;
    readonly typeId: string;
    readonly sourceId: string;
    readonly targetId: string;
    layoutOnly: boolean;
    initialize(attributes?: {
        id: string;
    }): void;
}
export declare function linkMarkerKey(linkTypeIndex: number, startMarker: boolean): string;
/**
 * Properties:
 *     visible: boolean
 *     showLabel: boolean
 *     isNew?: boolean
 *     label?: { values: LocalizedString[] }
 */
export declare class FatLinkType extends Backbone.Model {
    private diagram;
    readonly index: number;
    label: {
        values: LocalizedString[];
    };
    readonly visible: boolean;
    setVisibility(params: {
        visible: boolean;
        showLabel: boolean;
    }, options?: PreventLinksLoading): void;
    constructor(params: {
        id: string;
        index: number;
        label: {
            values: LocalizedString[];
        };
        diagram: DiagramModel;
    });
    private onVisibilityChanged(self, visible, options);
}
