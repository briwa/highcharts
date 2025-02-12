/* *
 *
 *  Highcharts pyramid3d series module
 *
 *  (c) 2010-2019 Highsoft AS
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
        class Pyramid3dPoint extends Funnel3dPoint {
            options: Pyramid3dPointOptions;
            series: Pyramid3dSeries;
        }
        class Pyramid3dSeries extends Funnel3dSeries {
            data: Array<Pyramid3dPoint>;
            options: Pyramid3dSeriesOptions;
            pointClass: typeof Pyramid3dPoint;
            points: Array<Pyramid3dPoint>;
        }
        interface Pyramid3dPointOptions extends Funnel3dPointOptions {
        }
        interface Pyramid3dSeriesOptions extends Funnel3dSeriesOptions {
            states?: SeriesStatesOptionsObject<Pyramid3dSeries>;
        }
        interface SeriesTypesDictionary {
            pyramid3d: typeof Pyramid3dSeries;
        }
    }
}

import '../parts/Utilities.js';
import '../parts/ColumnSeries.js';
import '../parts/SvgRenderer.js';

var seriesType = H.seriesType;

/**
 * The pyramid3d series type.
 *
 * Requires `highcharts-3d.js`, `cylinder.js`, `funnel3d.js` and
 * `pyramid3d` modules.
 *
 * @constructor seriesTypes.pyramid3d
 * @augments seriesTypes.funnel3d
 */
seriesType<Highcharts.Pyramid3dSeries>('pyramid3d', 'funnel3d',
    /**
     * A pyramid3d is a 3d version of pyramid series type. Pyramid charts are
     * a type of chart often used to visualize stages in a sales project,
     * where the top are the initial stages with the most clients.
     *
     * It requires that the `highcharts-3d.js`, `cylinder.js`,
     * `funnel3d.js` and `pyramid3d` modules are loaded.
     *
     * @sample highcharts/demo/pyramid3d/
     *         Pyramid3d
     *
     * @extends      plotOptions.funnel3d
     * @excluding    neckHeight, neckWidth
     * @product      highcharts
     * @since        7.1.0
     * @optionparent plotOptions.pyramid3d
     */
    {
        /**
         * A reversed pyramid3d is funnel3d, but the latter supports neck
         * related options: neckHeight and neckWidth
         *
         * @product highcharts
         */
        reversed: true,

        neckHeight: 0,
        neckWidth: 0,
        dataLabels: {
            verticalAlign: 'top'
        }
    }
);

/**
 * A `pyramid3d` series. If the [type](#series.pyramid3d.type) option is
 * not specified, it is inherited from [chart.type](#chart.type).
 *
 * @since     7.1.0
 * @extends   series,plotOptions.pyramid3d
 * @excluding allAreas,boostThreshold,colorAxis,compare,compareBase
 * @product   highcharts
 * @sample    {highcharts} highcharts/demo/pyramid3d/ Pyramid3d
 * @apioption series.pyramid3d
 */

/**
 * An array of data points for the series. For the `pyramid3d` series
 * type, points can be given in the following ways:
 *
 * 1.  An array of numerical values. In this case, the numerical values
 * will be interpreted as `y` options. The `x` values will be automatically
 * calculated, either starting at 0 and incremented by 1, or from `pointStart`
 * and `pointInterval` given in the series options. If the axis has
 * categories, these will be used. Example:
 *
 *  ```js
 *  data: [0, 5, 3, 5]
 *  ```
 *
 * 2.  An array of objects with named values. The following snippet shows only a
 * few settings, see the complete options set below. If the total number of data
 * points exceeds the series'
 * [turboThreshold](#series.pyramid3d.turboThreshold),
 * this option is not available.
 *
 *  ```js
 *     data: [{
 *         y: 2,
 *         name: "Point2",
 *         color: "#00FF00"
 *     }, {
 *         y: 4,
 *         name: "Point1",
 *         color: "#FF00FF"
 *     }]
 *  ```
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
 * @type      {Array<number|Array<number>|*>}
 * @extends   series.funnel3d.data
 * @product   highcharts
 * @apioption series.pyramid3d.data
 */

''; // adds doclets above to the transpiled file
