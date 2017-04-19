"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Backbone = require("backbone");
var _ = require("lodash");
var $ = require("jquery");
// bundling jstree to solve issues with multiple jquery packages,
// when jstree sets itself as plugin to wrong version of jquery
var jstreeJQuery = require('exports?require("jquery")!jstree');
require('jstree/dist/themes/default/style.css');
var CLASS_NAME = 'ontodia-class-tree';
/**
 * Events:
 *     action:classSelected(classId: string)
 */
var ClassTree = (function (_super) {
    __extends(ClassTree, _super);
    function ClassTree(options) {
        var _this = _super.call(this, _.extend({ className: CLASS_NAME }, options)) || this;
        _this.filter = null;
        _this.tree = null;
        _this.rest = null;
        var selfLink = _this;
        _this.$el.addClass(_.result(_this, 'className'));
        _this.view = options.view;
        _this.model.set('language', _this.view.getLanguage(), { silent: true });
        _this.listenTo(_this.view, 'change:language', _this.onLanguageChanged);
        _this.rest = $("<div class=\"" + CLASS_NAME + "__rest\"></div>");
        _this.tree = $("<div class=\"" + CLASS_NAME + "__tree\"></div>").appendTo(_this.rest);
        // Input for search in classTree
        _this.filter = $("<div class=\"" + CLASS_NAME + "__filter\"></div>");
        var innerDiv = $("<div class=\"" + CLASS_NAME + "__filter-group\"></div>").appendTo(_this.filter);
        var searchInput = $('<input type="text" class="search-input form-control" placeholder="Search for..."/>')
            .appendTo(innerDiv);
        _this.listenTo(_this.view.model, 'state:dataLoaded', function () {
            var model = _this.view.model;
            var tree = model.classTree;
            var iconMap = _this.updateClassLabels(tree);
            _this.setUrls(tree);
            _this.getJSTree().jstree({
                'plugins': ['types', 'sort', 'search'],
                'core': { 'data': tree },
                'types': iconMap,
                'sort': function (firstClassId, secondClassId) {
                    return model.getClassesById(firstClassId).model.text.localeCompare(model.getClassesById(secondClassId).model.text);
                },
                'search': {
                    'case_insensitive': true,
                    'show_only_matches': true,
                },
            });
            _this.getJSTree().on('select_node.jstree', function (e, data) {
                _this.trigger('action:classSelected', data.selected[0]);
            });
            searchInput.keyup(function () {
                var searchString = $(this).val();
                selfLink.getJSTree().jstree('search', searchString);
            });
        });
        return _this;
    }
    ClassTree.prototype.updateClassLabels = function (roots) {
        var iconMap = {
            'default': { icon: 'default-tree-icon' },
            'has-not-children': { icon: 'default-tree-icon' },
            'has-children': { icon: 'parent-tree-icon' },
        };
        if (roots) {
            var _loop_1 = function (i) {
                var element = roots[i];
                var icon = this_1.view.getTypeStyle([element.id]).icon;
                var iconId = void 0;
                if (icon) {
                    iconId = _.uniqueId('iconId');
                    iconMap[iconId] = { icon: icon + ' ontodia-tree-icon' };
                }
                if ('children' in element) {
                    var innerMap_1 = this_1.updateClassLabels(element.children);
                    Object.keys(innerMap_1).forEach(function (key) {
                        iconMap[key] = innerMap_1[key];
                    });
                    if (element.children.length !== 0) {
                        element.type = (iconId ? iconId : 'has-children');
                    }
                    else {
                        element.type = (iconId ? iconId : 'has-not-children');
                    }
                }
                else {
                    element.type = (iconId ? iconId : 'has-not-children');
                }
                element.text = this_1.view.getLocalizedText(element.label.values).text + (!isNaN(element.count) ? ' (' + element.count + ')' : '');
            };
            var this_1 = this;
            for (var i = 0; i < roots.length; i++) {
                _loop_1(i);
            }
        }
        return iconMap;
    };
    ClassTree.prototype.getJSTree = function () {
        return jstreeJQuery(this.tree.get(0));
    };
    ClassTree.prototype.onLanguageChanged = function () {
        // this.updateClassLabels(this.view.model.classTree);
        var jsTree = this.getJSTree().jstree(true);
        jsTree.settings.core.data = this.view.model.classTree;
        jsTree.refresh(/* do not show loading indicator */ true, undefined);
    };
    ClassTree.prototype.setUrls = function (tree) {
        var _this = this;
        tree.forEach(function (el) {
            _this.setUrlsRec(el);
        });
    };
    ClassTree.prototype.setUrlsRec = function (root) {
        var _this = this;
        root.a_attr = { href: '#' + root.id, draggable: true };
        root.children.forEach(function (el) { return _this.setUrlsRec(el); });
    };
    ClassTree.prototype.render = function () {
        this.filter.appendTo(this.$el);
        this.rest.appendTo(this.$el);
        return this;
    };
    return ClassTree;
}(Backbone.View));
exports.ClassTree = ClassTree;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClassTree;
