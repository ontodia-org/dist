"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var CLASS_NAME = 'ontodia-accordion';
var Accordion = (function (_super) {
    __extends(Accordion, _super);
    function Accordion(props) {
        var _this = _super.call(this, props) || this;
        _this.items = [];
        _this.onBeginDragHandle = function (itemIndex) {
            _this.originTotalHeight = _this.element.clientHeight;
            _this.originSizes = _this.computeEffectiveItemHeights();
            _this.originCollapsed = _this.state.collapsed.slice();
            _this.setState({ resizing: true }, function () {
                if (_this.props.onStartResize) {
                    _this.props.onStartResize();
                }
            });
        };
        _this.onEndDragHandle = function () {
            _this.setState({ resizing: false });
        };
        _this.sizeWhenCollapsed = function (index) {
            var item = _this.items[index];
            return item.header.clientHeight + (item.element.offsetHeight - item.element.clientHeight);
        };
        _this.onDragHandle = function (itemIndex, dx, dy) {
            var sizes = _this.originSizes.slice();
            var collapsed = _this.originCollapsed.slice();
            new SizeDistributor(sizes, collapsed, _this.originTotalHeight, _this.sizeWhenCollapsed).distribute(itemIndex + 1, dy);
            _this.setState({ sizes: sizes, collapsed: collapsed });
        };
        _this.state = {
            collapsed: React.Children.map(_this.props.children, function () { return false; }),
            resizing: false,
        };
        return _this;
    }
    Accordion.prototype.render = function () {
        var _this = this;
        var resizing = this.state.resizing;
        return (React.createElement("div", { className: CLASS_NAME + " " + (resizing ? CLASS_NAME + "--resizing" : ''), ref: function (element) { return _this.element = element; } }, this.renderItems()));
    };
    Accordion.prototype.renderItems = function () {
        var _this = this;
        var _a = this.state, sizes = _a.sizes, collapsed = _a.collapsed;
        var children = this.props.children;
        var childCount = React.Children.count(children);
        var totalHeight = this.element ? this.element.clientHeight : undefined;
        return React.Children.map(children, function (child, index) {
            var lastChild = index === children.length - 1;
            var height = sizes
                ? (collapsed[index] ? sizes[index] : 100 * sizes[index] / totalHeight + "%")
                : 100 / childCount + "%";
            var additionalProps = {
                ref: function (element) { return _this.items[index] = element; },
                collapsed: collapsed[index],
                height: height,
                onChangeCollapsed: function (newState) { return _this.onItemChangeCollapsed(index, newState); },
                onBeginDragHandle: lastChild ? undefined : function () { return _this.onBeginDragHandle(index); },
                onDragHandle: lastChild ? undefined : function (dx, dy) { return _this.onDragHandle(index, dx, dy); },
                onEndDragHandle: _this.onEndDragHandle,
            };
            return React.cloneElement(child, additionalProps);
        });
    };
    Accordion.prototype.computeEffectiveItemHeights = function () {
        var _this = this;
        return this.items.map(function (item, index) {
            if (_this.state.collapsed[index]) {
                return item.header.clientHeight;
            }
            else {
                return item.element.offsetHeight;
            }
        });
    };
    Accordion.prototype.onItemChangeCollapsed = function (itemIndex, itemCollapsed) {
        var totalHeight = this.element.clientHeight;
        var sizes = this.computeEffectiveItemHeights();
        var collapsed = this.state.collapsed.slice();
        var effectiveSize = sizes[itemIndex];
        var collapsedSize = this.sizeWhenCollapsed(itemIndex);
        var distributor = new SizeDistributor(sizes, collapsed, totalHeight, this.sizeWhenCollapsed);
        if (itemCollapsed) {
            var splitShift = Math.max(effectiveSize - collapsedSize, 0);
            sizes[itemIndex] = collapsedSize;
            if (itemIndex === sizes.length - 1) {
                distributor.expand(splitShift, 0, itemIndex);
            }
            else {
                distributor.expand(splitShift, itemIndex + 1, sizes.length);
            }
        }
        else {
            var shift = (totalHeight / sizes.length) - collapsedSize;
            var freeSize = distributor.collapse(shift, itemIndex + 1, sizes.length);
            freeSize = Math.max(freeSize, distributor.leftoverSize());
            if (freeSize < shift) {
                freeSize += distributor.collapse(shift - freeSize, 0, itemIndex);
            }
            var newSize = Math.round(collapsedSize + freeSize);
            sizes[itemIndex] = newSize;
        }
        collapsed[itemIndex] = itemCollapsed;
        this.setState({ sizes: sizes, collapsed: collapsed });
    };
    return Accordion;
}(React.Component));
exports.Accordion = Accordion;
var SizeDistributor = (function () {
    function SizeDistributor(sizes, collapsed, totalSize, sizeWhenCollapsed) {
        this.sizes = sizes;
        this.collapsed = collapsed;
        this.totalSize = totalSize;
        this.sizeWhenCollapsed = sizeWhenCollapsed;
    }
    SizeDistributor.prototype.distribute = function (splitIndex, splitShift) {
        if (splitShift > 0) {
            var freeSize = this.collapse(splitShift, splitIndex, this.sizes.length);
            freeSize = Math.max(freeSize, this.leftoverSize());
            this.expand(freeSize, 0, splitIndex);
        }
        else {
            var freeSize = this.collapse(-splitShift, 0, splitIndex);
            freeSize = Math.max(freeSize, this.leftoverSize());
            this.expand(freeSize, splitIndex, this.sizes.length);
        }
    };
    SizeDistributor.prototype.collapse = function (shift, from, to) {
        if (shift <= 0) {
            return 0;
        }
        var shiftLeft = shift;
        for (var i = to - 1; i >= from; i--) {
            if (this.collapsed[i]) {
                continue;
            }
            var size = this.sizes[i];
            var collapsedSize = this.sizeWhenCollapsed(i);
            var newSize = Math.round(Math.max(size - shiftLeft, collapsedSize));
            shiftLeft = shiftLeft - (size - newSize);
            this.sizes[i] = newSize;
            this.collapsed[i] = newSize <= collapsedSize;
        }
        return shift - shiftLeft;
    };
    SizeDistributor.prototype.expand = function (shift, from, to) {
        if (shift <= 0) {
            return 0;
        }
        var firstOpenFromEnd = this.collapsed.lastIndexOf(false, to - 1);
        var index = (firstOpenFromEnd >= from) ? firstOpenFromEnd : (to - 1);
        var oldSize = this.sizes[index];
        var newSize = Math.round(oldSize + shift);
        this.sizes[index] = newSize;
        this.collapsed[index] = newSize <= this.sizeWhenCollapsed(index);
        return newSize - oldSize;
    };
    SizeDistributor.prototype.leftoverSize = function () {
        var sizeSum = this.sizes.reduce(function (sum, size) { return sum + size; }, 0);
        return Math.max(this.totalSize - sizeSum, 0);
    };
    return SizeDistributor;
}());
