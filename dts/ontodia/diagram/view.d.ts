/// <reference types="backbone" />
import * as Backbone from 'backbone';
import * as joint from 'jointjs';
import { TypeStyleResolver, LinkStyleResolver, TemplateResolver, ElementTemplate, LinkStyle } from '../customization/props';
import { Halo } from '../viewUtils/halo';
import { ConnectionsMenu } from '../viewUtils/connectionsMenu';
import { ToDataURLOptions } from '../viewUtils/toSvg';
import { ElementModel, LocalizedString } from '../data/model';
import { DiagramModel } from './model';
import { Element, FatClassModel } from './elements';
export interface DiagramViewOptions {
    typeStyleResolvers?: TypeStyleResolver[];
    linkStyleResolvers?: LinkStyleResolver[];
    templatesResolvers?: TemplateResolver[];
    disableDefaultHalo?: boolean;
}
export interface TypeStyle {
    color: {
        h: number;
        c: number;
        l: number;
    };
    icon?: string;
}
/**
 * Properties:
 *     language: string
 *
 * Events:
 *     (private) dispose - fires on view dispose
 */
export declare class DiagramView extends Backbone.Model {
    readonly model: DiagramModel;
    readonly options: DiagramViewOptions;
    private typeStyleResolvers;
    private linkStyleResolvers;
    private templatesResolvers;
    paper: joint.dia.Paper;
    halo: Halo;
    connectionsMenu: ConnectionsMenu;
    readonly selection: Backbone.Collection<Element>;
    private colorSeed;
    private linkMarkers;
    constructor(model: DiagramModel, options?: DiagramViewOptions);
    getLanguage(): string;
    setLanguage(value: string): void;
    cancelSelection(): void;
    print(): void;
    exportSVG(): Promise<string>;
    exportPNG(options?: ToDataURLOptions): Promise<string>;
    adjustPaper(): void;
    initializePaperComponents(): void;
    private configureElementLayer();
    private onKeyUp;
    private removeSelectedElements();
    private configureSelection();
    private configureDefaultHalo();
    showNavigationMenu(element: Element): void;
    hideNavigationMenu(): void;
    onDragDrop(e: DragEvent, paperPosition: {
        x: number;
        y: number;
    }): void;
    private createElementAt(elementId, position);
    getLocalizedText(texts: LocalizedString[]): LocalizedString;
    getElementTypeString(elementModel: ElementModel): string;
    getElementTypeLabel(type: FatClassModel): LocalizedString;
    getLinkLabel(linkTypeId: string): LocalizedString;
    getTypeStyle(types: string[]): TypeStyle;
    registerElementStyleResolver(resolver: TypeStyleResolver): TypeStyleResolver;
    unregisterElementStyleResolver(resolver: TypeStyleResolver): TypeStyleResolver;
    getElementTemplate(types: string[]): ElementTemplate;
    registerTemplateResolver(resolver: TemplateResolver): TemplateResolver;
    unregisterTemplateResolver(resolver: TemplateResolver): TemplateResolver;
    getLinkStyle(linkTypeId: string): LinkStyle;
    private createLinkMarker(linkTypeId, startMarker, style);
    registerLinkStyleResolver(resolver: LinkStyleResolver): LinkStyleResolver;
    unregisterLinkStyleResolver(resolver: LinkStyleResolver): LinkStyleResolver;
    getOptions(): DiagramViewOptions;
    private onDispose(handler);
    dispose(): void;
}
export default DiagramView;
