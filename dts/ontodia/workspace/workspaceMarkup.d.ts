/// <reference types="react" />
import * as React from 'react';
import { DiagramView } from '../diagram/view';
import { PaperArea } from '../diagram/paperArea';
import { SearchCriteria } from '../widgets/instancesSearch';
export interface Props {
    toolbar: React.ReactElement<any>;
    view: DiagramView;
    isViewOnly?: boolean;
    searchCriteria?: SearchCriteria;
    onSearchCriteriaChanged: (criteria: SearchCriteria) => void;
}
export declare class WorkspaceMarkup extends React.Component<Props, void> {
    element: HTMLElement;
    classTreePanel: HTMLElement;
    linkTypesPanel: HTMLElement;
    paperArea: PaperArea;
    private untilMouseUpClasses;
    render(): JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    preventTextSelection(): void;
    private untilMouseUp(params);
    private onDocumentMouseUp;
}
export default WorkspaceMarkup;
