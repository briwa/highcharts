/* *
 *
 *  Highcharts module to hide overlapping data labels.
 *  This module is included in Highcharts.
 *
 *  (c) 2009-2019 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import H from '../parts/Globals.js';
import U from '../parts/Utilities.js';
var isArray = U.isArray, objectEach = U.objectEach, pick = U.pick;
import '../parts/Chart.js';
var Chart = H.Chart, addEvent = H.addEvent, fireEvent = H.fireEvent;
/* eslint-disable no-invalid-this */
// Collect potensial overlapping data labels. Stack labels probably don't need
// to be considered because they are usually accompanied by data labels that lie
// inside the columns.
addEvent(Chart, 'render', function collectAndHide() {
    var labels = [];
    // Consider external label collectors
    (this.labelCollectors || []).forEach(function (collector) {
        labels = labels.concat(collector());
    });
    (this.yAxis || []).forEach(function (yAxis) {
        if (yAxis.options.stackLabels &&
            !yAxis.options.stackLabels.allowOverlap) {
            objectEach(yAxis.stacks, function (stack) {
                objectEach(stack, function (stackItem) {
                    labels.push(stackItem.label);
                });
            });
        }
    });
    (this.series || []).forEach(function (series) {
        var dlOptions = series.options.dataLabels;
        if (series.visible &&
            !(dlOptions.enabled === false && !series._hasPointLabels)) { // #3866
            series.points.forEach(function (point) {
                if (point.visible) {
                    var dataLabels = (isArray(point.dataLabels) ?
                        point.dataLabels :
                        (point.dataLabel ? [point.dataLabel] : []));
                    dataLabels.forEach(function (label) {
                        var options = label.options;
                        label.labelrank = pick(options.labelrank, point.labelrank, point.shapeArgs && point.shapeArgs.height); // #4118
                        if (!options.allowOverlap) {
                            labels.push(label);
                        }
                    });
                }
            });
        }
    });
    this.hideOverlappingLabels(labels);
});
/**
 * Hide overlapping labels. Labels are moved and faded in and out on zoom to
 * provide a smooth visual imression.
 *
 * @private
 * @function Highcharts.Chart#hideOverlappingLabels
 * @param {Array<Highcharts.SVGElement>} labels
 * Rendered data labels
 * @return {void}
 */
Chart.prototype.hideOverlappingLabels = function (labels) {
    var chart = this, len = labels.length, ren = chart.renderer, label, i, j, label1, label2, box1, box2, isIntersectRect = function (box1, box2) {
        return !(box2.x > box1.x + box1.width ||
            box2.x + box2.width < box1.x ||
            box2.y > box1.y + box1.height ||
            box2.y + box2.height < box1.y);
    }, 
    // Get the box with its position inside the chart, as opposed to getBBox
    // that only reports the position relative to the parent.
    getAbsoluteBox = function (label) {
        var pos, parent, bBox, 
        // Substract the padding if no background or border (#4333)
        padding = label.box ? 0 : (label.padding || 0), lineHeightCorrection = 0;
        if (label &&
            (!label.alignAttr || label.placed)) {
            var x = label.attr('x');
            var y = label.attr('y');
            if (typeof x === 'number' && typeof y === 'number') {
                pos = { x: x, y: y };
            }
            else {
                pos = label.alignAttr;
            }
            parent = label.parentGroup;
            // Get width and height if pure text nodes (stack labels)
            if (!label.width) {
                bBox = label.getBBox();
                label.width = bBox.width;
                label.height = bBox.height;
                // Labels positions are computed from top left corner, so
                // we need to substract the text height from text nodes too.
                lineHeightCorrection = ren
                    .fontMetrics(null, label.element).h;
            }
            return {
                x: pos.x + (parent.translateX || 0) + padding,
                y: pos.y + (parent.translateY || 0) + padding -
                    lineHeightCorrection,
                width: label.width - 2 * padding,
                height: label.height - 2 * padding
            };
        }
    };
    for (i = 0; i < len; i++) {
        label = labels[i];
        if (label) {
            // Mark with initial opacity
            label.oldOpacity = label.opacity;
            label.newOpacity = 1;
            label.absoluteBox = getAbsoluteBox(label);
        }
    }
    // Prevent a situation in a gradually rising slope, that each label will
    // hide the previous one because the previous one always has lower rank.
    labels.sort(function (a, b) {
        return (b.labelrank || 0) - (a.labelrank || 0);
    });
    // Detect overlapping labels
    for (i = 0; i < len; i++) {
        label1 = labels[i];
        box1 = label1 && label1.absoluteBox;
        for (j = i + 1; j < len; ++j) {
            label2 = labels[j];
            box2 = label2 && label2.absoluteBox;
            if (box1 &&
                box2 &&
                label1 !== label2 && // #6465, polar chart with connectEnds
                label1.newOpacity !== 0 &&
                label2.newOpacity !== 0) {
                if (isIntersectRect(box1, box2)) {
                    (label1.labelrank < label2.labelrank ? label1 : label2)
                        .newOpacity = 0;
                }
            }
        }
    }
    // Hide or show
    labels.forEach(function (label) {
        var complete, newOpacity;
        if (label) {
            newOpacity = label.newOpacity;
            if (label.oldOpacity !== newOpacity) {
                // Make sure the label is completely hidden to avoid catching
                // clicks (#4362)
                if (label.alignAttr && label.placed) { // data labels
                    if (newOpacity) {
                        label.show(true);
                    }
                    else {
                        complete = function () {
                            label.hide(true);
                            label.placed = false; // avoid animation from top
                        };
                    }
                    // Animate or set the opacity
                    label.alignAttr.opacity = newOpacity;
                    label[label.isOld ? 'animate' : 'attr'](label.alignAttr, null, complete);
                    fireEvent(chart, 'afterHideOverlappingLabels');
                }
                else { // other labels, tick labels
                    label.attr({
                        opacity: newOpacity
                    });
                }
            }
            label.isOld = true;
        }
    });
};
