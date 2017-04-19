"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Backbone = require("backbone");
var React = require("react");
var CLASS_NAME = 'ontodia-halo';
var Halo = (function (_super) {
    __extends(Halo, _super);
    function Halo() {
        var _this = _super.apply(this, arguments) || this;
        _this.handler = new Backbone.Model();
        return _this;
    }
    Halo.prototype.componentWillMount = function () {
        var _this = this;
        this.handler.listenTo(this.props.paper, 'translate resize scale', function () { return _this.forceUpdate(); });
        this.listenToCell(this.props.cellView);
    };
    Halo.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.cellView !== this.props.cellView) {
            if (this.props.cellView) {
                this.handler.stopListening(this.props.cellView.model);
            }
            this.listenToCell(nextProps.cellView);
        }
    };
    Halo.prototype.listenToCell = function (cellView) {
        var _this = this;
        if (cellView) {
            this.handler.listenTo(cellView.model, 'change:isExpanded change:position change:size', function () { return _this.forceUpdate(); });
        }
    };
    Halo.prototype.componentWillUnmount = function () {
        this.props.diagramView.hideNavigationMenu();
        this.handler.stopListening();
    };
    Halo.prototype.render = function () {
        if (!this.props.cellView) {
            return React.createElement("div", { className: CLASS_NAME, style: { display: 'none' } });
        }
        var _a = this.props, cellView = _a.cellView, navigationMenuOpened = _a.navigationMenuOpened;
        var cellExpanded = cellView.model.get('isExpanded');
        var bbox = this.props.cellView.getBBox();
        var style = {
            top: bbox.y,
            left: bbox.x,
            height: bbox.height,
            width: bbox.width,
        };
        return (React.createElement("div", { className: CLASS_NAME, style: style },
            React.createElement("div", { className: CLASS_NAME + "__delete", title: 'Remove an element from the diagram', onClick: this.props.onDelete }),
            React.createElement("div", { className: CLASS_NAME + "__navigate " +
                    (CLASS_NAME + "__navigate--" + (navigationMenuOpened ? 'closed' : 'open')), title: 'Open a dialog to navigate to connected elements', onClick: this.props.onToggleNavigationMenu }),
            React.createElement("div", { className: CLASS_NAME + "__add-to-filter", title: 'Search for connected elements', onClick: this.props.onAddToFilter }),
            React.createElement("div", { className: CLASS_NAME + "__expand " +
                    (CLASS_NAME + "__expand--" + (cellExpanded ? 'closed' : 'open')), title: "Expand an element to reveal additional properties", onClick: this.props.onExpand })));
    };
    return Halo;
}(React.Component));
exports.Halo = Halo;
