/// <reference types="react" />
import * as React from 'react';
import { ElementModel } from '../data/model';
import { DiagramView } from '../diagram/view';
export interface ListElementViewProps extends React.HTMLProps<HTMLLIElement> {
    view: DiagramView;
    model: Readonly<ElementModel>;
    disabled?: boolean;
    selected?: boolean;
}
export declare class ListElementView extends React.Component<ListElementViewProps, void> {
    render(): JSX.Element;
}
