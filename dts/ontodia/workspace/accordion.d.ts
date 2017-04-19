/// <reference types="react" />
import * as React from 'react';
import { Props as ItemProps } from './accordionItem';
export interface Props {
    onStartResize?: () => void;
    /** AccordionItem[] */
    children?: React.ReactElement<ItemProps>[];
}
export interface State {
    /**
     * Items' sizes in pixels.
     * Undefined until first resize or toggle initiated by user.
     **/
    readonly sizes?: number[];
    /**
     * Per-item collapsed state: true if corresponding item is collapsed;
     * otherwise false.
     */
    readonly collapsed?: boolean[];
    readonly resizing?: boolean;
}
export declare class Accordion extends React.Component<Props, State> {
    private element;
    private items;
    private originSizes;
    private originCollapsed;
    private originTotalHeight;
    constructor(props: Props);
    render(): JSX.Element;
    private renderItems();
    private onBeginDragHandle;
    private onEndDragHandle;
    private computeEffectiveItemHeights();
    private sizeWhenCollapsed;
    private onDragHandle;
    private onItemChangeCollapsed(itemIndex, itemCollapsed);
}
