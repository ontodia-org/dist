/// <reference types="react" />
import * as React from 'react';
export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onBeginDragHandle: (e: React.MouseEvent<HTMLDivElement>) => void;
    onDragHandle: (e: MouseEvent, dx: number, dy: number) => void;
    onEndDragHandle?: (e: MouseEvent) => void;
}
export declare class DraggableHandle extends React.Component<Props, void> {
    private isHoldingMouse;
    private originPageX;
    private originPageY;
    render(): JSX.Element;
    componentWillUnmount(): void;
    private onHandleMouseDown;
    private onMouseMove;
    private onMouseUp;
    private removeListeners();
}
