/// <reference types="react" />
import * as React from 'react';
import { TutorialProps } from '../tutorial/tutorial';
export interface Props {
    className?: string;
    dockSide?: DockSide;
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    initiallyOpen?: boolean;
    onOpenOrClose?: (open: boolean) => void;
    onStartResize: () => void;
    tutorialProps?: TutorialProps;
    children?: React.ReactNode;
}
export declare enum DockSide {
    Left = 1,
    Right = 2,
}
export interface State {
    readonly open?: boolean;
    readonly width?: number;
}
export declare class ResizableSidebar extends React.Component<Props, State> {
    static readonly defaultProps: Partial<Props>;
    private originWidth;
    constructor(props: Props);
    private defaultWidth();
    render(): JSX.Element;
    private onBeginDragHandle;
    private onDragHandle;
    private toggle(params);
}
