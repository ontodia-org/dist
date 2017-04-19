"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Backbone = require("backbone");
/**
 * Model of 'connections' component.
 *
 * Properties:
 *     selectedElement: Element
 *
 * Events:
 *     state:beginQuery
 *     state:endQuery
 *     state:queryError
 */
var LinkTypesToolboxModel = (function (_super) {
    __extends(LinkTypesToolboxModel, _super);
    function LinkTypesToolboxModel(diagram) {
        var _this = _super.call(this) || this;
        _this.diagram = diagram;
        _this.listenTo(_this, 'change:selectedElement', _this.onSelectedElementChanged);
        return _this;
    }
    LinkTypesToolboxModel.prototype.onSelectedElementChanged = function (self, element) {
        var _this = this;
        this.trigger('state:beginQuery');
        if (element) {
            var request_1 = { elementId: element.id };
            this.currentRequest = request_1;
            this.diagram.dataProvider.linkTypesOf(request_1).then(function (linkTypes) {
                if (_this.currentRequest !== request_1) {
                    return;
                }
                _this.connectionsOfSelectedElement = {};
                for (var _i = 0, linkTypes_1 = linkTypes; _i < linkTypes_1.length; _i++) {
                    var linkType = linkTypes_1[_i];
                    _this.connectionsOfSelectedElement[linkType.id] = linkType.inCount + linkType.outCount;
                }
                _this.trigger('state:endQuery');
            }).catch(function (error) {
                if (_this.currentRequest !== request_1) {
                    return;
                }
                console.error(error);
                _this.trigger('state:queryError');
            });
        }
        else {
            this.currentRequest = null;
            this.connectionsOfSelectedElement = null;
            this.trigger('state:endQuery');
        }
    };
    return LinkTypesToolboxModel;
}(Backbone.Model));
exports.LinkTypesToolboxModel = LinkTypesToolboxModel;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LinkTypesToolboxModel;
