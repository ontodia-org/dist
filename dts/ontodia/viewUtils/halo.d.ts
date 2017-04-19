/// <reference types="react" />
import * as joint from 'jointjs';
import * as React from 'react';
import { DiagramView } from '../diagram/view';
export interface Props {
    paper: joint.dia.Paper;
    cellView: joint.dia.CellView;
    diagramView: DiagramView;
    onDelete?: () => void;
    onExpand?: () => void;
    navigationMenuOpened?: boolean;
    onToggleNavigationMenu?: () => void;
    onAddToFilter?: () => void;
}
export declare class Halo extends React.Component<Props, void> {
    private handler;
    componentWillMount(): void;
    componentWillReceiveProps(nextProps: Props): void;
    listenToCell(cellView: joint.dia.CellView): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
