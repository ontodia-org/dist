export interface LayoutData {
    readonly cells: LayoutCell[];
}
export declare type LayoutCell = LayoutElement | LayoutLink;
export interface LayoutElement {
    type: 'element';
    id: string;
    position: {
        x: number;
        y: number;
    };
    size?: any;
    angle?: number;
    isExpanded?: boolean;
}
export interface LayoutLink {
    type: 'link';
    id: string;
    typeId: string;
    source: {
        id: string;
    };
    target: {
        id: string;
    };
    vertices?: Array<{
        x: number;
        y: number;
    }>;
}
export declare function normalizeImportedCell<Cell extends LayoutCell>(cell: Cell): Cell;
export declare function cleanExportedLayout(layout: LayoutData): LayoutData;
