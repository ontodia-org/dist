/// <reference types="react" />
import * as React from 'react';
import { Dictionary, ElementModel } from '../data/model';
import { DiagramView } from '../diagram/view';
export interface InstancesSearchProps {
    className?: string;
    view: DiagramView;
    criteria: SearchCriteria;
    onCriteriaChanged: (criteria: SearchCriteria) => void;
}
export interface SearchCriteria {
    readonly text?: string;
    readonly elementTypeId?: string;
    readonly refElementId?: string;
    readonly refElementLinkId?: string;
    readonly linkDirection?: 'in' | 'out';
}
export interface State {
    readonly inputText?: string;
    readonly quering?: boolean;
    readonly resultId?: number;
    readonly error?: any;
    readonly items?: ReadonlyArray<ElementModel>;
    readonly moreItemsAvailable?: boolean;
    readonly selectedItems?: Readonly<Dictionary<boolean>>;
}
export declare class InstancesSearch extends React.Component<InstancesSearchProps, State> {
    private readonly listener;
    private currentRequest;
    constructor(props: InstancesSearchProps);
    render(): JSX.Element;
    private renderCriteria();
    private renderRemoveCriterionButtons(onClick);
    private renderSearchResults();
    private submitCriteriaUpdate();
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: InstancesSearchProps): void;
    componentWillUnmount(): void;
    private queryItems(loadMoreItems);
    private processFilterData(elements);
}
