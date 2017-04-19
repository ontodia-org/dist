/// <reference types="react" />
/// <reference types="backbone" />
import * as React from 'react';
import * as Backbone from 'backbone';
import LinkTypesToolboxModel from './linksToolboxModel';
import { FatLinkType } from '../diagram/elements';
import DiagramView from '../diagram/view';
export { LinkTypesToolboxModel };
export interface LinkInToolBoxProps {
    link: FatLinkType;
    count: number;
    language?: string;
    onPressFilter?: (type: FatLinkType) => void;
    filterKey?: string;
}
import { LocalizedString } from '../data/model';
/**
 * Events:
 *     filter-click(link: FatLinkType) - when filter button clicked
 */
export declare class LinkInToolBox extends React.Component<LinkInToolBoxProps, {}> {
    constructor(props: LinkInToolBoxProps);
    private onPressFilter;
    private changeState;
    private isChecked;
    private getText;
    render(): JSX.Element;
}
export interface LinkTypesToolboxProps extends Backbone.ViewOptions<LinkTypesToolboxModel> {
    links: FatLinkType[];
    countMap?: {
        [linkTypeId: string]: number;
    };
    label?: {
        values: LocalizedString[];
    };
    language?: string;
    dataState?: string;
    filterCallback?: (type: FatLinkType) => void;
}
export declare class LinkTypesToolbox extends React.Component<LinkTypesToolboxProps, {
    filterKey: string;
}> {
    constructor(props: LinkTypesToolboxProps);
    private compareLinks;
    private onChangeInput;
    private onDropFilter;
    private changeState;
    private getLinks;
    private getViews;
    render(): JSX.Element;
}
export interface LinkTypesToolboxShellProps extends Backbone.ViewOptions<LinkTypesToolboxModel> {
    view: DiagramView;
}
export declare class LinkTypesToolboxShell extends Backbone.View<LinkTypesToolboxModel> {
    props: LinkTypesToolboxShellProps;
    private view;
    private dataState;
    private filterCallback;
    private linksOfElement;
    private countMap;
    constructor(props: LinkTypesToolboxShellProps);
    private setDataState(dataState);
    private updateLinks();
    private subscribeOnLinksEevents(linksOfElement);
    private unsubscribeOnLinksEevents();
    getReactComponent(): JSX.Element;
    render(): LinkTypesToolboxShell;
    remove(): this;
}
export default LinkTypesToolboxShell;
