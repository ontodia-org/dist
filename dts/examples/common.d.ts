import { LayoutData } from '../index';
export declare function onPageLoad(callback: (container: HTMLDivElement) => void): void;
export declare function tryLoadLayoutFromLocalStorage(): LayoutData | undefined;
export declare function saveLayoutToLocalStorage(layout: LayoutData): string;
