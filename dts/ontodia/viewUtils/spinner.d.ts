/// <reference types="react" />
import * as React from 'react';
export interface Props {
    size?: number;
    position?: {
        x: number;
        y: number;
    };
    maxWidth?: number;
    statusText?: string;
    errorOccured?: boolean;
}
export declare class Spinner extends React.Component<Props, void> {
    render(): JSX.Element;
}
