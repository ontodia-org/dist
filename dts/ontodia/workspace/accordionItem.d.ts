/// <reference types="react" />
import * as React from 'react';
import { TutorialProps } from '../tutorial/tutorial';
export interface Props {
    heading: string;
    bodyClassName?: string;
    bodyRef?: (body: HTMLDivElement) => void;
    tutorialProps?: TutorialProps;
    children?: React.ReactNode;
    collapsed?: boolean;
    height?: number | string;
    onChangeCollapsed?: (collapsed: boolean) => void;
    onBeginDragHandle?: () => void;
    onDragHandle?: (dx: number, dy: number) => void;
    onEndDragHandle?: () => void;
}
export declare class AccordionItem extends React.Component<Props, void> {
    private _element;
    private _header;
    readonly element: HTMLDivElement;
    readonly header: HTMLDivElement;
    render(): JSX.Element;
}
