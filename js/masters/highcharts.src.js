/**
 * @license Highcharts JS v@product.version@ (@product.date@)
 * @module highcharts/highcharts
 *
 * (c) 2009-2018 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../parts/Globals.js';
import U from '../parts/Utilities.js';
var extend = U.extend;

import '../parts/SvgRenderer.js';
import '../parts/Html.js';
import '../parts/Axis.js';
import '../parts/DateTimeAxis.js';
import '../parts/LogarithmicAxis.js';
import '../parts/PlotLineOrBand.js';
import '../parts/Tooltip.js';
import '../parts/Pointer.js';
import '../parts/TouchPointer.js';
import '../parts/MSPointer.js';
import '../parts/Legend.js';
import '../parts/Chart.js';
import '../parts/ScrollablePlotArea.js';
import '../parts/Stacking.js';
import '../parts/Dynamics.js';
import '../parts/AreaSeries.js';
import '../parts/SplineSeries.js';
import '../parts/AreaSplineSeries.js';
import '../parts/ColumnSeries.js';
import '../parts/BarSeries.js';
import '../parts/ScatterSeries.js';
import '../parts/PieSeries.js';
import '../parts/DataLabels.js';
import '../modules/overlapping-datalabels.src.js';
import '../parts/Interaction.js';
import '../parts/Responsive.js';

extend(Highcharts, {
    arrayMax: U.arrayMax,
    arrayMin: U.arrayMin,
    attr: U.attr,
    defined: U.defined,
    erase: U.erase,
    extend: U.extend,
    isArray: U.isArray,
    isClass: U.isClass,
    isDOMElement: U.isDOMElement,
    isNumber: U.isNumber,
    isObject: U.isObject,
    isString: U.isString,
    objectEach: U.objectEach,
    pick: U.pick,
    pInt: U.pInt,
    setAnimation: U.setAnimation,
    splat: U.splat,
    syncTimeout: U.syncTimeout
});

export default Highcharts;
