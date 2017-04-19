"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require("react");
var Backbone = require("backbone");
var model_1 = require("../diagram/model");
var listElementView_1 = require("./listElementView");
var DirectionInImage = require('../../../images/direction-in.png');
var DirectionOutImage = require('../../../images/direction-out.png');
var CLASS_NAME = 'ontodia-instances-search';
var InstancesSearch = (function (_super) {
    __extends(InstancesSearch, _super);
    function InstancesSearch(props) {
        var _this = _super.call(this, props) || this;
        _this.listener = new Backbone.Model();
        _this.state = {
            selectedItems: {},
            resultId: 0,
        };
        return _this;
    }
    InstancesSearch.prototype.render = function () {
        var _this = this;
        var ENTER_KEY_CODE = 13;
        var className = CLASS_NAME + " stateBasedProgress " + (this.props.className || '');
        var progressState = this.state.quering ? 'querying' :
            this.state.error ? 'error' :
                this.state.items ? 'finished' : undefined;
        var searchTerm = this.state.inputText === undefined
            ? this.props.criteria.text : this.state.inputText;
        return React.createElement("div", { className: className, "data-state": progressState },
            React.createElement("div", { className: 'progress' },
                React.createElement("div", { className: 'progress-bar progress-bar-striped active', role: 'progressbar', "aria-valuemin": '0', "aria-valuemax": '100', "aria-valuenow": '100', style: { width: '100%' } })),
            React.createElement("div", { className: CLASS_NAME + "__criteria" },
                this.renderCriteria(),
                React.createElement("div", { className: CLASS_NAME + "__text-criteria input-group" },
                    React.createElement("input", { type: 'text', className: 'form-control', placeholder: 'Search for...', value: searchTerm || '', onChange: function (e) { return _this.setState({ inputText: e.currentTarget.value }); }, onKeyUp: function (e) {
                            if (e.keyCode === ENTER_KEY_CODE) {
                                _this.submitCriteriaUpdate();
                            }
                        } }),
                    React.createElement("span", { className: 'input-group-btn' },
                        React.createElement("button", { className: 'btn btn-default', type: 'button', title: 'Search', onClick: function () { return _this.submitCriteriaUpdate(); } },
                            React.createElement("span", { className: 'fa fa-search', "aria-hidden": 'true' }))))),
            React.createElement("div", { className: CLASS_NAME + "__rest", key: this.state.resultId },
                this.renderSearchResults(),
                React.createElement("div", { className: CLASS_NAME + "__rest-end" },
                    React.createElement("button", { type: 'button', className: CLASS_NAME + "__load-more btn btn-primary", disabled: this.state.quering, style: { display: this.state.moreItemsAvailable ? undefined : 'none' }, onClick: function () { return _this.queryItems(true); } },
                        React.createElement("span", { className: 'fa fa-chevron-down', "aria-hidden": 'true' }),
                        "\u00A0Show more"))));
    };
    InstancesSearch.prototype.renderCriteria = function () {
        var _this = this;
        var _a = this.props, _b = _a.criteria, criteria = _b === void 0 ? {} : _b, view = _a.view;
        var criterions = [];
        if (criteria.elementTypeId) {
            var classInfo = view.model.getClassesById(criteria.elementTypeId);
            var classLabel = view.getLocalizedText(classInfo.label.values).text;
            criterions.push(React.createElement("div", { key: 'hasType', className: CLASS_NAME + "__criterion" },
                this.renderRemoveCriterionButtons(function () { return _this.props.onCriteriaChanged(__assign({}, _this.props.criteria, { elementTypeId: undefined })); }),
                "Has type ",
                React.createElement("span", { className: CLASS_NAME + "__criterion-class", title: classInfo.id }, classLabel)));
        }
        else if (criteria.refElementId) {
            var element = view.model.getElement(criteria.refElementId);
            var template = element && element.template;
            var elementLabel = formatLabel(view, criteria.refElementId, template && template.label);
            var linkType = criteria.refElementLinkId && view.model.getLinkType(criteria.refElementLinkId);
            var linkTypeLabel = linkType && formatLabel(view, linkType.id, linkType.label);
            criterions.push(React.createElement("div", { key: 'hasLinkedElement', className: CLASS_NAME + "__criterion" },
                this.renderRemoveCriterionButtons(function () { return _this.props.onCriteriaChanged(__assign({}, _this.props.criteria, { refElementId: undefined, refElementLinkId: undefined })); }),
                "Connected to ",
                React.createElement("span", { className: CLASS_NAME + "__criterion-element", title: element && element.id }, elementLabel),
                criteria.refElementLinkId && React.createElement("span", null,
                    ' through ',
                    React.createElement("span", { className: CLASS_NAME + "__criterion-link-type", title: linkType && linkType.id }, linkTypeLabel),
                    criteria.linkDirection === 'in' && React.createElement("span", null,
                        ' as ',
                        React.createElement("img", { src: DirectionInImage }),
                        "\u00A0source"),
                    criteria.linkDirection === 'out' && React.createElement("span", null,
                        ' as ',
                        React.createElement("img", { src: DirectionOutImage }),
                        "\u00A0target"))));
        }
        return React.createElement("div", { className: CLASS_NAME + "__criterions" }, criterions);
    };
    InstancesSearch.prototype.renderRemoveCriterionButtons = function (onClick) {
        return React.createElement("div", { className: CLASS_NAME + "__criterion-remove btn-group btn-group-xs" },
            React.createElement("button", { type: 'button', className: 'btn btn-default', title: 'Remove criteria', onClick: onClick },
                React.createElement("span", { className: 'fa fa-times', "aria-hidden": 'true' })));
    };
    InstancesSearch.prototype.renderSearchResults = function () {
        var _this = this;
        var items = this.state.items || [];
        return React.createElement("ul", { className: CLASS_NAME + "__results" }, items.map(function (model, index) { return React.createElement(listElementView_1.ListElementView, { key: index, model: model, view: _this.props.view, disabled: Boolean(_this.props.view.model.getElement(model.id)), selected: _this.state.selectedItems[model.id] || false, onClick: function () {
                return _this.setState({
                    selectedItems: __assign({}, _this.state.selectedItems, (_a = {}, _a[model.id] = !_this.state.selectedItems[model.id], _a)),
                });
                var _a;
            }, onDragStart: function (e) {
                var elementIds = Object.keys(__assign({}, _this.state.selectedItems, (_a = {}, _a[model.id] = true, _a)));
                try {
                    e.dataTransfer.setData('application/x-ontodia-elements', JSON.stringify(elementIds));
                }
                catch (ex) {
                    e.dataTransfer.setData('text', JSON.stringify(elementIds));
                }
                return false;
                var _a;
            } }); }));
    };
    InstancesSearch.prototype.submitCriteriaUpdate = function () {
        var text = this.state.inputText === undefined ? this.props.criteria.text : this.state.inputText;
        text = text === '' ? undefined : text;
        this.props.onCriteriaChanged(__assign({}, this.props.criteria, { text: text }));
    };
    InstancesSearch.prototype.componentDidMount = function () {
        var _this = this;
        this.listener.listenTo(this.props.view, 'change:language', function () { return _this.forceUpdate(); });
        this.listener.listenTo(this.props.view.model.cells, 'add remove reset', function () {
            var selectedItems = __assign({}, _this.state.selectedItems);
            for (var _i = 0, _a = Object.keys(selectedItems); _i < _a.length; _i++) {
                var id = _a[_i];
                if (selectedItems[id] && _this.props.view.model.getElement(id)) {
                    delete selectedItems[id];
                }
            }
            _this.setState({ selectedItems: selectedItems });
        });
        this.queryItems(false);
    };
    InstancesSearch.prototype.componentWillReceiveProps = function (nextProps) {
        var _this = this;
        var languageChanged = this.currentRequest
            ? this.currentRequest.languageCode !== nextProps.view.getLanguage() : false;
        if (this.props.criteria !== nextProps.criteria || languageChanged) {
            this.setState({ inputText: undefined }, function () { return _this.queryItems(false); });
        }
    };
    InstancesSearch.prototype.componentWillUnmount = function () {
        this.listener.stopListening();
        this.currentRequest = undefined;
    };
    InstancesSearch.prototype.queryItems = function (loadMoreItems) {
        var _this = this;
        var request;
        if (loadMoreItems) {
            if (!this.currentRequest) {
                throw new Error('Cannot request more items without initial request.');
            }
            var _a = this.currentRequest, offset = _a.offset, limit = _a.limit;
            request = __assign({}, this.currentRequest, { offset: offset + limit });
        }
        else {
            request = createRequest(this.props.criteria, this.props.view.getLanguage());
        }
        if (!(request.text || request.elementTypeId || request.refElementId || request.refElementLinkId)) {
            this.setState({
                quering: false,
                error: undefined,
                items: undefined,
                moreItemsAvailable: false,
                selectedItems: {},
            });
            return;
        }
        this.currentRequest = request;
        this.setState({
            quering: true,
            error: undefined,
            moreItemsAvailable: false,
        });
        this.props.view.model.dataProvider.filter(request).then(function (elements) {
            if (_this.currentRequest !== request) {
                return;
            }
            _this.processFilterData(elements);
        }).catch(function (error) {
            if (_this.currentRequest !== request) {
                return;
            }
            console.error(error);
            _this.setState({ error: error });
        });
    };
    InstancesSearch.prototype.processFilterData = function (elements) {
        var selectedItems = __assign({}, this.state.selectedItems);
        var newItems = [];
        for (var elementId in elements) {
            if (!elements.hasOwnProperty(elementId)) {
                continue;
            }
            var element = elements[elementId];
            newItems.push(element);
            delete selectedItems[element.id];
        }
        var requestedAdditionalItems = this.currentRequest.offset > 0;
        var items = requestedAdditionalItems
            ? this.state.items.concat(newItems) : newItems;
        var resultId = this.state.resultId;
        if (!requestedAdditionalItems) {
            resultId += 1;
        }
        this.setState({
            quering: false,
            resultId: resultId,
            items: items,
            error: undefined,
            moreItemsAvailable: newItems.length >= this.currentRequest.limit,
            selectedItems: selectedItems,
        });
    };
    return InstancesSearch;
}(React.Component));
exports.InstancesSearch = InstancesSearch;
function createRequest(criteria, language) {
    return {
        text: criteria.text,
        elementTypeId: criteria.elementTypeId,
        refElementId: criteria.refElementId,
        refElementLinkId: criteria.refElementLinkId,
        linkDirection: criteria.linkDirection,
        offset: 0,
        limit: 100,
        languageCode: language ? language : 'en',
    };
}
function formatLabel(view, uri, label) {
    return label ? view.getLocalizedText(label.values).text : model_1.uri2name(uri);
}
