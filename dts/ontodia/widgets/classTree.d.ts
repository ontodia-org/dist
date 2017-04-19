/// <reference types="backbone" />
import * as Backbone from 'backbone';
import DiagramView from '../diagram/view';
export interface ClassTreeOptions extends Backbone.ViewOptions<Backbone.Model> {
    view: DiagramView;
}
/**
 * Events:
 *     action:classSelected(classId: string)
 */
export declare class ClassTree extends Backbone.View<Backbone.Model> {
    private filter;
    private tree;
    private rest;
    private view;
    constructor(options: ClassTreeOptions);
    private updateClassLabels(roots);
    private getJSTree();
    private onLanguageChanged();
    private setUrls(tree);
    private setUrlsRec(root);
    render(): ClassTree;
}
export default ClassTree;
