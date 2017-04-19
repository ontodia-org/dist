"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var paperArea_1 = require("../diagram/paperArea");
var instancesSearch_1 = require("../widgets/instancesSearch");
var resizableSidebar_1 = require("./resizableSidebar");
var accordion_1 = require("./accordion");
var accordionItem_1 = require("./accordionItem");
var INTRO_CLASSES = "<p>Navigate through class tree and click a class to select it.</p>\n<p>When the class is selected, its instances are shown in Instances panel</p>\n<p>Double-click the class expands it and displays its subclasses.</p>";
var INTRO_INSTANCES = "<p>Instances of the selected class are displayed here.</p>\n<p>You can select one or several instances and drag-and-drop them directly on canvas to\n start your diagram.</p>";
var INTRO_DIAGRAM = "<h4>Main working area</h4><p><b>Zooming:</b> Ctrl-mousewheel or pinch-zoom on touchpad</p>\n<p><b>Pan:</b> Ctrl-mouse drag or mouse wheel</p><h5>Filtering related instances</h5>\n<p>When you select an element on the diagram the Ontodia shows a funnel icon underneath the\n element. By clicking the funnel icon, you can filter the related elements into the Instances panel.</p>\n<p>Then related elements can be drag-and-dropped into the diagram.</p>\n<p>By repeating it you can navigate from one element to another as far as you like and your way\n will be shown on the diagram.</p>";
var INTRO_CONNECTIONS = "<p>Connections panel lists all the connection present in the data source.</p>\n<p>You can define which connections Ontodia should display and which should stay hidden.</p>\n<p>You can also change the way they are shown on the diagram: it\u2019s either with the name above\n them or without it.</p>";
var INTRO_RESIZE = "<p>Panels can be resized and collapsed.</p>";
var WorkspaceMarkup = (function (_super) {
    __extends(WorkspaceMarkup, _super);
    function WorkspaceMarkup() {
        var _this = _super.apply(this, arguments) || this;
        _this.untilMouseUpClasses = [];
        _this.onDocumentMouseUp = function () {
            for (var _i = 0, _a = _this.untilMouseUpClasses; _i < _a.length; _i++) {
                var className = _a[_i];
                _this.element.classList.remove(className);
            }
            _this.untilMouseUpClasses = [];
        };
        return _this;
    }
    WorkspaceMarkup.prototype.render = function () {
        var _this = this;
        var leftPanel = (React.createElement(resizableSidebar_1.ResizableSidebar, { dockSide: resizableSidebar_1.DockSide.Left, onStartResize: function () { return _this.untilMouseUp({
                preventTextSelection: true,
                horizontalResizing: true,
            }); }, tutorialProps: {
                'data-position': 'right',
                'data-step': '7',
                'data-intro-id': 'resize',
                'data-intro': INTRO_RESIZE,
            } },
            React.createElement(accordion_1.Accordion, { onStartResize: function () { return _this.untilMouseUp({
                    preventTextSelection: true,
                    verticalResizing: true,
                }); } },
                React.createElement(accordionItem_1.AccordionItem, { heading: 'Classes', bodyRef: function (e) { return _this.classTreePanel = e; }, tutorialProps: {
                        'data-position': 'right',
                        'data-step': '1',
                        'data-intro-id': 'tree-view',
                        'data-intro': INTRO_CLASSES,
                    } }),
                React.createElement(accordionItem_1.AccordionItem, { heading: 'Instances', tutorialProps: {
                        'data-position': 'top',
                        'data-step': '2',
                        'data-intro-id': 'filter-view',
                        'data-intro': INTRO_INSTANCES,
                    } },
                    React.createElement(instancesSearch_1.InstancesSearch, { view: this.props.view, criteria: this.props.searchCriteria || {}, onCriteriaChanged: this.props.onSearchCriteriaChanged })))));
        var rightPanel = (React.createElement(resizableSidebar_1.ResizableSidebar, { dockSide: resizableSidebar_1.DockSide.Right, onStartResize: function () { return _this.untilMouseUp({
                preventTextSelection: true,
                horizontalResizing: true,
            }); } },
            React.createElement(accordion_1.Accordion, { onStartResize: function () { return _this.untilMouseUp({
                    preventTextSelection: true,
                    verticalResizing: true,
                }); } },
                React.createElement(accordionItem_1.AccordionItem, { heading: 'Connections', bodyClassName: 'link-types-toolbox', bodyRef: function (e) { return _this.linkTypesPanel = e; }, tutorialProps: {
                        'data-position': 'left',
                        'data-step': '4',
                        'data-intro-id': 'link-types-toolbox',
                        'data-intro': INTRO_CONNECTIONS,
                    } }))));
        return (React.createElement("div", { ref: function (e) { return _this.element = e; }, className: 'ontodia' },
            React.createElement("div", { className: 'ontodia__header' }, this.props.toolbar),
            React.createElement("div", { className: 'ontodia__workspace' },
                !this.props.isViewOnly ? leftPanel : null,
                React.createElement("div", { className: 'ontodia__main-panel', "data-position": 'left', "data-step": '3', "data-intro-id": 'diagram-area', "data-intro": INTRO_DIAGRAM },
                    React.createElement(paperArea_1.PaperArea, { ref: function (el) { return _this.paperArea = el; }, model: this.props.view.model, paper: this.props.view.paper, zoomOptions: { min: 0.2, max: 2, maxFit: 1, fitPadding: 20 }, preventTextSelection: function () { return _this.preventTextSelection(); }, onDragDrop: function (e, position) { return _this.props.view.onDragDrop(e, position); } })),
                !this.props.isViewOnly ? rightPanel : null)));
    };
    WorkspaceMarkup.prototype.componentDidMount = function () {
        document.addEventListener('mouseup', this.onDocumentMouseUp);
    };
    WorkspaceMarkup.prototype.componentWillUnmount = function () {
        document.removeEventListener('mouseup', this.onDocumentMouseUp);
    };
    WorkspaceMarkup.prototype.preventTextSelection = function () {
        this.untilMouseUp({ preventTextSelection: true });
    };
    WorkspaceMarkup.prototype.untilMouseUp = function (params) {
        this.untilMouseUpClasses = [];
        if (params.preventTextSelection) {
            this.untilMouseUpClasses.push('ontodia--unselectable');
        }
        if (params.horizontalResizing) {
            this.untilMouseUpClasses.push('ontodia--horizontal-resizing');
        }
        if (params.verticalResizing) {
            this.untilMouseUpClasses.push('ontodia--vertical-resizing');
        }
        for (var _i = 0, _a = this.untilMouseUpClasses; _i < _a.length; _i++) {
            var className = _a[_i];
            this.element.classList.add(className);
        }
    };
    return WorkspaceMarkup;
}(React.Component));
exports.WorkspaceMarkup = WorkspaceMarkup;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkspaceMarkup;
