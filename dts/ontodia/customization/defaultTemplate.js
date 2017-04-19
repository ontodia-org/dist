"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var CLASS_NAME = 'ontodia-default-template';
var DefaultTemplate = (function (_super) {
    __extends(DefaultTemplate, _super);
    function DefaultTemplate() {
        return _super.apply(this, arguments) || this;
    }
    DefaultTemplate.prototype.render = function () {
        var props = this.props;
        var imageStyle = { borderBottomColor: props.color };
        var image = props.imgUrl ? (React.createElement("div", { className: CLASS_NAME + "__thumbnail" },
            React.createElement("img", { src: props.imgUrl, style: imageStyle }))) : undefined;
        var propertyTable;
        if (props.propsAsList && props.propsAsList.length > 0) {
            propertyTable = React.createElement("div", { className: 'ontodia-default-template_body_expander_property-table' }, props.propsAsList.map(function (prop) {
                var values = prop.property.values.map(function (_a, index) {
                    var text = _a.text;
                    return React.createElement("div", { className: 'ontodia-default-template_body_expander_property-table_row_key_values__value', key: index, title: text }, text);
                });
                return (React.createElement("div", { key: prop.id, className: 'ontodia-default-template_body_expander_property-table_row' },
                    React.createElement("div", { title: prop.name + ' (' + prop.id + ')', className: 'ontodia-default-template_body_expander_property-table_row__key' }, prop.name),
                    React.createElement("div", { className: 'ontodia-default-template_body_expander_property-table_row_key_values' }, values)));
            }));
        }
        else {
            propertyTable = React.createElement("div", null, "no properties");
        }
        var expander = props.isExpanded ? (React.createElement("div", null,
            React.createElement("div", { className: 'ontodia-default-template_body_expander' },
                React.createElement("div", { className: 'ontodia-default-template_body_expander__iri_label' }, "IRI:"),
                React.createElement("div", { className: 'ontodia-default-template_body_expander_iri' },
                    React.createElement("a", { className: 'ontodia-default-template_body_expander_iri__link', href: props.iri, title: props.iri }, props.iri))),
            React.createElement("hr", { className: 'ontodia-default-template_body_expander__hr' }),
            propertyTable)) : undefined;
        return (React.createElement("div", { className: 'ontodia-default-template', style: {
                backgroundColor: props.color,
                borderColor: props.color,
            }, "data-expanded": this.props.isExpanded },
            React.createElement("div", { className: 'ontodia-default-template_type-line', title: props.label },
                React.createElement("div", { className: props.icon + " ontodia-default-template_type-line__icon", "aria-hidden": 'true' }),
                React.createElement("div", { title: props.types, className: 'ontodia-default-template_type-line_text-container' },
                    React.createElement("div", { className: 'ontodia-default-template_type-line_text-container__text' }, props.types))),
            image,
            React.createElement("div", { className: 'ontodia-default-template_body', style: { borderColor: props.color } },
                React.createElement("label", { className: 'ontodia-default-template_body__label', title: props.label }, props.label),
                expander)));
    };
    return DefaultTemplate;
}(React.Component));
exports.DefaultTemplate = DefaultTemplate;
