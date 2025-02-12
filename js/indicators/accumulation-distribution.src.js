/* *
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 * */
'use strict';
import H from '../parts/Globals.js';
import '../parts/Utilities.js';
var seriesType = H.seriesType;
/* eslint-disable valid-jsdoc */
// Utils:
/**
 * @private
 */
function populateAverage(xVal, yVal, yValVolume, i) {
    var high = yVal[i][1], low = yVal[i][2], close = yVal[i][3], volume = yValVolume[i], adY = close === high && close === low || high === low ?
        0 :
        ((2 * close - low - high) / (high - low)) * volume, adX = xVal[i];
    return [adX, adY];
}
/* eslint-enable valid-jsdoc */
/**
 * The AD series type.
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.ad
 *
 * @augments Highcharts.Series
 */
seriesType('ad', 'sma', 
/**
 * Accumulation Distribution (AD). This series requires `linkedTo` option to
 * be set.
 *
 * @sample stock/indicators/accumulation-distribution
 *         Accumulation/Distribution indicator
 *
 * @extends      plotOptions.sma
 * @since        6.0.0
 * @product      highstock
 * @optionparent plotOptions.ad
 */
{
    params: {
        /**
         * The id of volume series which is mandatory.
         * For example using OHLC data, volumeSeriesID='volume' means
         * the indicator will be calculated using OHLC and volume values.
         *
         * @since 6.0.0
         */
        volumeSeriesID: 'volume'
    }
}, 
/**
 * @lends Highcharts.Series#
 */
{
    nameComponents: false,
    nameBase: 'Accumulation/Distribution',
    getValues: function (series, params) {
        var period = params.period, xVal = series.xData, yVal = series.yData, volumeSeriesID = params.volumeSeriesID, volumeSeries = series.chart.get(volumeSeriesID), yValVolume = volumeSeries && volumeSeries.yData, yValLen = yVal ? yVal.length : 0, AD = [], xData = [], yData = [], len, i, ADPoint;
        if (xVal.length <= period &&
            yValLen &&
            yVal[0].length !== 4) {
            return false;
        }
        if (!volumeSeries) {
            return H.error('Series ' +
                volumeSeriesID +
                ' not found! Check `volumeSeriesID`.', true, series.chart);
        }
        // i = period <-- skip first N-points
        // Calculate value one-by-one for each period in visible data
        for (i = period; i < yValLen; i++) {
            len = AD.length;
            ADPoint = populateAverage(xVal, yVal, yValVolume, i, period);
            if (len > 0) {
                ADPoint[1] += AD[len - 1][1];
            }
            AD.push(ADPoint);
            xData.push(ADPoint[0]);
            yData.push(ADPoint[1]);
        }
        return {
            values: AD,
            xData: xData,
            yData: yData
        };
    }
});
/**
 * A `AD` series. If the [type](#series.ad.type) option is not
 * specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.ad
 * @since     6.0.0
 * @excluding dataParser, dataURL
 * @product   highstock
 * @apioption series.ad
 */
''; // add doclet above to transpiled file
