"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var CLASS_NAME = 'ontodia-toolbar';
var EditorToolbar = (function (_super) {
    __extends(EditorToolbar, _super);
    function EditorToolbar(props) {
        var _this = _super.call(this, props) || this;
        _this.onChangeLanguage = function (event) {
            var value = event.currentTarget.value;
            _this.props.onChangeLanguage(value);
        };
        _this.onExportSVG = function () {
            _this.props.onExportSVG(_this.downloadImageLink);
        };
        _this.onExportPNG = function () {
            _this.props.onExportPNG(_this.downloadImageLink);
        };
        _this.state = { showModal: false };
        return _this;
    }
    EditorToolbar.prototype.render = function () {
        var _this = this;
        var intro = '<h4>Toolbox</h4>' +
            '<p>You can use additional tools for working with your diagram, such as choosing between automatic ' +
            'layouts or fit diagram to screen, etc.</p>' +
            '<p>Don’t forget to save diagrams, it always comes handy after all.</p>';
        var btnSaveDiagram = (React.createElement("button", { type: 'button', className: 'saveDiagramButton btn btn-primary', onClick: this.props.onSaveDiagram },
            React.createElement("span", { className: 'fa fa-floppy-o', "aria-hidden": 'true' }),
            " Save diagram"));
        var btnEditAtMainSite = (React.createElement("button", { type: 'button', className: 'btn btn-primary', onClick: this.props.onEditAtMainSite },
            "Edit in ",
            React.createElement("img", { src: 'images/ontodia_headlogo.png', height: '15.59' })));
        var btnShare = (React.createElement("button", { type: 'button', className: 'btn btn-default', title: 'Publish or share diagram', onClick: this.props.onShare },
            React.createElement("span", { className: 'fa fa-users', "aria-hidden": 'true' }),
            " Share"));
        var btnHelp = (React.createElement("button", { type: 'button', className: 'btn btn-default', onClick: this.props.onShowTutorial },
            React.createElement("span", { className: 'fa fa-info-circle', "aria-hidden": 'true' }),
            " Help"));
        var nonEmbedded = !this.props.isEmbeddedMode;
        return (React.createElement("div", { className: CLASS_NAME },
            React.createElement("div", { className: 'btn-group btn-group-sm', "data-position": 'bottom', "data-step": '6', "data-intro": intro },
                nonEmbedded
                    ? (this.props.onSaveDiagram ? btnSaveDiagram : undefined)
                    : (this.props.onEditAtMainSite ? btnEditAtMainSite : undefined),
                this.props.onSaveToSelf ? (React.createElement("button", { type: 'button', className: 'btn btn-default' },
                    React.createElement("span", { className: 'fa fa-floppy-o', "aria-hidden": 'true' }),
                    " Save under your account")) : undefined,
                (this.props.isDiagramSaved && this.props.onResetDiagram) ? (React.createElement("button", { type: 'button', className: 'btn btn-default' },
                    React.createElement("span", { className: 'fa fa-trash-o', "aria-hidden": 'true' }),
                    " Reset")) : undefined,
                React.createElement("button", { type: 'button', className: 'btn btn-default', onClick: this.props.onForceLayout },
                    React.createElement("span", { className: 'fa fa-sitemap', "aria-hidden": 'true' }),
                    " Layout"),
                React.createElement("button", { type: 'button', className: 'btn btn-default', title: 'Zoom In', onClick: this.props.onZoomIn },
                    React.createElement("span", { className: 'fa fa-search-plus', "aria-hidden": 'true' })),
                React.createElement("button", { type: 'button', className: 'btn btn-default', title: 'Zoom Out', onClick: this.props.onZoomOut },
                    React.createElement("span", { className: 'fa fa-search-minus', "aria-hidden": 'true' })),
                React.createElement("button", { type: 'button', className: 'btn btn-default', title: 'Fit to Screen', onClick: this.props.onZoomToFit },
                    React.createElement("span", { className: 'fa fa-arrows-alt', "aria-hidden": 'true' })),
                (nonEmbedded && this.props.onUndo) ? (React.createElement("button", { type: 'button', className: "btn btn-default " + CLASS_NAME + "__undo", title: 'Undo', onClick: this.props.onUndo },
                    React.createElement("span", { className: 'fa fa-undo', "aria-hidden": 'true' }))) : undefined,
                (nonEmbedded && this.props.onRedo) ? (React.createElement("button", { type: 'button', className: "btn btn-default " + CLASS_NAME + "__redo", title: 'Redo', onClick: this.props.onRedo },
                    React.createElement("span", { className: 'fa fa-repeat', "aria-hidden": 'true' }))) : undefined,
                React.createElement("button", { type: 'button', className: 'btn btn-default', title: 'Export diagram as PNG', onClick: this.onExportPNG },
                    React.createElement("span", { className: 'fa fa-picture-o', "aria-hidden": 'true' }),
                    " PNG"),
                React.createElement("button", { type: 'button', className: 'btn btn-default', title: 'Export diagram as SVG', onClick: this.onExportSVG },
                    React.createElement("span", { className: 'fa fa-picture-o', "aria-hidden": 'true' }),
                    " SVG"),
                React.createElement("button", { type: 'button', className: 'btn btn-default', title: 'Print diagram', onClick: this.props.onPrint },
                    React.createElement("span", { className: 'fa fa-print', "aria-hidden": 'true' })),
                (nonEmbedded && this.props.onShare) ? btnShare : undefined,
                React.createElement("span", { className: "btn-group " + CLASS_NAME + "__language-selector" },
                    nonEmbedded ? React.createElement("label", null,
                        React.createElement("span", null, "Ontology Language:")) : undefined,
                    React.createElement("select", { defaultValue: 'en', onChange: this.onChangeLanguage },
                        React.createElement("option", { value: 'en' }, "English"),
                        React.createElement("option", { value: 'ru' }, "Russian"))),
                nonEmbedded ? btnHelp : undefined),
            React.createElement("a", { href: '#', ref: function (link) { _this.downloadImageLink = link; }, style: { display: 'none', visibility: 'collapse' } })));
    };
    return EditorToolbar;
}(React.Component));
exports.EditorToolbar = EditorToolbar;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EditorToolbar;
