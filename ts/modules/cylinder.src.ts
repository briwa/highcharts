/* *
 *
 *  Highcharts cylinder - a 3D series
 *
 *  (c) 2010-2019 Highsoft AS
 *
 *  Author: Kacper Madej
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
        class CylinderPoint extends ColumnPoint {
            public options: CylinderPointOptions;
            public series: CylinderSeries;
        }
        class CylinderSeries extends ColumnSeries {
            public data: Array<CylinderPoint>;
            public options: CylinderSeriesOptions;
            public pointClass: typeof CylinderPoint;
            public points: Array<CylinderPoint>;
        }
        interface CylinderMethodsObject extends CuboidMethodsObject {
            parts: Array<string>;
            pathType: string;
            fillSetter(fill: ColorType): SVGElement;
        }
        interface CylinderPathsObject extends SVGPath3dObject {
            back: SVGPathArray;
            bottom: SVGPathArray;
            front: SVGPathArray;
            top: SVGPathArray;
            zIndexes: Dictionary<number>;
        }
        interface CylinderPointOptions extends ColumnPointOptions {
            shapeType?: string;
        }
        interface CylinderSeriesOptions extends ColumnSeriesOptions {
            states?: SeriesStatesOptionsObject<CylinderSeries>;
        }
        interface Elements3dObject {
            cylinder?: CylinderMethodsObject;
        }
        interface SVGRenderer {
            cylinder(shapeArgs: SVGAttributes): SVGElement;
            cylinderPath(shapeArgs: SVGAttributes): CylinderPathsObject;
            getCurvedPath(points: Array<PositionObject>): SVGPathArray;
            getCylinderBack(
                topPath: SVGPathArray,
                bottomPath: SVGPathArray
            ): SVGPathArray;
            getCylinderEnd(
                chart: Chart,
                shapeArgs: SVGAttributes,
                isBottom?: boolean
            ): SVGPathArray;
            getCylinderFront(
                topPath: SVGPathArray,
                bottomPath: SVGPathArray
            ): SVGPathArray;
        }
        interface SeriesTypesDictionary {
            cylinder: typeof CylinderSeries;
        }
    }
}

import U from '../parts/Utilities.js';
const {
    pick
} = U;
import '../parts/ColumnSeries.js';
import '../parts/SvgRenderer.js';

var charts = H.charts,
    color = H.color,
    deg2rad = H.deg2rad,
    perspective = H.perspective,
    seriesType = H.seriesType,

    // Work on H.Renderer instead of H.SVGRenderer for VML support.
    RendererProto = H.Renderer.prototype,
    cuboidPath = RendererProto.cuboidPath,
    cylinderMethods;

/**
  * The cylinder series type.
  *
  * @requires module:highcharts-3d
  * @requires module:modules/cylinder
  *
  * @private
  * @class
  * @name Highcharts.seriesTypes.cylinder
  *
  * @augments Highcharts.Series
  */
seriesType<Highcharts.CylinderSeries>(
    'cylinder',
    'column',
    /**
     * A cylinder graph is a variation of a 3d column graph. The cylinder graph
     * features cylindrical points.
     *
     * @sample {highcharts} highcharts/demo/cylinder/
     *         Cylinder graph
     *
     * @extends      plotOptions.column
     * @since        7.0.0
     * @product      highcharts
     * @excluding    allAreas, boostThreshold, colorAxis, compare, compareBase,
     *               dragDrop
     * @optionparent plotOptions.cylinder
     */
    {},
    {},
    /** @lends Highcharts.seriesTypes.cylinder#pointClass# */
    {
        shapeType: 'cylinder',
        hasNewShapeType: H
            .seriesTypes.column.prototype
            .pointClass.prototype
            .hasNewShapeType
    }
);

/**
 * A `cylinder` series. If the [type](#series.cylinder.type) option is not
 * specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.cylinder
 * @since     7.0.0
 * @product   highcharts
 * @excluding allAreas, boostThreshold, colorAxis, compare, compareBase
 * @apioption series.cylinder
 */

/**
 * An array of data points for the series. For the `cylinder` series type,
 * points can be given in the following ways:
 *
 * 1. An array of numerical values. In this case, the numerical values will be
 *    interpreted as `y` options. The `x` values will be automatically
 *    calculated, either starting at 0 and incremented by 1, or from
 *    `pointStart` and `pointInterval` given in the series options. If the axis
 *    has categories, these will be used. Example:
 *    ```js
 *    data: [0, 5, 3, 5]
 *    ```
 *
 * 2. An array of arrays with 2 values. In this case, the values correspond to
 *    `x,y`. If the first value is a string, it is applied as the name of the
 *    point, and the `x` value is inferred.
 *    ```js
 *    data: [
 *        [0, 0],
 *        [1, 8],
 *        [2, 9]
 *    ]
 *    ```
 *
 * 3. An array of objects with named values. The following snippet shows only a
 *    few settings, see the complete options set below. If the total number of
 *    data points exceeds the series'
 *    [turboThreshold](#series.cylinder.turboThreshold), this option is not
 *    available.
 *
 *    ```js
 *    data: [{
 *        x: 1,
 *        y: 2,
 *        name: "Point2",
 *        color: "#00FF00"
 *    }, {
 *        x: 1,
 *        y: 4,
 *        name: "Point1",
 *        color: "#FF00FF"
 *    }]
 *    ```
 *
 * @sample {highcharts} highcharts/chart/reflow-true/
 *         Numerical values
 * @sample {highcharts} highcharts/series/data-array-of-arrays/
 *         Arrays of numeric x and y
 * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
 *         Arrays of datetime x and y
 * @sample {highcharts} highcharts/series/data-array-of-name-value/
 *         Arrays of point.name and y
 * @sample {highcharts} highcharts/series/data-array-of-objects/
 *         Config objects
 *
 * @type      {Array<number|Array<(number|string),(number|null)>|null|*>}
 * @extends   series.column.data
 * @product   highcharts highstock
 * @apioption series.cylinder.data
 */

// cylinder extends cuboid
cylinderMethods = H.merge(RendererProto.elements3d.cuboid, {
    parts: ['top', 'bottom', 'front', 'back'],
    pathType: 'cylinder',

    fillSetter: function (
        this: Highcharts.SVGElement,
        fill: Highcharts.ColorType
    ): Highcharts.SVGElement {
        this.singleSetterForParts('fill', null, {
            front: fill,
            back: fill,
            top: color(fill).brighten(0.1).get(),
            bottom: color(fill).brighten(-0.1).get()
        });

        // fill for animation getter (#6776)
        this.color = this.fill = fill;

        return this;
    }
});

RendererProto.elements3d.cylinder = cylinderMethods;

RendererProto.cylinder = function (
    shapeArgs: Highcharts.SVGAttributes
): Highcharts.SVGElement {
    return this.element3d('cylinder', shapeArgs);
};

// Generates paths and zIndexes.
RendererProto.cylinderPath = function (
    shapeArgs: Highcharts.SVGAttributes
): Highcharts.CylinderPathsObject {
    var renderer = this,
        chart = charts[renderer.chartIndex],

        // decide zIndexes of parts based on cubiod logic, for consistency.
        cuboidData = cuboidPath.call(renderer, shapeArgs),
        isTopFirst = !cuboidData.isTop,
        isFronFirst = !cuboidData.isFront,

        top = renderer.getCylinderEnd(chart as any, shapeArgs),
        bottom = renderer.getCylinderEnd(chart as any, shapeArgs, true);

    return {
        front: renderer.getCylinderFront(top, bottom),
        back: renderer.getCylinderBack(top, bottom),
        top: top,
        bottom: bottom,
        zIndexes: {
            top: isTopFirst ? 3 : 0,
            bottom: isTopFirst ? 0 : 3,

            front: isFronFirst ? 2 : 1,
            back: isFronFirst ? 1 : 2,

            group: cuboidData.zIndexes.group
        }
    };
};

// Returns cylinder Front path
RendererProto.getCylinderFront = function (
    topPath: Highcharts.SVGPathArray,
    bottomPath: Highcharts.SVGPathArray
): Highcharts.SVGPathArray {
    var path = topPath.slice(0, (topPath as any).simplified ? 9 : 17);

    path.push('L');
    if ((bottomPath as any).simplified) {
        path = path
            .concat(bottomPath.slice(7, 9))
            .concat(bottomPath.slice(3, 6))
            .concat(bottomPath.slice(0, 3));

        // change 'M' into 'L'
        path[path.length - 3] = 'L';
    } else {
        path.push(
            bottomPath[15], bottomPath[16],
            'C',
            bottomPath[13], bottomPath[14],
            bottomPath[11], bottomPath[12],
            bottomPath[8], bottomPath[9],
            'C',
            bottomPath[6], bottomPath[7],
            bottomPath[4], bottomPath[5],
            bottomPath[1], bottomPath[2]
        );
    }
    path.push('Z');

    return path;
};

// Returns cylinder Back path
RendererProto.getCylinderBack = function (
    topPath: Highcharts.SVGPathArray,
    bottomPath: Highcharts.SVGPathArray
): Highcharts.SVGPathArray {
    var path: Highcharts.SVGPathArray = ['M'];

    if ((topPath as any).simplified) {
        path = path.concat(topPath.slice(7, 12));

        // end at start
        path.push(
            'L',
            topPath[1], topPath[2]
        );
    } else {
        path = path.concat(topPath.slice(15));
    }

    path.push('L');
    if ((bottomPath as any).simplified) {
        path = path
            .concat(bottomPath.slice(1, 3))
            .concat(bottomPath.slice(9, 12))
            .concat(bottomPath.slice(6, 9));
    } else {
        path.push(
            bottomPath[29], bottomPath[30],
            'C',
            bottomPath[27], bottomPath[28],
            bottomPath[25], bottomPath[26],
            bottomPath[22], bottomPath[23],
            'C',
            bottomPath[20], bottomPath[21],
            bottomPath[18], bottomPath[19],
            bottomPath[15], bottomPath[16]
        );
    }
    path.push('Z');

    return path;
};

// Retruns cylinder path for top or bottom
RendererProto.getCylinderEnd = function (
    chart: Highcharts.Chart,
    shapeArgs: Highcharts.SVGAttributes,
    isBottom?: boolean
): Highcharts.SVGPathArray {
    // A half of the smaller one out of width or depth (optional, because
    // there's no depth for a funnel that reuses the code)
    var depth = pick(shapeArgs.depth, shapeArgs.width),
        radius = Math.min(shapeArgs.width, depth) / 2,

        // Approximated longest diameter
        angleOffset = deg2rad * (
            (chart.options.chart as any).options3d.beta - 90 +
            (shapeArgs.alphaCorrection || 0)
        ),

        // Could be top or bottom of the cylinder
        y = shapeArgs.y + (isBottom ? shapeArgs.height : 0),

        // Use cubic Bezier curve to draw a cricle in x,z (y is constant).
        // More math. at spencermortensen.com/articles/bezier-circle/
        c = 0.5519 * radius,
        centerX = shapeArgs.width / 2 + shapeArgs.x,
        centerZ = depth / 2 + shapeArgs.z,

        // points could be generated in a loop, but readability will plummet
        points: Array<Highcharts.Position3dObject> = [{ // M - starting point
            x: 0,
            y: y,
            z: radius

        }, { // C1 - control point 1
            x: c,
            y: y,
            z: radius
        }, { // C1 - control point 2
            x: radius,
            y: y,
            z: c
        }, { // C1 - end point
            x: radius,
            y: y,
            z: 0

        }, { // C2 - control point 1
            x: radius,
            y: y,
            z: -c
        }, { // C2 - control point 2
            x: c,
            y: y,
            z: -radius
        }, { // C2 - end point
            x: 0,
            y: y,
            z: -radius

        }, { // C3 - control point 1
            x: -c,
            y: y,
            z: -radius
        }, { // C3 - control point 2
            x: -radius,
            y: y,
            z: -c
        }, { // C3 - end point
            x: -radius,
            y: y,
            z: 0

        }, { // C4 - control point 1
            x: -radius,
            y: y,
            z: c
        }, { // C4 - control point 2
            x: -c,
            y: y,
            z: radius
        }, { // C4 - end point
            x: 0,
            y: y,
            z: radius
        }],
        cosTheta = Math.cos(angleOffset),
        sinTheta = Math.sin(angleOffset),
        perspectivePoints,
        path,
        x, z;

    // rotete to match chart's beta and translate to the shape center
    points.forEach(function (
        point: Highcharts.Position3dObject,
        i: number
    ): void {
        x = point.x;
        z = point.z;

        // x′ = (x * cosθ − z * sinθ) + centerX
        // z′ = (z * cosθ + x * sinθ) + centerZ
        points[i].x = (x * cosTheta - z * sinTheta) + centerX;
        points[i].z = (z * cosTheta + x * sinTheta) + centerZ;
    });
    perspectivePoints = perspective(points, chart, true);

    // check for sub-pixel curve issue, compare front and back edges
    if (
        Math.abs(perspectivePoints[3].y - perspectivePoints[9].y) < 2.5 &&
        Math.abs(perspectivePoints[0].y - perspectivePoints[6].y) < 2.5
    ) {
        // use simplied shape
        path = this.toLinePath([
            perspectivePoints[0],
            perspectivePoints[3],
            perspectivePoints[6],
            perspectivePoints[9]
        ], true);
        (path as any).simplified = true;
    } else {
        // or default curved path to imitate ellipse (2D circle)
        path = this.getCurvedPath(perspectivePoints);
    }

    return path;
};

// Returns curved path in format of:
// [ M, x, y, ...[C, cp1x, cp2y, cp2x, cp2y, epx, epy]*n_times ]
// (cp - control point, ep - end point)
RendererProto.getCurvedPath = function (
    points: Array<Highcharts.PositionObject>
): Highcharts.SVGPathArray {
    var path: Highcharts.SVGPathArray = [
            'M',
            points[0].x as any, points[0].y as any
        ],
        limit = points.length - 2,
        i;

    for (i = 1; i < limit; i += 3) {
        path.push(
            'C',
            points[i].x as any, points[i].y as any,
            points[i + 1].x as any, points[i + 1].y as any,
            points[i + 2].x as any, points[i + 2].y as any
        );
    }
    return path;
};
