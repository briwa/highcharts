/* *
 *
 *  (c) 2010-2019 Torstein Honsi
 *
 *  Extenstion for 3d axes
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import H from '../parts/Globals.js';

/**
 * Internal types
 * @private
 */
declare global {
    namespace Highcharts {
        interface Axis {
            swapZ(
                p: Position3dObject,
                insidePlotArea?: boolean
            ): Position3dObject;
        }
        interface Chart {
            zAxis?: Array<ZAxis>;
        }
        interface Options {
            zAxis?: (ZAxisOptions|Array<ZAxisOptions>);
        }
        interface Point {
            crosshairPos?: number;
            axisXpos?: number;
            axisYpos?: number;
            axisZpos?: number;
        }
        interface Position3dObject {
            matrix?: Array<number>;
        }
        interface XAxisLabelsOptions {
            position3d?: OptionsPosition3dValue;
            skew3d?: boolean;
        }
        interface XAxisTitleOptions {
            position3d?: ('chart'|'flap'|'offset'|'ortho'|null);
            skew3d?: (boolean|null);
        }
        class ZAxis extends Axis {
            public ignoreMaxPadding: (boolean|null);
            public ignoreMinPadding: (boolean|null);
            public isZAxis: boolean;
            public getSeriesExtremes(): void;
            public setAxisSize(): void;
        }
    }
}

import U from '../parts/Utilities.js';
const {
    extend,
    pick,
    splat
} = U;

import '../parts/Axis.js';
import '../parts/Chart.js';
import '../parts/Tick.js';

var ZAxis: typeof Highcharts.Axis,
    addEvent = H.addEvent,
    Axis = H.Axis,
    Chart = H.Chart,
    deg2rad = H.deg2rad,
    merge = H.merge,
    perspective = H.perspective,
    perspective3D = H.perspective3D,
    shapeArea = H.shapeArea,
    Tick = H.Tick,
    wrap = H.wrap;

/**
 * @optionparent xAxis
 */
var extendedOptions: Highcharts.AxisOptions = {
    labels: {
        /**
         * Defines how the labels are be repositioned according to the 3D chart
         * orientation.
         *
         * - `'offset'`: Maintain a fixed horizontal/vertical distance from the
         *   tick marks, despite the chart orientation. This is the backwards
         *   compatible behavior, and causes skewing of X and Z axes.
         *
         * - `'chart'`: Preserve 3D position relative to the chart.
         *   This looks nice, but hard to read if the text isn't
         *   forward-facing.
         *
         * - `'flap'`: Rotated text along the axis to compensate for the chart
         *   orientation. This tries to maintain text as legible as possible
         *   on all orientations.
         *
         * - `'ortho'`: Rotated text along the axis direction so that the labels
         *   are orthogonal to the axis. This is very similar to `'flap'`,
         *   but prevents skewing the labels (X and Y scaling are still
         *   present).
         *
         * @sample highcharts/3d/skewed-labels/
         *         Skewed labels
         *
         * @since      5.0.15
         * @validvalue ['offset', 'chart', 'flap', 'ortho']
         * @product    highcharts
         */
        position3d: 'offset',

        /**
         * If enabled, the axis labels will skewed to follow the perspective.
         *
         * This will fix overlapping labels and titles, but texts become less
         * legible due to the distortion.
         *
         * The final appearance depends heavily on `labels.position3d`.
         *
         * @sample highcharts/3d/skewed-labels/
         *         Skewed labels
         *
         * @since   5.0.15
         * @product highcharts
         */
        skew3d: false
    },
    title: {
        /**
         * Defines how the title is repositioned according to the 3D chart
         * orientation.
         *
         * - `'offset'`: Maintain a fixed horizontal/vertical distance from the
         *   tick marks, despite the chart orientation. This is the backwards
         *   compatible behavior, and causes skewing of X and Z axes.
         *
         * - `'chart'`: Preserve 3D position relative to the chart.
         *   This looks nice, but hard to read if the text isn't
         *   forward-facing.
         *
         * - `'flap'`: Rotated text along the axis to compensate for the chart
         *   orientation. This tries to maintain text as legible as possible on
         *   all orientations.
         *
         * - `'ortho'`: Rotated text along the axis direction so that the labels
         *   are orthogonal to the axis. This is very similar to `'flap'`, but
         *   prevents skewing the labels (X and Y scaling are still present).
         *
         * - `undefined`: Will use the config from `labels.position3d`
         *
         * @sample highcharts/3d/skewed-labels/
         *         Skewed labels
         *
         * @type       {"offset"|"chart"|"flap"|"ortho"|null}
         * @since      5.0.15
         * @product    highcharts
         */
        position3d: null,

        /**
         * If enabled, the axis title will skewed to follow the perspective.
         *
         * This will fix overlapping labels and titles, but texts become less
         * legible due to the distortion.
         *
         * The final appearance depends heavily on `title.position3d`.
         *
         * A `null` value will use the config from `labels.skew3d`.
         *
         * @sample highcharts/3d/skewed-labels/
         *         Skewed labels
         *
         * @type    {boolean|null}
         * @since   5.0.15
         * @product highcharts
         */
        skew3d: null
    }
};

/* eslint-disable no-invalid-this */

merge(true, Axis.prototype.defaultOptions, extendedOptions);


addEvent(Axis, 'afterSetOptions', function (): void {
    var options;

    if (this.chart.is3d && this.chart.is3d() && this.coll !== 'colorAxis') {
        options = this.options;
        options.tickWidth = pick(options.tickWidth, 0);
        options.gridLineWidth = pick(options.gridLineWidth, 1);
    }
});

wrap(Axis.prototype, 'getPlotLinePath', function (
    this: Highcharts.Axis,
    proceed: Function
): Highcharts.SVGPathArray {
    var path = proceed.apply(this, [].slice.call(arguments, 1));

    // Do not do this if the chart is not 3D
    if (!this.chart.is3d() || this.coll === 'colorAxis') {
        return path;
    }

    if (path === null) {
        return path;
    }

    var chart = this.chart,
        options3d = (chart.options.chart as any).options3d,
        d = this.isZAxis ? chart.plotWidth : options3d.depth,
        frame = chart.frame3d;

    var pArr = [
        this.swapZ({ x: path[1], y: path[2], z: 0 }),
        this.swapZ({ x: path[1], y: path[2], z: d }),
        this.swapZ({ x: path[4], y: path[5], z: 0 }),
        this.swapZ({ x: path[4], y: path[5], z: d })
    ];

    var pathSegments = [];

    if (!this.horiz) { // Y-Axis
        if (frame.front.visible) {
            pathSegments.push(pArr[0], pArr[2]);
        }
        if (frame.back.visible) {
            pathSegments.push(pArr[1], pArr[3]);
        }
        if (frame.left.visible) {
            pathSegments.push(pArr[0], pArr[1]);
        }
        if (frame.right.visible) {
            pathSegments.push(pArr[2], pArr[3]);
        }
    } else if (this.isZAxis) { // Z-Axis
        if (frame.left.visible) {
            pathSegments.push(pArr[0], pArr[2]);
        }
        if (frame.right.visible) {
            pathSegments.push(pArr[1], pArr[3]);
        }
        if (frame.top.visible) {
            pathSegments.push(pArr[0], pArr[1]);
        }
        if (frame.bottom.visible) {
            pathSegments.push(pArr[2], pArr[3]);
        }
    } else { // X-Axis
        if (frame.front.visible) {
            pathSegments.push(pArr[0], pArr[2]);
        }
        if (frame.back.visible) {
            pathSegments.push(pArr[1], pArr[3]);
        }
        if (frame.top.visible) {
            pathSegments.push(pArr[0], pArr[1]);
        }
        if (frame.bottom.visible) {
            pathSegments.push(pArr[2], pArr[3]);
        }
    }

    pathSegments = perspective(pathSegments, this.chart, false);

    return this.chart.renderer.toLineSegments(pathSegments);
});

// Do not draw axislines in 3D
wrap(Axis.prototype, 'getLinePath', function (
    this: Highcharts.Axis,
    proceed: Function
): Highcharts.SVGPathArray {
    // Do not do this if the chart is not 3D
    if (!this.chart.is3d() || this.coll === 'colorAxis') {
        return proceed.apply(this, [].slice.call(arguments, 1));
    }

    return [];
});

wrap(Axis.prototype, 'getPlotBandPath', function (
    this: Highcharts.Axis,
    proceed: Function
): Highcharts.SVGPathArray {
    // Do not do this if the chart is not 3D
    if (!this.chart.is3d() || this.coll === 'colorAxis') {
        return proceed.apply(this, [].slice.call(arguments, 1));
    }

    var args = arguments,
        from = args[1],
        to = args[2],
        path = [] as Highcharts.SVGPathArray,
        fromPath = this.getPlotLinePath({ value: from }),
        toPath = this.getPlotLinePath({ value: to });

    if (fromPath && toPath) {
        for (var i = 0; i < fromPath.length; i += 6) {
            path.push(
                'M', fromPath[i + 1], fromPath[i + 2],
                'L', fromPath[i + 4], fromPath[i + 5],
                'L', toPath[i + 4], toPath[i + 5],
                'L', toPath[i + 1], toPath[i + 2],
                'Z'
            );
        }
    }

    return path;
});

/**
 * @private
 * @param {Highcharts.Axis} axis
 *        Related axis
 * @param {Highcharts.Position3dObject} pos
 *        Position to fix
 * @param {boolean} [isTitle]
 *        Whether this is a title position
 * @return {Highcharts.Position3dObject}
 *         Fixed position
 */
function fix3dPosition(
    axis: Highcharts.Axis,
    pos: Highcharts.Position3dObject,
    isTitle?: boolean
): Highcharts.Position3dObject {
    // Do not do this if the chart is not 3D
    if (!axis.chart.is3d() || axis.coll === 'colorAxis') {
        return pos;
    }

    var chart = axis.chart,
        alpha = deg2rad * (chart.options.chart as any).options3d.alpha,
        beta = deg2rad * (chart.options.chart as any).options3d.beta,
        positionMode = pick(
            isTitle && (axis.options.title as any).position3d,
            (axis.options.labels as any).position3d
        ),
        skew = pick(
            isTitle && (axis.options.title as any).skew3d,
            (axis.options.labels as any).skew3d
        ),
        frame = chart.frame3d,
        plotLeft = chart.plotLeft,
        plotRight = chart.plotWidth + plotLeft,
        plotTop = chart.plotTop,
        plotBottom = chart.plotHeight + plotTop,
        // Indicates we are labelling an X or Z axis on the "back" of the chart
        reverseFlap = false,
        offsetX = 0,
        offsetY = 0,
        vecX,
        vecY = { x: 0, y: 1, z: 0 };

    pos = axis.swapZ({ x: pos.x, y: pos.y, z: 0 });


    if (axis.isZAxis) { // Z Axis
        if (axis.opposite) {
            if (frame.axes.z.top === null) {
                return {} as any;
            }
            offsetY = pos.y - plotTop;
            pos.x = frame.axes.z.top.x;
            pos.y = frame.axes.z.top.y;
            vecX = frame.axes.z.top.xDir;
            reverseFlap = !frame.top.frontFacing;
        } else {
            if (frame.axes.z.bottom === null) {
                return {} as any;
            }
            offsetY = pos.y - plotBottom;
            pos.x = frame.axes.z.bottom.x;
            pos.y = frame.axes.z.bottom.y;
            vecX = frame.axes.z.bottom.xDir;
            reverseFlap = !frame.bottom.frontFacing;
        }
    } else if (axis.horiz) { // X Axis
        if (axis.opposite) {
            if (frame.axes.x.top === null) {
                return {} as any;
            }
            offsetY = pos.y - plotTop;
            pos.y = frame.axes.x.top.y;
            pos.z = frame.axes.x.top.z;
            vecX = frame.axes.x.top.xDir;
            reverseFlap = !frame.top.frontFacing;
        } else {
            if (frame.axes.x.bottom === null) {
                return {} as any;
            }
            offsetY = pos.y - plotBottom;
            pos.y = frame.axes.x.bottom.y;
            pos.z = frame.axes.x.bottom.z;
            vecX = frame.axes.x.bottom.xDir;
            reverseFlap = !frame.bottom.frontFacing;
        }
    } else { // Y Axis
        if (axis.opposite) {
            if (frame.axes.y.right === null) {
                return {} as any;
            }
            offsetX = pos.x - plotRight;
            pos.x = frame.axes.y.right.x;
            pos.z = frame.axes.y.right.z;
            vecX = frame.axes.y.right.xDir;
            // Rotate 90º on opposite edge
            vecX = { x: vecX.z, y: vecX.y, z: -vecX.x };
        } else {
            if (frame.axes.y.left === null) {
                return {} as any;
            }
            offsetX = pos.x - plotLeft;
            pos.x = frame.axes.y.left.x;
            pos.z = frame.axes.y.left.z;
            vecX = frame.axes.y.left.xDir;
        }
    }

    if (positionMode === 'chart') {
        // Labels preserve their direction relative to the chart
        // nothing to do

    } else if (positionMode === 'flap') {
        // Labels are be rotated around the axis direction to face the screen
        if (!axis.horiz) { // Y Axis
            vecX = { x: Math.cos(beta), y: 0, z: Math.sin(beta) };
        } else { // X and Z Axis
            var sin = Math.sin(alpha);
            var cos = Math.cos(alpha);

            if (axis.opposite) {
                sin = -sin;
            }
            if (reverseFlap) {
                sin = -sin;
            }
            vecY = { x: vecX.z * sin, y: cos, z: -vecX.x * sin };
        }
    } else if (positionMode === 'ortho') {
        // Labels will be rotated to be ortogonal to the axis
        if (!axis.horiz) { // Y Axis
            vecX = { x: Math.cos(beta), y: 0, z: Math.sin(beta) };
        } else { // X and Z Axis
            var sina = Math.sin(alpha);
            var cosa = Math.cos(alpha);
            var sinb = Math.sin(beta);
            var cosb = Math.cos(beta);
            var vecZ = { x: sinb * cosa, y: -sina, z: -cosa * cosb };

            vecY = {
                x: vecX.y * vecZ.z - vecX.z * vecZ.y,
                y: vecX.z * vecZ.x - vecX.x * vecZ.z,
                z: vecX.x * vecZ.y - vecX.y * vecZ.x
            };
            var scale = 1 / Math.sqrt(
                vecY.x * vecY.x + vecY.y * vecY.y + vecY.z * vecY.z
            );

            if (reverseFlap) {
                scale = -scale;
            }
            vecY = { x: scale * vecY.x, y: scale * vecY.y, z: scale * vecY.z };
        }
    } else { // positionMode  == 'offset'
        // Labels will be skewd to maintain vertical / horizontal offsets from
        // axis
        if (!axis.horiz) { // Y Axis
            vecX = { x: Math.cos(beta), y: 0, z: Math.sin(beta) };
        } else { // X and Z Axis
            vecY = {
                x: Math.sin(beta) * Math.sin(alpha),
                y: Math.cos(alpha),
                z: -Math.cos(beta) * Math.sin(alpha)
            };
        }
    }
    pos.x += offsetX * vecX.x + offsetY * vecY.x;
    pos.y += offsetX * vecX.y + offsetY * vecY.y;
    pos.z += offsetX * vecX.z + offsetY * vecY.z;

    var projected = perspective([pos], axis.chart)[0];

    if (skew) {
        // Check if the label text would be mirrored
        var isMirrored = shapeArea(perspective([
            pos,
            { x: pos.x + vecX.x, y: pos.y + vecX.y, z: pos.z + vecX.z },
            { x: pos.x + vecY.x, y: pos.y + vecY.y, z: pos.z + vecY.z }
        ], axis.chart)) < 0;

        if (isMirrored) {
            vecX = { x: -vecX.x, y: -vecX.y, z: -vecX.z };
        }

        var pointsProjected = perspective([
            { x: pos.x, y: pos.y, z: pos.z },
            { x: pos.x + vecX.x, y: pos.y + vecX.y, z: pos.z + vecX.z },
            { x: pos.x + vecY.x, y: pos.y + vecY.y, z: pos.z + vecY.z }
        ], axis.chart);

        projected.matrix = [
            pointsProjected[1].x - pointsProjected[0].x,
            pointsProjected[1].y - pointsProjected[0].y,
            pointsProjected[2].x - pointsProjected[0].x,
            pointsProjected[2].y - pointsProjected[0].y,
            projected.x,
            projected.y
        ];
        projected.matrix[4] -= projected.x * projected.matrix[0] +
            projected.y * projected.matrix[2];
        projected.matrix[5] -= projected.x * projected.matrix[1] +
            projected.y * projected.matrix[3];
    }

    return projected;
}

/*
Tick extensions
 */

wrap(Tick.prototype, 'getMarkPath', function (
    this: Highcharts.Tick,
    proceed: Function
): Highcharts.SVGPathArray {
    var path = proceed.apply(this, [].slice.call(arguments, 1));

    var pArr: Array<Highcharts.Position3dObject> = [
        fix3dPosition(this.axis, { x: path[1], y: path[2], z: 0 }),
        fix3dPosition(this.axis, { x: path[4], y: path[5], z: 0 })
    ];

    return this.axis.chart.renderer.toLineSegments(pArr);
});

addEvent(Tick, 'afterGetLabelPosition', function (
    e: {
        pos: Highcharts.Position3dObject;
        tickmarkOffset: number;
        index: number;
    }
): void {
    extend(e.pos, fix3dPosition(this.axis, e.pos));
});

wrap(Axis.prototype, 'getTitlePosition', function (
    this: Highcharts.Axis,
    proceed: Function
): Highcharts.Position3dObject {
    var pos: Highcharts.Position3dObject =
        proceed.apply(this, [].slice.call(arguments, 1));

    return fix3dPosition(this, pos, true);
});

addEvent(Axis, 'drawCrosshair', function (
    e: {
        e: Highcharts.PointerEventObject;
        point: Highcharts.Point;
    }
): void {
    if (this.chart.is3d() && this.coll !== 'colorAxis') {
        if (e.point) {
            e.point.crosshairPos = this.isXAxis ?
                e.point.axisXpos :
                this.len - (e.point.axisYpos as any);
        }
    }
});

addEvent(Axis, 'destroy', function (): void {
    ['backFrame', 'bottomFrame', 'sideFrame'].forEach(function (
        prop: string
    ): void {
        if ((this as any)[prop]) {
            (this as any)[prop] = (this as any)[prop].destroy();
        }
    }, this);
});

/*
Z-AXIS
 */

Axis.prototype.swapZ = function (
    this: Highcharts.Axis,
    p: Highcharts.Position3dObject,
    insidePlotArea?: boolean
): Highcharts.Position3dObject {
    if (this.isZAxis) {
        var plotLeft = insidePlotArea ? 0 : this.chart.plotLeft;

        return {
            x: plotLeft + p.z,
            y: p.y,
            z: p.x - plotLeft
        };
    }
    return p;
};

ZAxis = H.ZAxis = function (this: Highcharts.ZAxis): void {
    this.init.apply(this, arguments as any);
} as any;
extend(ZAxis.prototype, Axis.prototype);
extend(ZAxis.prototype, {
    isZAxis: true,
    setOptions: function (
        this: Highcharts.ZAxis,
        userOptions: Highcharts.ZAxisOptions
    ): void {
        userOptions = merge({
            offset: 0,
            lineWidth: 0
        }, userOptions);
        Axis.prototype.setOptions.call(this, userOptions);
        this.coll = 'zAxis';
    },
    setAxisSize: function (this: Highcharts.ZAxis): void {
        Axis.prototype.setAxisSize.call(this);
        this.width = this.len =
            (this.chart.options.chart as any).options3d.depth;
        this.right = this.chart.chartWidth - this.width - this.left;
    },
    getSeriesExtremes: function (this: Highcharts.ZAxis): void {
        var axis = this,
            chart = axis.chart;

        axis.hasVisibleSeries = false;

        // Reset properties in case we're redrawing (#3353)
        axis.dataMin =
            axis.dataMax =
            axis.ignoreMinPadding =
            axis.ignoreMaxPadding = null;

        if (axis.buildStacks) {
            axis.buildStacks();
        }

        // loop through this axis' series
        axis.series.forEach(function (series: Highcharts.Series): void {

            if (
                series.visible ||
                !(chart.options.chart as any).ignoreHiddenSeries
            ) {

                var seriesOptions = series.options,
                    zData: Array<(number|null|undefined)>,
                    threshold = seriesOptions.threshold;

                axis.hasVisibleSeries = true;

                // Validate threshold in logarithmic axes
                if (axis.positiveValuesOnly && (threshold as any) <= 0) {
                    threshold = null as any;
                }

                zData = series.zData as any;
                if (zData.length) {
                    axis.dataMin = Math.min(
                        pick(axis.dataMin, zData[0] as any),
                        Math.min.apply(null, zData as any)
                    );
                    axis.dataMax = Math.max(
                        pick(axis.dataMax, zData[0] as any),
                        Math.max.apply(null, zData as any)
                    );
                }
            }
        });
    }
});


// Get the Z axis in addition to the default X and Y.
addEvent(Chart, 'afterGetAxes', function (): void {
    var chart = this,
        options = this.options,
        zAxisOptions = options.zAxis = splat(options.zAxis || {});

    if (!chart.is3d()) {
        return;
    }
    this.zAxis = [];
    zAxisOptions.forEach(function (
        axisOptions: Highcharts.ZAxisOptions,
        i: number
    ): void {
        axisOptions.index = i;
        // Z-Axis is shown horizontally, so it's kind of a X-Axis
        axisOptions.isX = true;
        var zAxis = new ZAxis(chart, axisOptions);

        zAxis.setScale();
    });
});

// Wrap getSlotWidth function to calculate individual width value for each slot
// (#8042).
wrap(Axis.prototype, 'getSlotWidth', function (
    this: Highcharts.Axis,
    proceed: Function,
    tick: Highcharts.Tick
): number {
    if (this.chart.is3d() &&
        tick &&
        tick.label &&
        this.categories &&
        this.chart.frameShapes
    ) {
        var chart = this.chart,
            ticks = this.ticks,
            gridGroup = (this.gridGroup as any).element.childNodes,
            firstGridLine = gridGroup[0].getBBox(),
            frame3DLeft = chart.frameShapes.left.getBBox(),
            options3d = (chart.options.chart as any).options3d,
            origin = {
                x: chart.plotWidth / 2,
                y: chart.plotHeight / 2,
                z: options3d.depth / 2,
                vd: pick(options3d.depth, 1) * pick(options3d.viewDistance, 0)
            },
            labelPos,
            prevLabelPos,
            nextLabelPos,
            slotWidth,
            tickId = tick.pos,
            prevTick = ticks[tickId - 1],
            nextTick = ticks[tickId + 1];

        // Check whether the tick is not the first one and previous tick exists,
        // then calculate position of previous label.
        if (tickId !== 0 && prevTick && (prevTick.label as any).xy) { // #8621
            prevLabelPos = perspective3D({
                x: (prevTick.label as any).xy.x,
                y: (prevTick.label as any).xy.y,
                z: null as any
            }, origin, origin.vd);
        }
        // If next label position is defined, then recalculate its position
        // basing on the perspective.
        if (nextTick && (nextTick.label as any).xy) {
            nextLabelPos = perspective3D({
                x: (nextTick.label as any).xy.x,
                y: (nextTick.label as any).xy.y,
                z: null as any
            }, origin, origin.vd);
        }
        labelPos = {
            x: tick.label.xy.x,
            y: tick.label.xy.y,
            z: null as any
        };

        labelPos = perspective3D(labelPos, origin, origin.vd);

        // If tick is first one, check whether next label position is already
        // calculated, then return difference between the first and the second
        // label. If there is no next label position calculated, return the
        // difference between the first grid line and left 3d frame.
        slotWidth = Math.abs(
            prevLabelPos ?
                labelPos.x - prevLabelPos.x : nextLabelPos ?
                    nextLabelPos.x - labelPos.x :
                    firstGridLine.x - frame3DLeft.x
        );
        return slotWidth;
    }
    return proceed.apply(this, [].slice.call(arguments, 1));
});
