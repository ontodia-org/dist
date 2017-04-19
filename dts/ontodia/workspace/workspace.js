"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var react_1 = require("react");
var Backbone = require("backbone");
var model_1 = require("../diagram/model");
var view_1 = require("../diagram/view");
var layout_1 = require("../viewUtils/layout");
var classTree_1 = require("../widgets/classTree");
var linksToolbox_1 = require("../widgets/linksToolbox");
var toSvg_1 = require("../viewUtils/toSvg");
var toolbar_1 = require("../widgets/toolbar");
var tutorial_1 = require("../tutorial/tutorial");
var workspaceMarkup_1 = require("./workspaceMarkup");
var Workspace = (function (_super) {
    __extends(Workspace, _super);
    function Workspace(props) {
        var _this = _super.call(this, props) || this;
        _this.zoomToFit = function () {
            _this.markup.paperArea.zoomToFit();
        };
        _this.forceLayout = function () {
            var nodes = [];
            var nodeById = {};
            for (var _i = 0, _a = _this.model.elements; _i < _a.length; _i++) {
                var element = _a[_i];
                var size = element.get('size');
                var position = element.get('position');
                var node = {
                    id: element.id,
                    x: position.x,
                    y: position.y,
                    width: size.width,
                    height: size.height,
                };
                nodeById[element.id] = node;
                nodes.push(node);
            }
            var links = [];
            for (var _b = 0, _c = _this.model.links; _b < _c.length; _b++) {
                var link = _c[_b];
                if (!_this.model.isSourceAndTargetVisible(link)) {
                    continue;
                }
                var source = _this.model.sourceOf(link);
                var target = _this.model.targetOf(link);
                links.push({
                    link: link,
                    source: nodeById[source.id],
                    target: nodeById[target.id],
                });
            }
            layout_1.forceLayout({ nodes: nodes, links: links, preferredLinkLength: 200 });
            layout_1.padded(nodes, { x: 10, y: 10 }, function () { return layout_1.removeOverlaps(nodes); });
            layout_1.translateToPositiveQuadrant({ nodes: nodes, padding: { x: 150, y: 150 } });
            for (var _d = 0, nodes_1 = nodes; _d < nodes_1.length; _d++) {
                var node = nodes_1[_d];
                _this.model.getElement(node.id).position(node.x, node.y);
            }
            _this.markup.paperArea.adjustPaper();
            layout_1.translateToCenter({
                nodes: nodes,
                paperSize: _this.markup.paperArea.getPaperSize(),
                contentBBox: _this.markup.paperArea.getContentFittingBox(),
            });
            for (var _e = 0, nodes_2 = nodes; _e < nodes_2.length; _e++) {
                var node = nodes_2[_e];
                _this.model.getElement(node.id).position(node.x, node.y);
            }
            for (var _f = 0, links_1 = links; _f < links_1.length; _f++) {
                var link = links_1[_f].link;
                link.set('vertices', []);
            }
        };
        _this.exportSvg = function (link) {
            _this.diagram.exportSVG().then(function (svg) {
                link.download = 'diagram.svg';
                var xmlEncodingHeader = '<?xml version="1.0" encoding="UTF-8"?>';
                link.href = window.URL.createObjectURL(new Blob([xmlEncodingHeader + svg], { type: 'image/svg+xml' }));
                link.click();
            });
        };
        _this.exportPng = function (link) {
            _this.diagram.exportPNG({ backgroundColor: 'white' }).then(function (dataUri) {
                link.download = 'diagram.png';
                link.href = window.URL.createObjectURL(toSvg_1.dataURLToBlob(dataUri));
                link.click();
            });
        };
        _this.undo = function () {
            _this.model.undo();
        };
        _this.redo = function () {
            _this.model.redo();
        };
        _this.zoomIn = function () {
            _this.markup.paperArea.zoomBy(0.2);
        };
        _this.zoomOut = function () {
            _this.markup.paperArea.zoomBy(-0.2);
        };
        _this.print = function () {
            _this.diagram.print();
        };
        _this.changeLanguage = function (language) {
            _this.diagram.setLanguage(language);
        };
        _this.model = new model_1.DiagramModel(_this.props.isViewOnly);
        _this.diagram = new view_1.DiagramView(_this.model, _this.props.viewOptions);
        _this.state = {};
        return _this;
    }
    Workspace.prototype.render = function () {
        var _this = this;
        return react_1.createElement(workspaceMarkup_1.WorkspaceMarkup, {
            ref: function (markup) { _this.markup = markup; },
            isViewOnly: this.props.isViewOnly,
            view: this.diagram,
            searchCriteria: this.state.criteria,
            onSearchCriteriaChanged: function (criteria) { return _this.setState({ criteria: criteria }); },
            toolbar: react_1.createElement(toolbar_1.EditorToolbar, {
                onUndo: this.undo,
                onRedo: this.redo,
                onZoomIn: this.zoomIn,
                onZoomOut: this.zoomOut,
                onZoomToFit: this.zoomToFit,
                onPrint: this.print,
                onExportSVG: this.exportSvg,
                onExportPNG: this.exportPng,
                onShare: this.props.onShareDiagram ? function () { return _this.props.onShareDiagram(_this); } : undefined,
                onSaveDiagram: function () { return _this.props.onSaveDiagram(_this); },
                onForceLayout: function () {
                    _this.forceLayout();
                    _this.zoomToFit();
                },
                onChangeLanguage: this.changeLanguage,
                onShowTutorial: tutorial_1.showTutorial,
                onEditAtMainSite: function () { return _this.props.onEditAtMainSite(_this); },
                isEmbeddedMode: this.props.isViewOnly,
                isDiagramSaved: this.props.isDiagramSaved,
            }),
        });
    };
    Workspace.prototype.componentDidMount = function () {
        var _this = this;
        this.diagram.initializePaperComponents();
        if (this.props.isViewOnly) {
            return;
        }
        this.tree = new classTree_1.ClassTree({
            model: new Backbone.Model(this.diagram.model),
            view: this.diagram,
            el: this.markup.classTreePanel,
        }).render();
        this.tree.on('action:classSelected', function (classId) {
            _this.setState({ criteria: { elementTypeId: classId } });
        });
        this.model.graph.on('add-to-filter', function (element, linkType, direction) {
            _this.setState({
                criteria: {
                    refElementId: element.id,
                    refElementLinkId: linkType && linkType.id,
                    linkDirection: direction
                }
            });
        });
        this.linksToolbox = new linksToolbox_1.LinkTypesToolboxShell({
            model: new linksToolbox_1.LinkTypesToolboxModel(this.model),
            view: this.diagram,
            el: this.markup.linkTypesPanel,
        });
        if (!this.props.hideTutorial) {
            tutorial_1.showTutorialIfNotSeen();
        }
    };
    Workspace.prototype.componentWillUnmount = function () {
        if (this.tree) {
            this.tree.remove();
        }
        this.diagram.dispose();
    };
    Workspace.prototype.getModel = function () { return this.model; };
    Workspace.prototype.getDiagram = function () { return this.diagram; };
    Workspace.prototype.preventTextSelectionUntilMouseUp = function () { this.markup.preventTextSelection(); };
    Workspace.prototype.showWaitIndicatorWhile = function (promise) {
        this.markup.paperArea.showIndicator(promise);
    };
    return Workspace;
}(react_1.Component));
Workspace.defaultProps = {
    hideTutorial: true,
};
exports.Workspace = Workspace;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Workspace;
