"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var React = require("react");
var ReactDOM = require("react-dom");
var Backbone = require("backbone");
var linksToolboxModel_1 = require("./linksToolboxModel");
exports.LinkTypesToolboxModel = linksToolboxModel_1.default;
var model_1 = require("../diagram/model");
/**
 * Events:
 *     filter-click(link: FatLinkType) - when filter button clicked
 */
var LinkInToolBox = (function (_super) {
    __extends(LinkInToolBox, _super);
    function LinkInToolBox(props) {
        var _this = _super.call(this, props) || this;
        _this.onPressFilter = function () {
            if (_this.props.onPressFilter) {
                _this.props.onPressFilter(_this.props.link);
            }
        };
        _this.changeState = function (state) {
            if (state === 'invisible') {
                _this.props.link.setVisibility({ visible: false, showLabel: false });
            }
            else if (state === 'withoutLabels') {
                _this.props.link.setVisibility({ visible: true, showLabel: false });
            }
            else if (state === 'allVisible') {
                _this.props.link.setVisibility({ visible: true, showLabel: true });
            }
        };
        _this.isChecked = function (stateName) {
            var curState;
            if (!_this.props.link.get('visible')) {
                curState = 'invisible';
            }
            else if (!_this.props.link.get('showLabel')) {
                curState = 'withoutLabels';
            }
            else {
                curState = 'allVisible';
            }
            return stateName === curState;
        };
        _this.getText = function () {
            var label = _this.props.link.get('label');
            var fullText = model_1.chooseLocalizedText(label.values, _this.props.language).text.toLowerCase();
            if (_this.props.filterKey) {
                var filterKey = _this.props.filterKey.toLowerCase();
                var leftIndex = fullText.toLowerCase().indexOf(filterKey);
                var rightIndex = leftIndex + filterKey.length;
                var firstPart = '';
                var selectedPart = '';
                var lastPart = '';
                if (leftIndex === 0) {
                    selectedPart = fullText.substring(0, rightIndex);
                }
                else {
                    firstPart = fullText.substring(0, leftIndex);
                    selectedPart = fullText.substring(leftIndex, rightIndex);
                }
                if (rightIndex <= fullText.length) {
                    lastPart = fullText.substring(rightIndex, fullText.length);
                }
                return React.createElement("span", null,
                    firstPart,
                    React.createElement("span", { style: { color: 'darkred', fontWeight: 'bold' } }, selectedPart),
                    lastPart);
            }
            else {
                return React.createElement("span", null, fullText);
            }
        };
        return _this;
    }
    LinkInToolBox.prototype.render = function () {
        var _this = this;
        var newIcon = (this.props.link.get('isNew') ? React.createElement("span", { className: 'label label-warning' }, "new") : '');
        var countIcon = (this.props.count > 0 ? React.createElement("span", { className: 'badge' }, this.props.count) : '');
        var badgeContainer = (newIcon || countIcon ? React.createElement("div", null,
            newIcon,
            countIcon) : '');
        return (React.createElement("li", { "data-linkTypeId": this.props.link.id, className: 'list-group-item linkInToolBox clearfix' },
            React.createElement("span", { className: 'btn-group btn-group-xs', "data-toggle": 'buttons' },
                React.createElement("label", { className: 'btn btn-default' + (this.isChecked('invisible') ? ' active' : ''), id: 'invisible', title: 'Hide links and labels', onClick: function () { return _this.changeState('invisible'); } },
                    React.createElement("span", { className: 'fa fa-times', "aria-hidden": 'true' })),
                React.createElement("label", { className: 'btn btn-default' + (this.isChecked('withoutLabels') ? ' active' : ''), id: 'withoutLabels', title: 'Show links without labels', onClick: function () { return _this.changeState('withoutLabels'); } },
                    React.createElement("span", { className: 'fa fa-arrows-h', "aria-hidden": 'true' })),
                React.createElement("label", { className: 'btn btn-default' + (this.isChecked('allVisible') ? ' active' : ''), id: 'allVisible', title: 'Show links with labels', onClick: function () { return _this.changeState('allVisible'); } },
                    React.createElement("span", { className: 'fa fa-text-width', "aria-hidden": 'true' }))),
            React.createElement("div", { className: 'link-title' }, this.getText()),
            badgeContainer,
            React.createElement("a", { className: 'filter-button', onClick: this.onPressFilter },
                React.createElement("img", null))));
    };
    return LinkInToolBox;
}(React.Component));
exports.LinkInToolBox = LinkInToolBox;
var LinkTypesToolbox = (function (_super) {
    __extends(LinkTypesToolbox, _super);
    function LinkTypesToolbox(props) {
        var _this = _super.call(this, props) || this;
        _this.compareLinks = function (a, b) {
            var aLabel = a.get('label');
            var bLabel = b.get('label');
            var aText = (aLabel ? model_1.chooseLocalizedText(aLabel.values, _this.props.language).text.toLowerCase() : null);
            var bText = (bLabel ? model_1.chooseLocalizedText(bLabel.values, _this.props.language).text.toLowerCase() : null);
            if (aText < bText) {
                return -1;
            }
            if (aText > bText) {
                return 1;
            }
            return 0;
        };
        _this.onChangeInput = function (e) {
            _this.setState({ filterKey: e.currentTarget.value });
        };
        _this.onDropFilter = function () {
            _this.setState({ filterKey: '' });
        };
        _this.changeState = function (state, links) {
            if (state === 'invisible') {
                for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                    var link = links_1[_i];
                    link.setVisibility({ visible: false, showLabel: false });
                }
            }
            else if (state === 'withoutLabels') {
                for (var _a = 0, links_2 = links; _a < links_2.length; _a++) {
                    var link = links_2[_a];
                    link.setVisibility({ visible: true, showLabel: false });
                }
            }
            else if (state === 'allVisible') {
                for (var _b = 0, links_3 = links; _b < links_3.length; _b++) {
                    var link = links_3[_b];
                    link.setVisibility({ visible: true, showLabel: true });
                }
            }
        };
        _this.getLinks = function () {
            return (_this.props.links || []).filter(function (link) {
                var label = link.get('label');
                var text = (label ? model_1.chooseLocalizedText(label.values, _this.props.language).text.toLowerCase() : null);
                return (!_this.state.filterKey) || (text && text.indexOf(_this.state.filterKey.toLowerCase()) !== -1);
            })
                .sort(_this.compareLinks);
        };
        _this.getViews = function (links) {
            var countMap = _this.props.countMap || {};
            var views = [];
            for (var _i = 0, links_4 = links; _i < links_4.length; _i++) {
                var link = links_4[_i];
                views.push(React.createElement(LinkInToolBox, { key: link.id, link: link, onPressFilter: _this.props.filterCallback, language: _this.props.language, count: countMap[link.id] || 0, filterKey: _this.state.filterKey }));
            }
            return views;
        };
        _this.state = { filterKey: '' };
        return _this;
    }
    LinkTypesToolbox.prototype.render = function () {
        var _this = this;
        var className = 'link-types-toolbox';
        var dataState = this.props.dataState || null;
        var links = this.getLinks();
        var views = this.getViews(links);
        var connectedTo = null;
        if (this.props.label) {
            var selectedElementLabel = model_1.chooseLocalizedText(this.props.label.values, this.props.language).text.toLowerCase();
            connectedTo = (React.createElement("h4", { className: 'links-heading', style: { display: 'block' } },
                "Connected to",
                '\u00A0',
                React.createElement("span", null, selectedElementLabel)));
        }
        var dropButton = null;
        if (this.state.filterKey) {
            dropButton = React.createElement("button", { type: 'button', className: className + "__clearSearch", onClick: this.onDropFilter },
                React.createElement("span", { className: 'fa fa-times', "aria-hidden": 'true' }));
        }
        return (React.createElement("div", { className: className + " stateBasedProgress", "data-state": dataState },
            React.createElement("div", { className: className + "__heading" },
                React.createElement("div", { className: className + "__searching-box" },
                    React.createElement("input", { className: 'search-input form-control', type: 'text', value: this.state.filterKey, onChange: this.onChangeInput, placeholder: 'Search for...' }),
                    dropButton),
                React.createElement("div", { className: className + "__switch-all" },
                    React.createElement("div", { className: 'btn-group btn-group-xs' },
                        React.createElement("label", { className: 'btn btn-default', title: 'Hide links and labels', onClick: function () { return _this.changeState('invisible', links); } },
                            React.createElement("span", { className: 'fa fa-times', "aria-hidden": 'true' })),
                        React.createElement("label", { className: 'btn btn-default', title: 'Show links without labels', onClick: function () { return _this.changeState('withoutLabels', links); } },
                            React.createElement("span", { className: 'fa fa-arrows-h', "aria-hidden": 'true' })),
                        React.createElement("label", { className: 'btn btn-default', title: 'Show links with labels', onClick: function () { return _this.changeState('allVisible', links); } },
                            React.createElement("span", { className: 'fa fa-text-width', "aria-hidden": 'true' }))),
                    React.createElement("span", null, "\u00A0Switch all"))),
            React.createElement("div", { className: 'progress' },
                React.createElement("div", { className: 'progress-bar progress-bar-striped active', role: 'progressbar', "aria-valuemin": '0', "aria-valuemax": '100', "aria-valuenow": '100', style: { width: '100%' } })),
            React.createElement("div", { className: className + "__rest" },
                connectedTo,
                React.createElement("div", { className: 'link-lists' },
                    React.createElement("ul", { className: 'list-group connected-links' }, views)))));
    };
    return LinkTypesToolbox;
}(React.Component));
exports.LinkTypesToolbox = LinkTypesToolbox;
var LinkTypesToolboxShell = (function (_super) {
    __extends(LinkTypesToolboxShell, _super);
    function LinkTypesToolboxShell(props) {
        var _this = _super.call(this, _.extend({ tagName: 'div' }, props)) || this;
        _this.props = props;
        _this.linksOfElement = [];
        _this.view = props.view;
        _this.listenTo(_this.view, 'change:language', _this.render);
        _this.listenTo(_this.view.model, 'state:dataLoaded', _this.render);
        _this.listenTo(_this.view, 'change:language', _this.updateLinks);
        _this.listenTo(_this.view.selection, 'add remove reset', _.debounce(function () {
            var single = _this.view.selection.length === 1
                ? _this.view.selection.first() : null;
            if (single !== _this.model.get('selectedElement')) {
                _this.model.set('selectedElement', single);
            }
            _this.updateLinks();
        }, 50));
        _this.listenTo(_this.model, 'state:beginQuery', function () { _this.setDataState('querying'); });
        _this.listenTo(_this.model, 'state:queryError', function () { return _this.setDataState('error'); });
        _this.listenTo(_this.model, 'state:endQuery', function () {
            _this.setDataState(_this.model.connectionsOfSelectedElement ? 'finished' : null);
            _this.updateLinks();
        });
        _this.filterCallback = function (linkType) {
            var selectedElement = _this.model.get('selectedElement');
            selectedElement.addToFilter(linkType);
        };
        return _this;
    }
    LinkTypesToolboxShell.prototype.setDataState = function (dataState) {
        this.dataState = dataState;
        this.render();
    };
    LinkTypesToolboxShell.prototype.updateLinks = function () {
        var _this = this;
        this.unsubscribeOnLinksEevents();
        if (this.model.connectionsOfSelectedElement) {
            this.countMap = this.model.connectionsOfSelectedElement;
            var linkTypeIds = _.keys(this.model.connectionsOfSelectedElement);
            this.linksOfElement = linkTypeIds.map(function (id) {
                return _this.view.model.createLinkType(id);
            });
            this.subscribeOnLinksEevents(this.linksOfElement);
        }
        else {
            this.linksOfElement = null;
            this.countMap = {};
        }
        this.render();
    };
    LinkTypesToolboxShell.prototype.subscribeOnLinksEevents = function (linksOfElement) {
        for (var _i = 0, linksOfElement_1 = linksOfElement; _i < linksOfElement_1.length; _i++) {
            var link = linksOfElement_1[_i];
            this.listenTo(link, 'change:label', this.render);
            this.listenTo(link, 'change:visible', this.render);
            this.listenTo(link, 'change:showLabel', this.render);
        }
        ;
    };
    LinkTypesToolboxShell.prototype.unsubscribeOnLinksEevents = function () {
        if (!this.linksOfElement) {
            return;
        }
        for (var _i = 0, _a = this.linksOfElement; _i < _a.length; _i++) {
            var link = _a[_i];
            this.stopListening(link);
        }
    };
    LinkTypesToolboxShell.prototype.getReactComponent = function () {
        var selectedElement = this.model.get('selectedElement');
        return (React.createElement(LinkTypesToolbox, { links: this.linksOfElement, countMap: this.countMap, filterCallback: this.filterCallback, dataState: this.dataState, language: this.view.getLanguage(), label: selectedElement ? selectedElement.template.label : null }));
    };
    LinkTypesToolboxShell.prototype.render = function () {
        ReactDOM.render(this.getReactComponent(), this.el);
        return this;
    };
    LinkTypesToolboxShell.prototype.remove = function () {
        this.unsubscribeOnLinksEevents();
        return this;
    };
    return LinkTypesToolboxShell;
}(Backbone.View));
exports.LinkTypesToolboxShell = LinkTypesToolboxShell;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LinkTypesToolboxShell;
