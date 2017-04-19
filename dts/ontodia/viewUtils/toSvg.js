"use strict";
var _ = require("lodash");
var joint = require("jointjs");
var detectBrowser_1 = require("./detectBrowser");
/**
 * Padding (in px) for <foreignObject> elements of exported SVG to
 * mitigate issues with elements body overflow caused by missing styles
 * in exported image.
 */
var ForeignObjectSizePadding = 2;
function toSVG(paper, opt) {
    if (opt === void 0) { opt = {}; }
    if (detectBrowser_1.isIE11()) {
        return Promise.reject(new Error('Export to SVG is not supported in the Internet Explorer'));
    }
    var viewportTransform = paper.viewport.getAttribute('transform');
    paper.viewport.setAttribute('transform', '');
    var bbox = paper.getContentBBox();
    var _a = clonePaperSvg(paper, ForeignObjectSizePadding), svgClone = _a.svgClone, imageBounds = _a.imageBounds;
    paper.viewport.setAttribute('transform', viewportTransform || '');
    svgClone.removeAttribute('style');
    if (opt.preserveDimensions) {
        svgClone.setAttribute('width', bbox.width.toString());
        svgClone.setAttribute('height', bbox.height.toString());
    }
    else {
        svgClone.setAttribute('width', '100%');
        svgClone.setAttribute('height', '100%');
    }
    svgClone.setAttribute('viewBox', bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height);
    var nodes = svgClone.querySelectorAll('img');
    var convertImagesStartingAt = function (index, done) {
        if (index >= nodes.length) {
            done();
            return;
        }
        var img = nodes[index];
        var _a = imageBounds[nodeRelativePath(svgClone, img)], width = _a.width, height = _a.height;
        img.setAttribute('width', width.toString());
        img.setAttribute('height', height.toString());
        if (opt.convertImagesToDataUris) {
            joint.util.imageToDataUri(img.src, function (err, dataUri) {
                // check for empty svg data URI which happens when mockJointXHR catches an exception
                if (dataUri && dataUri !== 'data:image/svg+xml,') {
                    img.src = dataUri;
                }
                convertImagesStartingAt(index + 1, done);
            });
        }
        else {
            convertImagesStartingAt(index + 1, done);
        }
    };
    return new Promise(function (resolve) {
        var mock = mockJointXHR();
        convertImagesStartingAt(0, function () {
            mock.dispose();
            resolve();
        });
    }).then(function () {
        // workaround to include only ontodia-related stylesheets
        var cssTexts = extractCSSFromDocument(function (text) { return text.indexOf('.ontodia') >= 0; });
        var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = "<style>" + cssTexts.join('\n') + "</style>";
        svgClone.insertBefore(defs, svgClone.firstChild);
        if (opt.elementsToRemoveSelector) {
            foreachNode(svgClone.querySelectorAll(opt.elementsToRemoveSelector), function (node) { return node.remove(); });
        }
        return new XMLSerializer().serializeToString(svgClone);
    });
}
exports.toSVG = toSVG;
function extractCSSFromDocument(shouldInclude) {
    var cssTexts = [];
    for (var i = 0; i < document.styleSheets.length; i++) {
        var rules = void 0;
        try {
            var cssSheet = document.styleSheets[i];
            rules = cssSheet.cssRules || cssSheet.rules;
            if (!rules) {
                continue;
            }
        }
        catch (e) {
            continue;
        }
        var ruleTexts = [];
        var allowToInclude = false;
        for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            if (rule instanceof CSSStyleRule) {
                var text = rule.cssText;
                ruleTexts.push(rule.cssText);
                if (shouldInclude(text)) {
                    allowToInclude = true;
                }
            }
        }
        if (allowToInclude) {
            cssTexts.push(ruleTexts.join('\n'));
        }
    }
    return cssTexts;
}
function clonePaperSvg(paper, elementSizePadding) {
    var svgClone = paper.svg.cloneNode(true);
    var imageBounds = {};
    var cells = paper.model.get('cells');
    foreachNode(svgClone.querySelectorAll('g.element'), function (separatedView) {
        var modelId = separatedView.getAttribute('model-id');
        var overlayedView = paper.el.querySelector(".ontodia-overlayed-element[model-id='" + modelId + "']");
        if (!overlayedView) {
            return;
        }
        var newRoot = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        var model = cells.get(modelId);
        var modelSize = model.get('size');
        newRoot.setAttribute('width', modelSize.width + elementSizePadding);
        newRoot.setAttribute('height', modelSize.height + elementSizePadding);
        var overlayedViewContent = overlayedView.firstChild;
        newRoot.appendChild(overlayedViewContent.cloneNode(true));
        separatedView.setAttribute('class', separatedView.getAttribute('class') + " ontodia-exported-element");
        var oldRoot = separatedView.querySelector('.rootOfUI');
        var rootParent = oldRoot.parentElement;
        rootParent.removeChild(oldRoot);
        rootParent.appendChild(newRoot);
        foreachNode(overlayedViewContent.querySelectorAll('img'), function (img) {
            var rootPath = nodeRelativePath(svgClone, rootParent);
            var imgPath = nodeRelativePath(overlayedViewContent, img);
            // combine path "from SVG to root" and "from root to image"
            // with additional separator to consider newly added nodes
            imageBounds[rootPath + ':0:0:' + imgPath] = {
                width: img.clientWidth,
                height: img.clientHeight,
            };
        });
    });
    return { svgClone: svgClone, imageBounds: imageBounds };
}
/**
 * Mock XMLHttpRequest for joint.util.imageToDataUri as workaround to uncatchable
 * DOMException in synchronous xhr.send() call when Joint trying to load SVG image.
 *
 * @param onSyncSendError callback called on error
 */
function mockJointXHR(onSyncSendError) {
    try {
        var oldXHR_1 = XMLHttpRequest;
        XMLHttpRequest = (function () {
            function class_1() {
                this.xhr = new oldXHR_1();
                this.responseText = '';
            }
            class_1.prototype.open = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                this.xhr.open.apply(this.xhr, args);
            };
            class_1.prototype.send = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    this.xhr.send.apply(this.xhr, args);
                }
                catch (e) {
                    if (onSyncSendError) {
                        onSyncSendError(e);
                    }
                }
            };
            return class_1;
        }());
        var disposed_1 = false;
        var dispose = function () {
            if (disposed_1) {
                return;
            }
            disposed_1 = true;
            XMLHttpRequest = oldXHR_1;
        };
        return { dispose: dispose };
    }
    catch (e) {
        // do nothing if failed to mock XHR
        return { dispose: function () { } };
    }
}
function foreachNode(nodeList, callback) {
    for (var i = 0; i < nodeList.length; i++) {
        callback(nodeList[i]);
    }
}
/**
 * Returns colon-separeted path from `parent` to `child` where each part
 * corresponds to child index at each tree level.
 *
 * @example
 * <div id='root'>
 *   <span></span>
 *   <ul>
 *     <li id='target'></li>
 *     <li></li>
 *   </ul>
 * </div>
 *
 * nodeRelativePath(root, target) === '1:0'
 */
function nodeRelativePath(parent, child) {
    var path = [];
    var current = child;
    while (current && current !== parent) {
        var sibling = current;
        var indexAtLevel = 0;
        while (sibling = sibling.previousSibling) {
            indexAtLevel++;
        }
        path.unshift(indexAtLevel);
        current = current.parentNode;
    }
    return path.join(':');
}
function toDataURL(paper, options) {
    return new Promise(function (resolve, reject) {
        options = options || {};
        options.type = options.type || 'image/png';
        var imageRect;
        var contentHeight;
        var contentWidth;
        var padding = options.padding || 0;
        var clientRect = paper.viewport.getBoundingClientRect();
        imageRect = fitRectKeepingAspectRatio(clientRect.width || 1, clientRect.height || 1, options.width, options.height);
        padding = Math.min(padding, imageRect.width / 2 - 1, imageRect.height / 2 - 1);
        contentWidth = imageRect.width - 2 * padding;
        contentHeight = imageRect.height - 2 * padding;
        var img = new Image();
        img.onload = function () {
            var dataURL;
            var context;
            var canvas;
            function createCanvas() {
                canvas = document.createElement('canvas');
                canvas.width = imageRect.width;
                canvas.height = imageRect.height;
                context = canvas.getContext('2d');
                context.fillStyle = options.backgroundColor || 'white';
                context.fillRect(0, 0, imageRect.width, imageRect.height);
            }
            createCanvas();
            try {
                context.drawImage(img, padding, padding, contentWidth, contentHeight);
                dataURL = canvas.toDataURL(options.type, options.quality);
                resolve(dataURL);
            }
            catch (e) {
                reject(e);
                return;
            }
        };
        var svgOptions = _.clone(options.svgOptions || { convertImagesToDataUris: true });
        svgOptions.convertImagesToDataUris = true;
        toSVG(paper, svgOptions).then(function (svgString) {
            svgString = svgString
                .replace('width="100%"', 'width="' + contentWidth + '"')
                .replace('height="100%"', 'height="' + contentHeight + '"');
            img.src = 'data:image/svg+xml,' + encodeURIComponent(svgString);
        });
    });
}
exports.toDataURL = toDataURL;
function fitRectKeepingAspectRatio(sourceWidth, sourceHeight, targetWidth, targetHeight) {
    if (!targetWidth && !targetHeight) {
        return { width: sourceWidth, height: sourceHeight };
    }
    var sourceAspectRatio = sourceWidth / sourceHeight;
    targetWidth = targetWidth || targetHeight * sourceAspectRatio;
    targetHeight = targetHeight || targetWidth / sourceAspectRatio;
    if (targetHeight * sourceAspectRatio <= targetWidth) {
        return { width: targetHeight * sourceAspectRatio, height: targetHeight };
    }
    else {
        return { width: targetWidth, height: targetWidth / sourceAspectRatio };
    }
}
exports.fitRectKeepingAspectRatio = fitRectKeepingAspectRatio;
/**
  * Creates and returns a blob from a data URL (either base64 encoded or not).
  *
  * @param {string} dataURL The data URL to convert.
  * @return {Blob} A blob representing the array buffer data.
  */
function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) === -1) {
        var parts_1 = dataURL.split(',');
        var contentType_1 = parts_1[0].split(':')[1];
        var raw_1 = decodeURIComponent(parts_1[1]);
        return new Blob([raw_1], { type: contentType_1 });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);
    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}
exports.dataURLToBlob = dataURLToBlob;
