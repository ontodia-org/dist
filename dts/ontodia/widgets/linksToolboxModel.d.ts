/// <reference types="backbone" />
import * as Backbone from 'backbone';
import DiagramModel from '../diagram/model';
/**
 * Model of 'connections' component.
 *
 * Properties:
 *     selectedElement: Element
 *
 * Events:
 *     state:beginQuery
 *     state:endQuery
 *     state:queryError
 */
export declare class LinkTypesToolboxModel extends Backbone.Model {
    diagram: DiagramModel;
    connectionsOfSelectedElement: {
        [linkTypeId: string]: number;
    };
    private currentRequest;
    constructor(diagram: DiagramModel);
    private onSelectedElementChanged(self, element);
}
export default LinkTypesToolboxModel;
