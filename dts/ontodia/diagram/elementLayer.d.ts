/// <reference types="react" />
import * as React from 'react';
import * as joint from 'jointjs';
import { DiagramView } from './view';
export interface Props {
    paper: joint.dia.Paper;
    view: DiagramView;
}
export declare class ElementLayer extends React.Component<Props, void> {
    private readonly listener;
    private layer;
    render(): JSX.Element;
    componentDidMount(): void;
    private updateAll;
    componentWillUnmount(): void;
    private updateElementSize;
}
