export interface LayoutNode {
    id?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    bounds?: any;
    innerBounds?: any;
}
export interface LayoutLink {
    source: LayoutNode;
    target: LayoutNode;
}
export declare function forceLayout(params: {
    nodes: LayoutNode[];
    links: LayoutLink[];
    preferredLinkLength: number;
}): void;
export declare function removeOverlaps(nodes: LayoutNode[]): void;
export declare function translateToPositiveQuadrant(params: {
    nodes: LayoutNode[];
    padding?: {
        x: number;
        y: number;
    };
}): void;
export declare function translateToCenter(params: {
    nodes: LayoutNode[];
    paperSize: {
        width: number;
        height: number;
    };
    contentBBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}): void;
export declare function uniformGrid(params: {
    rows: number;
    cellSize: {
        x: number;
        y: number;
    };
}): (cellIndex: number) => LayoutNode;
export declare function padded(nodes: LayoutNode[], padding: {
    x: number;
    y: number;
} | undefined, transform: () => void): void;
export declare function flowLayout<Link extends LayoutLink>(params: {
    nodes: LayoutNode[];
    links: Link[];
    preferredLinkLength: number;
    route: (link: Link, path: any[]) => void;
}): void;
