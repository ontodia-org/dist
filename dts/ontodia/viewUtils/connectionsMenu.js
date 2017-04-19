"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Backbone = require("backbone");
var joint = require("jointjs");
var React = require("react");
var ReactDOM = require("react-dom");
var elements_1 = require("../diagram/elements");
var model_1 = require("../diagram/model");
var MENU_OFFSET = 40;
var ALL_RELATED_ELEMENTS_LINK = new elements_1.FatLinkType({
    id: 'allRelatedElements',
    index: -1,
    label: { values: [{ lang: '', text: 'All' }] },
    diagram: null,
});
var ConnectionsMenu = (function () {
    function ConnectionsMenu(options) {
        var _this = this;
        this.options = options;
        this.addSelectedElements = function (selectedObjects) {
            var positionBoxSide = Math.round(Math.sqrt(selectedObjects.length)) + 1;
            var GRID_STEP = 100;
            var pos;
            if (_this.cellView.model instanceof joint.dia.Element) {
                pos = _this.cellView.model.position(); // the position() is more stable than getBBox
            }
            else {
                pos = _this.cellView.getBBox();
            }
            var startX = pos.x - positionBoxSide * GRID_STEP / 2;
            var startY = pos.y - positionBoxSide * GRID_STEP / 2;
            var xi = 0;
            var yi = 0;
            var addedElements = [];
            selectedObjects.forEach(function (el) {
                var element = _this.view.model.getElement(el.model.id);
                if (!element) {
                    element = _this.view.model.createElement(el.model);
                }
                addedElements.push(element);
                if (xi > positionBoxSide) {
                    xi = 0;
                    yi++;
                }
                if (xi === Math.round(positionBoxSide / 2)) {
                    xi++;
                }
                if (yi === Math.round(positionBoxSide / 2)) {
                    yi++;
                }
                element.position(startX + (xi++) * GRID_STEP, startY + (yi) * GRID_STEP);
            });
            var hasChosenLinkType = _this.selectedLink && _this.selectedLink !== ALL_RELATED_ELEMENTS_LINK;
            if (hasChosenLinkType && !_this.selectedLink.visible) {
                // prevent loading here because of .requestLinksOfType() call
                _this.selectedLink.setVisibility({ visible: true, showLabel: true }, { preventLoading: true });
            }
            _this.view.model.requestElementData(addedElements);
            _this.view.model.requestLinksOfType();
            _this.options.view.adjustPaper();
            _this.options.onClose();
        };
        this.onExpandLink = function (link, direction) {
            if (_this.selectedLink !== link || !_this.objects || _this.direction !== direction) {
                _this.loadObjects(link, direction);
            }
            _this.render();
        };
        this.onMoveToFilter = function (link, direction) {
            if (link === ALL_RELATED_ELEMENTS_LINK) {
                var element = _this.cellView.model;
                element.addToFilter();
            }
            else {
                var selectedElement = _this.view.model.getElement(_this.cellView.model.id);
                selectedElement.addToFilter(link, direction);
            }
        };
        this.render = function () {
            var connectionsData = {
                links: _this.links || [],
                countMap: _this.countMap || {},
            };
            var objectsData = null;
            if (_this.selectedLink && _this.objects) {
                objectsData = {
                    selectedLink: _this.selectedLink,
                    objects: _this.objects,
                };
            }
            ReactDOM.render(React.createElement(ConnectionsMenuMarkup, {
                cellView: _this.options.cellView,
                connectionsData: connectionsData,
                objectsData: objectsData,
                state: _this.state,
                lang: _this.view.getLanguage(),
                onExpandLink: _this.onExpandLink,
                onPressAddSelected: _this.addSelectedElements,
                onMoveToFilter: _this.onMoveToFilter,
            }), _this.container);
        };
        this.container = document.createElement('div');
        this.options.paper.el.appendChild(this.container);
        this.cellView = this.options.cellView;
        this.view = this.options.view;
        this.handler = new Backbone.Model();
        this.handler.listenTo(this.options.cellView.model, 'change:isExpanded change:position change:size', this.render);
        this.handler.listenTo(this.options.paper, 'scale', this.render);
        this.handler.listenTo(this.view, 'change:language', this.render);
        this.loadLinks();
        this.render();
    }
    ConnectionsMenu.prototype.subscribeOnLinksEevents = function (linksOfElement) {
        for (var _i = 0, linksOfElement_1 = linksOfElement; _i < linksOfElement_1.length; _i++) {
            var link = linksOfElement_1[_i];
            this.handler.listenTo(link, 'change:label', this.render);
            this.handler.listenTo(link, 'change:visible', this.render);
            this.handler.listenTo(link, 'change:showLabel', this.render);
        }
        ;
    };
    ConnectionsMenu.prototype.unsubscribeOnLinksEevents = function (linksOfElement) {
        for (var _i = 0, linksOfElement_2 = linksOfElement; _i < linksOfElement_2.length; _i++) {
            var link = linksOfElement_2[_i];
            this.handler.stopListening(link);
        }
        ;
    };
    ConnectionsMenu.prototype.loadLinks = function () {
        var _this = this;
        this.state = 'loading';
        this.links = [];
        this.countMap = {};
        this.view.model.dataProvider.linkTypesOf({ elementId: this.cellView.model.id })
            .then(function (linkTypes) {
            _this.state = 'completed';
            var countMap = {};
            var links = [];
            for (var _i = 0, linkTypes_1 = linkTypes; _i < linkTypes_1.length; _i++) {
                var linkCount = linkTypes_1[_i];
                countMap[linkCount.id] = {
                    inCount: linkCount.inCount,
                    outCount: linkCount.outCount,
                };
                links.push(_this.view.model.getLinkType(linkCount.id));
            }
            countMap[ALL_RELATED_ELEMENTS_LINK.id] = Object.keys(countMap)
                .map(function (key) { return countMap[key]; })
                .reduce(function (a, b) {
                return { inCount: a.inCount + b.inCount, outCount: a.outCount + b.outCount };
            }, { inCount: 0, outCount: 0 });
            _this.countMap = countMap;
            _this.unsubscribeOnLinksEevents(_this.links);
            _this.links = links;
            _this.subscribeOnLinksEevents(_this.links);
            _this.render();
        })
            .catch(function (err) {
            console.error(err);
            _this.state = 'error';
            _this.render();
        });
    };
    ConnectionsMenu.prototype.loadObjects = function (link, direction) {
        var _this = this;
        this.state = 'loading';
        this.selectedLink = link;
        this.objects = [];
        this.direction = direction;
        var _a = this.countMap[link.id], inCount = _a.inCount, outCount = _a.outCount;
        var count = direction === 'in' ? inCount :
            direction === 'out' ? outCount :
                (inCount + outCount);
        var requestsCount = Math.ceil(count / 100);
        var requests = [];
        for (var i = 0; i < requestsCount; i++) {
            requests.push(this.view.model.dataProvider.linkElements({
                elementId: this.cellView.model.id,
                linkId: (link === ALL_RELATED_ELEMENTS_LINK ? undefined : this.selectedLink.id),
                limit: 100,
                offset: i * 100,
                direction: direction,
            }));
        }
        Promise.all(requests).then(function (results) {
            _this.state = 'completed';
            _this.objects = [];
            results.forEach(function (elements) {
                Object.keys(elements).forEach(function (key) { return _this.objects.push({
                    model: elements[key],
                    presentOnDiagram: Boolean(_this.view.model.getElement(key)),
                }); });
            });
            _this.render();
        }).catch(function (err) {
            console.error(err);
            _this.state = 'error';
            _this.render();
        });
    };
    ConnectionsMenu.prototype.remove = function () {
        this.handler.stopListening();
        ReactDOM.unmountComponentAtNode(this.container);
        this.options.paper.el.removeChild(this.container);
    };
    return ConnectionsMenu;
}());
exports.ConnectionsMenu = ConnectionsMenu;
var ConnectionsMenuMarkup = (function (_super) {
    __extends(ConnectionsMenuMarkup, _super);
    function ConnectionsMenuMarkup(props) {
        var _this = _super.call(this, props) || this;
        _this.onChangeFilter = function (e) {
            _this.state.filterKey = e.currentTarget.value;
            _this.setState(_this.state);
        };
        _this.getTitle = function () {
            if (_this.props.objectsData && _this.state.panel === 'objects') {
                return 'Objects';
            }
            else if (_this.props.connectionsData && _this.state.panel === 'connections') {
                return 'Connections';
            }
            return 'Error';
        };
        _this.onExpandLink = function (link, direction) {
            _this.setState({ filterKey: '', panel: 'objects' });
            _this.props.onExpandLink(link, direction);
        };
        _this.onCollapseLink = function () {
            _this.setState({ filterKey: '', panel: 'connections' });
        };
        _this.getBreadCrumbs = function () {
            return (_this.props.objectsData && _this.state.panel === 'objects' ?
                React.createElement("span", { className: 'ontodia-connections-menu_bread-crumbs' },
                    React.createElement("a", { onClick: _this.onCollapseLink }, "Connections"),
                    '\u00A0' + '/' + '\u00A0',
                    model_1.chooseLocalizedText(_this.props.objectsData.selectedLink.get('label').values, _this.props.lang).text.toLowerCase())
                : '');
        };
        _this.getBody = function () {
            if (_this.props.state === 'error') {
                return React.createElement("label", { className: 'ontodia-connections-menu__error' }, "Error");
            }
            else if (_this.props.objectsData && _this.state.panel === 'objects') {
                return React.createElement(ObjectsPanel, { data: _this.props.objectsData, lang: _this.props.lang, filterKey: _this.state.filterKey, loading: _this.props.state === 'loading', onPressAddSelected: _this.props.onPressAddSelected });
            }
            else if (_this.props.connectionsData && _this.state.panel === 'connections') {
                if (_this.props.state === 'loading') {
                    return React.createElement("label", { className: 'ontodia-connections-menu__loading' }, "Loading...");
                }
                return React.createElement(ConnectionsList, { data: _this.props.connectionsData, lang: _this.props.lang, filterKey: _this.state.filterKey, onExpandLink: _this.onExpandLink, onMoveToFilter: _this.props.onMoveToFilter });
            }
            else {
                return React.createElement("div", null);
            }
        };
        _this.state = { filterKey: '', panel: 'connections' };
        return _this;
    }
    ConnectionsMenuMarkup.prototype.render = function () {
        var bBox = this.props.cellView.getBBox();
        var style = {
            top: (bBox.y + bBox.height / 2 - 150),
            left: (bBox.x + bBox.width + MENU_OFFSET),
            backgroundColor: 'white',
            border: '1px solid black',
        };
        return (React.createElement("div", { className: 'ontodia-connections-menu', style: style },
            React.createElement("label", { className: 'ontodia-connections-menu__title-label' }, this.getTitle()),
            this.getBreadCrumbs(),
            React.createElement("div", { className: 'ontodia-connections-menu_search-line' },
                React.createElement("input", { type: 'text', className: 'search-input form-control', value: this.state.filterKey, onChange: this.onChangeFilter, placeholder: 'Search for...' })),
            React.createElement("div", { className: "ontodia-connections-menu__progress-bar " +
                    ("ontodia-connections-menu__progress-bar--" + this.props.state) },
                React.createElement("div", { className: 'progress-bar progress-bar-striped active', role: 'progressbar', "aria-valuemin": '0', "aria-valuemax": '100', "aria-valuenow": '100', style: { width: '100%' } })),
            this.getBody()));
    };
    return ConnectionsMenuMarkup;
}(React.Component));
var ConnectionsList = (function (_super) {
    __extends(ConnectionsList, _super);
    function ConnectionsList(props) {
        var _this = _super.call(this, props) || this;
        _this.compareLinks = function (a, b) {
            var aLabel = a.get('label');
            var bLabel = b.get('label');
            var aText = (aLabel ? model_1.chooseLocalizedText(aLabel.values, _this.props.lang).text.toLowerCase() : null);
            var bText = (bLabel ? model_1.chooseLocalizedText(bLabel.values, _this.props.lang).text.toLowerCase() : null);
            if (aText < bText) {
                return -1;
            }
            if (aText > bText) {
                return 1;
            }
            return 0;
        };
        _this.getLinks = function () {
            return (_this.props.data.links || []).filter(function (link) {
                var label = link.get('label');
                var text = (label ? model_1.chooseLocalizedText(label.values, _this.props.lang).text.toLowerCase() : null);
                return (!_this.props.filterKey) || (text && text.indexOf(_this.props.filterKey.toLowerCase()) !== -1);
            })
                .sort(_this.compareLinks);
        };
        _this.getViews = function (links) {
            var countMap = _this.props.data.countMap || {};
            var views = [];
            var _loop_1 = function (link) {
                ['in', 'out'].forEach(function (direction) {
                    var count = 0;
                    if (direction === 'in') {
                        count = countMap[link.id].inCount;
                    }
                    else if (direction === 'out') {
                        count = countMap[link.id].outCount;
                    }
                    if (count !== 0) {
                        views.push(React.createElement(LinkInPopupMenu, { key: direction + "-" + link.id, link: link, onExpandLink: _this.props.onExpandLink, lang: _this.props.lang, count: count, direction: direction, filterKey: _this.props.filterKey, onMoveToFilter: _this.props.onMoveToFilter }));
                    }
                });
            };
            for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                var link = links_1[_i];
                _loop_1(link);
            }
            return views;
        };
        return _this;
    }
    ConnectionsList.prototype.render = function () {
        var links = this.getLinks();
        var views = this.getViews(links);
        var viewList;
        if (views.length === 0) {
            viewList = React.createElement("label", { className: 'ontodia-connections-menu_links-list__empty' }, "List empty");
        }
        else {
            viewList = views;
            if (links.length > 1) {
                var countMap = this.props.data.countMap || {};
                var allRelatedElements = countMap[ALL_RELATED_ELEMENTS_LINK.id];
                viewList = [
                    React.createElement(LinkInPopupMenu, { key: ALL_RELATED_ELEMENTS_LINK.id, link: ALL_RELATED_ELEMENTS_LINK, onExpandLink: this.props.onExpandLink, lang: this.props.lang, count: allRelatedElements.inCount + allRelatedElements.outCount, onMoveToFilter: this.props.onMoveToFilter }),
                    React.createElement("hr", { key: 'ontodia-hr-line', className: 'ontodia-connections-menu_links-list__hr' }),
                ].concat(viewList);
            }
        }
        return React.createElement("ul", { className: 'ontodia-connections-menu_links-list '
                + (views.length === 0 ? 'ocm_links-list-empty' : '') }, viewList);
    };
    return ConnectionsList;
}(React.Component));
var LinkInPopupMenu = (function (_super) {
    __extends(LinkInPopupMenu, _super);
    function LinkInPopupMenu(props) {
        var _this = _super.call(this, props) || this;
        _this.onExpandLink = function (direction) {
            _this.props.onExpandLink(_this.props.link, direction);
        };
        _this.onMoveToFilter = function (evt) {
            evt.stopPropagation();
            _this.props.onMoveToFilter(_this.props.link, _this.props.direction);
        };
        return _this;
    }
    LinkInPopupMenu.prototype.render = function () {
        var _this = this;
        var fullText = model_1.chooseLocalizedText(this.props.link.get('label').values, this.props.lang).text;
        var textLine = getColoredText(fullText, this.props.filterKey);
        var directionName = this.props.direction === 'in' ? 'source' :
            this.props.direction === 'out' ? 'target' :
                'all connected';
        var navigationTitle = "Navigate to " + directionName + " \"" + fullText + "\" elements";
        return (React.createElement("li", { "data-linkTypeId": this.props.link.id, className: 'link-in-popup-menu', title: navigationTitle, onClick: function () { return _this.onExpandLink(_this.props.direction); } },
            this.props.direction === 'in' && React.createElement("div", { className: 'link-in-popup-menu__in-direction' }),
            this.props.direction === 'out' && React.createElement("div", { className: 'link-in-popup-menu__out-direction' }),
            React.createElement("div", { className: 'link-in-popup-menu__link-title' }, textLine),
            React.createElement("span", { className: 'badge link-in-popup-menu__count' }, this.props.count),
            React.createElement("a", { className: 'filter-button', onClick: this.onMoveToFilter, title: 'Set as filter in the Instances panel' },
                React.createElement("img", null)),
            React.createElement("div", { className: 'link-in-popup-menu__navigate-button', title: navigationTitle })));
    };
    return LinkInPopupMenu;
}(React.Component));
var ObjectsPanel = (function (_super) {
    __extends(ObjectsPanel, _super);
    function ObjectsPanel(props) {
        var _this = _super.call(this, props) || this;
        _this.updateCheckMap = function () {
            _this.props.data.objects.forEach(function (element) {
                if (_this.state.checkMap[element.model.id] === undefined) {
                    _this.state.checkMap[element.model.id] = true;
                }
            });
        };
        _this.onCheckboxChanged = function (object, value) {
            if (_this.state.checkMap[object.model.id] === value) {
                return;
            }
            _this.state.checkMap[object.model.id] = value;
            var filtered = _this.getFilteredObjects().map(function (o) { return o.model.id; });
            var keys = Object.keys(_this.state.checkMap).filter(function (key) { return filtered.indexOf(key) !== -1; });
            var unchekedListElementLength = keys.filter(function (key) { return !_this.state.checkMap[key]; }).length;
            if (!value && unchekedListElementLength === keys.length) {
                _this.state.selectAll = 'unchecked';
            }
            else if (unchekedListElementLength === 0) {
                _this.state.selectAll = 'checked';
            }
            else {
                _this.state.selectAll = 'undefined';
            }
            _this.setState(_this.state);
        };
        _this.onSelectAll = function () {
            var checked = !_this.selectAllValue();
            if (checked) {
                _this.state.selectAll = 'checked';
            }
            else {
                _this.state.selectAll = 'unchecked';
            }
            var filtered = _this.getFilteredObjects().filter(function (o) { return !o.presentOnDiagram; }).map(function (o) { return o.model.id; });
            var keys = Object.keys(_this.state.checkMap).filter(function (key) { return filtered.indexOf(key) !== -1; });
            keys.forEach(function (key) {
                _this.state.checkMap[key] = checked;
            });
            _this.setState(_this.state);
        };
        _this.selectAllValue = function () {
            if (_this.state.selectAll === 'undefined' || _this.state.selectAll === 'checked') {
                return true;
            }
            else {
                return false;
            }
        };
        _this.getFilteredObjects = function () {
            return _this.props.data.objects
                .filter(function (element) {
                var label = element.model.label;
                var text = (label ? model_1.chooseLocalizedText(label.values, _this.props.lang).text.toLowerCase() : null);
                return (!_this.props.filterKey) || (text && text.indexOf(_this.props.filterKey.toLowerCase()) !== -1);
            });
        };
        _this.getObjects = function (list) {
            var keyMap = {};
            return list.filter(function (obj) {
                if (keyMap[obj.model.id]) {
                    return false;
                }
                else {
                    keyMap[obj.model.id] = true;
                    return true;
                }
            }).map(function (obj) {
                return React.createElement(ElementInPopupMenu, { key: obj.model.id, element: obj, lang: _this.props.lang, filterKey: _this.props.filterKey, checked: _this.state.checkMap[obj.model.id], onCheckboxChanged: _this.onCheckboxChanged });
            });
        };
        _this.addSelected = function () {
            _this.props.onPressAddSelected(_this.getFilteredObjects().filter(function (el) { return _this.state.checkMap[el.model.id] && !el.presentOnDiagram; }));
        };
        _this.state = { checkMap: {}, selectAll: 'checked' };
        _this.updateCheckMap();
        return _this;
    }
    ObjectsPanel.prototype.render = function () {
        var _this = this;
        this.updateCheckMap();
        var objects = this.getFilteredObjects();
        var objectViews = this.getObjects(objects);
        var activeObjCount = objects.filter(function (el) { return _this.state.checkMap[el.model.id] && !el.presentOnDiagram; }).length;
        var countString = activeObjCount.toString() + '\u00A0of\u00A0' + this.props.data.objects.length;
        return React.createElement("div", { className: 'ontodia-connections-menu_objects-panel' },
            React.createElement("div", { className: 'ontodia-connections-menu_objects-panel__select-all', onClick: this.onSelectAll },
                React.createElement("input", { className: this.state.selectAll === 'undefined' ? 'undefined' : '', type: 'checkbox', checked: this.selectAllValue(), onChange: function () { }, disabled: this.props.data.objects.length === 0 }),
                React.createElement("span", null, "Select All")),
            (this.props.loading ?
                React.createElement("label", { className: 'ontodia-connections-menu__loading-objects' }, "Loading...")
                : React.createElement("div", { className: 'ontodia-connections-menu_objects-panel_objects-list' }, objectViews)),
            React.createElement("div", { className: 'ontodia-connections-menu_objects-panel_bottom-panel' },
                React.createElement("label", { className: 'ontodia-connections-menu_objects-panel_bottom-panel__count-label' },
                    React.createElement("span", null, countString)),
                React.createElement("button", { className: 'btn btn-primary pull-right ' +
                        'ontodia-connections-menu_objects-panel_bottom-panel__add-button', disabled: this.props.loading || activeObjCount === 0, onClick: this.addSelected }, "Add selected")));
    };
    return ObjectsPanel;
}(React.Component));
var ElementInPopupMenu = (function (_super) {
    __extends(ElementInPopupMenu, _super);
    function ElementInPopupMenu(props) {
        var _this = _super.call(this, props) || this;
        _this.onCheckboxChange = function () {
            if (_this.props.element.presentOnDiagram) {
                return;
            }
            _this.state.checked = !_this.state.checked;
            _this.setState(_this.state);
            _this.props.onCheckboxChanged(_this.props.element, _this.state.checked);
        };
        _this.state = { checked: _this.props.checked };
        return _this;
    }
    ElementInPopupMenu.prototype.componentWillReceiveProps = function (props) {
        this.setState({ checked: props.checked });
    };
    ElementInPopupMenu.prototype.render = function () {
        var fullText = model_1.chooseLocalizedText(this.props.element.model.label.values, this.props.lang).text;
        var textLine = getColoredText(fullText, this.props.filterKey);
        return (React.createElement("li", { "data-linkTypeId": this.props.element.model.id, className: 'element-in-popup-menu'
                + (!this.state.checked ? ' unchecked' : ''), onClick: this.onCheckboxChange },
            React.createElement("input", { type: 'checkbox', checked: this.state.checked, onChange: function () { }, className: 'element-in-popup-menu__checkbox', disabled: this.props.element.presentOnDiagram }),
            React.createElement("div", { className: 'element-in-popup-menu__link-label', title: this.props.element.presentOnDiagram ?
                    'Element \'' + fullText + '\' already present on diagram!' : fullText, style: { fontStyle: (this.props.element.presentOnDiagram ? 'italic' : 'inherit') } }, textLine)));
    };
    return ElementInPopupMenu;
}(React.Component));
function getColoredText(fullText, filterKey) {
    if (filterKey) {
        filterKey = filterKey.toLowerCase();
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
}
