/// <reference types="react" />
import * as React from 'react';
import { TemplateProps } from './props';
export interface HandlebarsTemplateProps {
    template: string;
    templateProps: TemplateProps;
    onLoad?: () => void;
}
export declare class HandlebarsTemplate extends React.Component<HandlebarsTemplateProps, void> {
    private compiledTemplate;
    private cancelLoad;
    constructor(props: HandlebarsTemplateProps);
    render(): JSX.Element;
    renderTemplate(): {
        __html: string;
    };
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private subscribeOnLoad();
    private subscribeOnImagesLoad(node);
}
