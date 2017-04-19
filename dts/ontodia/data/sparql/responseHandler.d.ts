import { RdfLiteral, SparqlResponse, ClassBinding, ElementBinding, LinkBinding, ElementImageBinding, LinkCountBinding, LinkTypeInfoBinding, PropertyBinding } from './sparqlModels';
import { Dictionary, LocalizedString, LinkType, ClassModel, ElementModel, LinkModel, PropertyModel, LinkCount } from '../model';
export declare function getClassTree(response: SparqlResponse<ClassBinding>): ClassModel[];
export declare function getClassInfo(response: SparqlResponse<ClassBinding>): ClassModel[];
export declare function getPropertyInfo(response: SparqlResponse<PropertyBinding>): Dictionary<PropertyModel>;
export declare function getLinkTypes(response: SparqlResponse<LinkTypeInfoBinding>): LinkType[];
export declare function getElementsInfo(response: SparqlResponse<ElementBinding>, ids: string[]): Dictionary<ElementModel>;
export declare function getEnrichedElementsInfo(response: SparqlResponse<ElementImageBinding>, elementsInfo: Dictionary<ElementModel>): Dictionary<ElementModel>;
export declare function getLinkTypesInfo(response: SparqlResponse<LinkTypeInfoBinding>): LinkType[];
export declare function getLinksInfo(response: SparqlResponse<LinkBinding>): LinkModel[];
export declare function getLinksTypesOf(response: SparqlResponse<LinkCountBinding>): LinkCount[];
export declare function getFilteredData(response: SparqlResponse<ElementBinding>): Dictionary<ElementModel>;
export declare function enrichElement(element: ElementModel, sInst: ElementBinding): void;
export declare function getNameFromId(id: string): string;
export declare function getLocalizedString(label?: RdfLiteral, id?: string): LocalizedString;
export declare function getInstCount(instcount: RdfLiteral): number;
/**
 * This extension of ClassModel is used only in processing, parent links are not needed in UI (yet?)
 */
export interface HierarchicalClassModel extends ClassModel {
    parent: string;
}
export declare function getClassModel(node: ClassBinding): HierarchicalClassModel;
export declare function getPropertyModel(node: PropertyBinding): PropertyModel;
export declare function getLinkType(sLinkType: LinkCountBinding): LinkCount;
export declare function getPropertyValue(propValue?: RdfLiteral): LocalizedString;
export declare function getElementInfo(sInfo: ElementBinding): ElementModel;
export declare function getLinkInfo(sLinkInfo: LinkBinding): LinkModel;
export declare function getLinkTypeInfo(sLinkInfo: LinkTypeInfoBinding): LinkType;
