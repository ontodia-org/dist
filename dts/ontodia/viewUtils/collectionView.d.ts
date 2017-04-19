/// <reference types="backbone" />
import * as Backbone from 'backbone';
export interface CollectionViewOptions<TModel extends Backbone.Model> extends Backbone.ViewOptions<TModel> {
    childView: any;
    childOptions: Backbone.ViewOptions<TModel>;
}
export declare class CollectionView<TModel extends Backbone.Model> extends Backbone.View<TModel> {
    private childView;
    private childOptions;
    private childViews;
    private isRendered;
    constructor(options: CollectionViewOptions<TModel>);
    private onAdd(model);
    private onRemove(model);
    private onReset();
    render(): CollectionView<TModel>;
}
export default CollectionView;
export declare function removeAllViews<TModel extends Backbone.Model>(views: Backbone.View<TModel>[]): void;
