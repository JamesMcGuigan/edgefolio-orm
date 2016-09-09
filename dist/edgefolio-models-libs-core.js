//***** built: Fri, 09 Sep 2016 03:22:27 +0100 *****//
//***** libs/bower_components/array-generics/array.generics.js *****//
/**
 * Implementation of standard Array methods (introduced in ECMAScript 5th
 * edition) and shorthand generics (JavaScript 1.8.5)
 *
 * Copyright (c) 2013 Alex K @plusdude
 * http://opensource.org/licenses/MIT
 */
(function (global, infinity, undefined) {
    /*jshint bitwise:false, maxlen:95, plusplus:false, validthis:true*/
    "use strict";

    /**
     * Local references to constructors at global scope.
     * This may speed up access and slightly reduce file size of minified version.
     */
    var Array = global.Array;
    var Object = global.Object;
    var Math = global.Math;
    var Number = global.Number;

    /**
     * Converts argument to an integral numeric value.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-9.4
     */
    function toInteger(value) {
        var number;

        // let number be the result of calling ToNumber on the input argument
        number = Number(value);
        return (
            // if number is NaN, return 0
            number !== number ? 0 :

            // if number is 0, Infinity, or -Infinity, return number
            0 === number || infinity === number || -infinity === number ? number :

            // return the result of computing sign(number) * floor(abs(number))
            (0 < number || -1) * Math.floor(Math.abs(number))
        );
    }

    /**
     * Returns a shallow copy of a portion of an array.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.10
     */
    function slice(begin, end) {
        /*jshint newcap:false*/
        var result, elements, length, index, count;

        // convert elements to object
        elements = Object(this);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // calculate begin index, if is set
        if (undefined !== begin) {

            // convert to integer
            begin = toInteger(begin);

            // handle -begin, begin > length
            index = 0 > begin ? Math.max(length + begin, 0) : Math.min(begin, length);
        } else {
            // default value
            index = 0;
        }
        // calculate end index, if is set
        if (undefined !== end) {

            // convert to integer
            end = toInteger(end);

            // handle -end, end > length
            length = 0 > end ? Math.max(length + end, 0) : Math.min(end, length);
        }
        // create result array
        result = new Array(length - index);

        // iterate over elements
        for (count = 0; index < length; ++index, ++count) {

            // current index exists
            if (index in elements) {

                // copy current element to result array
                result[count] = elements[index];
            }
        }
        return result;
    }

    /**
     * Returns the first index at which a given element
     * can be found in the array.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.14
     */
    function indexOf(target, begin) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // calculate begin index, if is set
        if (undefined !== begin) {

            // convert to integer
            begin = toInteger(begin);

            // handle -begin, begin > length
            index = 0 > begin ? Math.max(length + begin, 0) : Math.min(begin, length);
        } else {
            // default value
            index = 0;
        }
        // iterate over elements
        for (; index < length; ++index) {

            // current index exists, target element is equal to current element
            if (index in elements && target === elements[index]) {

                // break loop, target element found
                return index;
            }
        }
        // target element not found
        return -1;
    }

    /**
     * Returns the last index at which a given element
     * can be found in the array.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.15
     */
    function lastIndexOf(target, begin) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // calculate begin index, if is set
        if (undefined !== begin) {

            // convert to integer
            begin = toInteger(begin);

            // handle -begin, begin > length - 1
            index = 0 > begin ? length - Math.abs(begin) : Math.min(begin, length - 1);
        } else {
            // default value
            index = length - 1;
        }
        // iterate over elements backwards
        for (; -1 < index; --index) {

            // current index exists, target element is equal to current element
            if (index in elements && target === elements[index]) {

                // break loop, target element found
                return index;
            }
        }
        // target element not found
        return -1;
    }

    /**
     * Executes a provided function once per array element.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18
     */
    function forEach(callback, scope) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements) {

                // execute callback
                callback.call(scope, elements[index], index, elements);
            }
        }
    }

    /**
     * Tests whether all elements in the array pass the test
     * implemented by the provided function.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.16
     */
    function every(callback, scope) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements &&

            // callback returns false
            !callback.call(scope, elements[index], index, elements)) {

                // break loop, test failed
                return false;
            }
        }
        // test passed, controversy began..
        return true;
    }

    /**
     * Tests whether some element in the array passes the test
     * implemented by the provided function.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.17
     */
    function some(callback, scope) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements &&

            // callback returns true
            callback.call(scope, elements[index], index, elements)) {

                // break loop, test passed
                return true;
            }
        }
        // test failed
        return false;
    }

    /**
     * Creates a new array with all elements that pass the test
     * implemented by the provided function.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.20
     */
    function filter(callback, scope) {
        /*jshint newcap:false*/
        var result = [], elements, length, index, count;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = count = 0; index < length; ++index) {

            // current index exists
            if (index in elements &&

            // callback returns true
            callback.call(scope, elements[index], index, elements)) {

                // copy current element to result array
                result[count++] = elements[index];
            }
        }
        return result;
    }

    /**
     * Creates a new array with the results of calling a provided function
     * on every element in this array.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.19
     */
    function map(callback, scope) {
        /*jshint newcap:false*/
        var result = [], elements, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements) {

                // copy a return value of callback to result array
                result[index] = callback.call(scope, elements[index], index, elements);
            }
        }
        return result;
    }

    /**
     * Apply a function against values of the array (from left-to-right)
     * as to reduce it to a single value.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.21
     */
    function reduce(callback, value) {
        /*jshint newcap:false*/
        var elements, isset, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // status of the initial value
        isset = undefined !== value;

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements) {

                // initial value is set
                if (isset) {

                    // replace initial value with a return value of callback
                    value = callback(value, elements[index], index, elements);
                } else {
                    // current element becomes initial value
                    value = elements[index];

                    // status of the initial value
                    isset = true;
                }
            }
        }
        // make sure the initial value exists after iteration
        requireValue(isset);
        return value;
    }

    /**
     * Apply a function against values of the array (from right-to-left)
     * as to reduce it to a single value.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.22
     */
    function reduceRight(callback, value) {
        /*jshint newcap:false*/
        var elements, isset, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // status of the initial value
        isset = undefined !== value;

        // index of the last element
        index = (elements.length >>> 0) - 1;

        // iterate over elements backwards
        for (; -1 < index; --index) {

            // current index exists
            if (index in elements) {

                // initial value is set
                if (isset) {

                    // replace initial value with a return value of callback
                    value = callback(value, elements[index], index, elements);
                } else {
                    // current element becomes initial value
                    value = elements[index];

                    // status of the initial value
                    isset = true;
                }
            }
        }
        // make sure the initial value exists after iteration
        requireValue(isset);
        return value;
    }

    /**
     * Returns true if an argument is an array, false if it is not.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.3.2
     */
    function isArray(value) {
        return "[object Array]" === Object.prototype.toString.call(value);
    }

    /**
     * Tests if an argument is callable and throws an error if it is not.
     * @private
     */
    function requireFunction(value) {
        if ("[object Function]" !== Object.prototype.toString.call(value)) {
            throw new Error(value + " is not a function");
        }
    }

    /**
     * Throws an error if an argument can be converted to true.
     * @private
     */
    function requireValue(isset) {
        if (!isset) {
            throw new Error("reduce of empty array with no initial value");
        }
    }

    /**
     * Tests implementation of standard Array method.
     * @private
     */
    function supportsStandard(key) {
        var support = true;

        // a method exists
        if (Array.prototype[key]) {
            try {
                // apply dummy arguments
                Array.prototype[key].call(undefined, /test/, null);

                // passed? implemented wrong
                support = false;
            } catch (e) {
                // do nothing
            }
        } else {
            support = false;
        }
        return support;
    }

    /**
     * Tests implementation of generic Array method.
     * @private
     */
    function supportsGeneric(key) {
        var support = true;

        // a method exists
        if (Array[key]) {
            try {
                // apply dummy arguments
                Array[key](undefined, /test/, null);

                // passed? implemented wrong
                support = false;
            } catch (e) {
                // do nothing
            }
        } else {
            support = false;
        }
        return support;
    }

    /**
     * Assigns method to Array constructor.
     * @private
     */
    function extendArray(key) {
        if (!supportsGeneric(key)) {
            Array[key] = createGeneric(key);
        }
    }

    /**
     * Creates generic method from an instance method.
     * @private
     */
    function createGeneric(key) {
        /** @public */
        return function (elements) {
            var list;

            if (undefined === elements || null === elements) {
                throw new Error("Array.prototype." + key + " called on " + elements);
            }
            list = Array.prototype.slice.call(arguments, 1);
            return Array.prototype[key].apply(elements, list);
        };
    }

    /**
     * Assign ECMAScript-5 methods to Array constructor,
     * and Array prototype.
     */
    var ES5 = {
        "indexOf": indexOf,
        "lastIndexOf": lastIndexOf,
        "forEach": forEach,
        "every": every,
        "some": some,
        "filter": filter,
        "map": map,
        "reduce": reduce,
        "reduceRight": reduceRight
    };
    for (var key in ES5) {
        if (ES5.hasOwnProperty(key)) {

            if (!supportsStandard(key)) {
                Array.prototype[key] = ES5[key];
            }
            extendArray(key);
        }
    }
    Array.isArray = Array.isArray || isArray;

    /**
     * Assign ECMAScript-3 methods to Array constructor.
     * The toString method is omitted.
     */
    [
        "concat",
        "join",
        "slice",
        "pop",
        "push",
        "reverse",
        "shift",
        "sort",
        "splice",
        "unshift"

    ].forEach(extendArray);

    /**
     * Test the slice method on DOM NodeList.
     * Support: IE < 9
     */
    /*jshint browser:true*/
    if (document) {
        try {
            Array.slice(document.childNodes);
        } catch (e) {
            Array.prototype.slice = slice;
        }
    }

}(this, 1 / 0));
;

//***** libs/browserify/compute-covariance.js *****//
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
* FUNCTION: isArray( value )
*	Validates if a value is an array.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is an array
*/
function isArray( value ) {
	return Object.prototype.toString.call( value ) === '[object Array]';
} // end FUNCTION isArray()

// EXPORTS //

module.exports = Array.isArray || isArray;

},{}],2:[function(require,module,exports){
'use strict';

// MODULES //

var isArray = require( 'validate.io-array' );


// ISOBJECT //

/**
* FUNCTION: isObject( value )
*	Validates if a value is a object; e.g., {}.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is a object
*/
function isObject( value ) {
	return ( typeof value === 'object' && value !== null && !isArray( value ) );
} // end FUNCTION isObject()


// EXPORTS //

module.exports = isObject;

},{"validate.io-array":1}],"compute-covariance":[function(require,module,exports){
/**
*
*	COMPUTE: covariance
*
*
*	DESCRIPTION:
*		- Computes the covariance between one or more numeric arrays.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

// MODULES //

var isObject = require( 'validate.io-object' );


// COVARIANCE //

/**
* FUNCTION: covariance( arr1[, arr2,...,opts] )
*	Computes the covariance between one or more numeric arrays.
*
* @param {...Array} arr - numeric array
* @param {Object} [opts] - function options
* @param {Boolean} [opts.bias] - boolean indicating whether to calculate a biased or unbiased estimate of the covariance (default: false)
* @returns {Array} covariance matrix
*/
function covariance() {
	var bias = false,
		args,
		opts,
		nArgs,
		len,
		deltas,
		delta,
		means,
		C,
		cov,
		arr,
		N, r, A, B, sum, val,
		i, j, n;

	args = Array.prototype.slice.call( arguments );
	nArgs = args.length;

	if ( isObject( args[nArgs-1] ) ) {
		opts = args.pop();
		nArgs = nArgs - 1;
		if ( opts.hasOwnProperty( 'bias' ) ) {
			if ( typeof opts.bias !== 'boolean' ) {
				throw new TypeError( 'covariance()::invalid input argument. Bias option must be a boolean.' );
			}
			bias = opts.bias;
		}
	}
	if ( !nArgs ) {
		throw new Error( 'covariance()::insufficient input arguments. Must provide array arguments.' );
	}
	for ( i = 0; i < nArgs; i++ ) {
		if ( !Array.isArray( args[i] ) ) {
			throw new TypeError( 'covariance()::invalid input argument. Must provide array arguments.' );
		}
	}
	if ( Array.isArray( args[0][0] ) ) {
		// If the first argument is an array of arrays, calculate the covariance over the nested arrays, disregarding any other arguments...
		args = args[ 0 ];
	}
	nArgs = args.length;
	len = args[ 0 ].length;
	for ( i = 1; i < nArgs; i++ ) {
		if ( args[i].length !== len ) {
			throw new Error( 'covariance()::invalid input argument. All arrays must have equal length.' );
		}
	}
	// [0] Initialization...
	deltas = new Array( nArgs );
	means = new Array( nArgs );
	C = new Array( nArgs );
	cov = new Array( nArgs );
	for ( i = 0; i < nArgs; i++ ) {
		means[ i ] = args[ i ][ 0 ];
		arr = new Array( nArgs );
		for ( j = 0; j < nArgs; j++ ) {
			arr[ j ] = 0;
		}
		C[ i ] = arr;
		cov[ i ] = arr.slice(); // copy!
	}
	if ( len < 2 ) {
		return cov;
	}
	// [1] Compute the covariance...
	for ( n = 1; n < len; n++ ) {

		N = n + 1;
		r = n / N;

		// [a] Extract the values and compute the deltas...
		for ( i = 0; i < nArgs; i++ ) {
			deltas[ i ] = args[ i ][ n ] - means[ i ];
		}

		// [b] Update the covariance between one array and every other array...
		for ( i = 0; i < nArgs; i++ ) {
			arr = C[ i ];
			delta = deltas[ i ];
			for ( j = i; j < nArgs; j++ ) {
				A = arr[ j ];
				B = r * delta * deltas[ j ];
				sum = A + B;
				// Exploit the fact that the covariance matrix is symmetric...
				if ( i !== j ) {
					C[ j ][ i ] = sum;
				}
				arr[ j ] = sum;
			} // end FOR j
		} // end FOR i

		// [c] Update the means...
		for ( i = 0; i < nArgs; i++ ) {
			means[ i ] += deltas[ i ] / N;
		}
	} // end FOR n

	// [2] Normalize the co-moments...
	n = N - 1;
	if ( bias ) {
		n = N;
	}
	for ( i = 0; i < nArgs; i++ ) {
		arr = C[ i ];
		for ( j = i; j < nArgs; j++ ) {
			val = arr[ j ] / n;
			cov[ i ][ j ] = val;
			if ( i !== j ) {
				cov[ j ][ i ] = val;
			}
		}
	}
	return cov;
} // end FUNCTION covariance()


// EXPORTS //

module.exports = covariance;

},{"validate.io-object":2}]},{},[]);
;

//***** libs/browserify/compute-kurtosis.js *****//
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"compute-kurtosis":[function(require,module,exports){
/**
*
*	COMPUTE: kurtosis
*
*
*	DESCRIPTION:
*		- Computes the sample excess kurtosis of an array of values.
*
*
*	NOTES:
*		[1] 
*
*
*	TODO:
*		[1] 
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

(function() {
	'use strict';

	/**
	* FUNCTION: kurtosis( arr )
	*	Computes the sample excess kurtosis of an array of values.
	*
	* @param {Array} arr - array of values
	* @returns {Number} sample excess kurtosis
	*/
	function kurtosis( arr ) {
		if ( !Array.isArray( arr ) ) {
			throw new TypeError( 'kurtosis()::invalid input argument. Must provide an array.' );
		}
		var len = arr.length,
			delta = 0,
			delta_n = 0,
			delta_n2 = 0,
			term1 = 0,
			N = 0,
			mean = 0,
			M2 = 0,
			M3 = 0,
			M4 = 0,
			g;

		for ( var i = 0; i < len; i++ ) {
			N += 1;

			delta = arr[ i ] - mean;
			delta_n = delta / N;
			delta_n2 = delta_n * delta_n;

			term1 = delta * delta_n * (N-1);

			M4 += term1*delta_n2*(N*N - 3*N + 3) + 6*delta_n2*M2 - 4*delta_n*M3;
			M3 += term1*delta_n*(N-2) - 3*delta_n*M2;
			M2 += term1;
			mean += delta_n;
		}
		// Calculate the population excess kurtosis:
		g = N*M4 / ( M2*M2 ) - 3;
		// Return the corrected sample excess kurtosis:
		return (N-1) / ( (N-2)*(N-3) ) * ( (N+1)*g + 6 );
	} // end FUNCTION kurtosis()


	// EXPORTS //

	module.exports = kurtosis;

})();
},{}]},{},[]);
;

//***** libs/vendor/simple-statistics/simple-statistics.js *****//
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ss = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* @flow */
'use strict';

// # simple-statistics
//
// A simple, literate statistics system.

var ss = module.exports = {};

// Linear Regression
ss.linearRegression = require(19);
ss.linearRegressionLine = require(20);
ss.standardDeviation = require(51);
ss.rSquared = require(40);
ss.mode = require(30);
ss.modeSorted = require(31);
ss.min = require(27);
ss.max = require(21);
ss.minSorted = require(28);
ss.maxSorted = require(22);
ss.sum = require(53);
ss.sumSimple = require(55);
ss.product = require(36);
ss.quantile = require(37);
ss.quantileSorted = require(38);
ss.iqr = ss.interquartileRange = require(17);
ss.medianAbsoluteDeviation = ss.mad = require(25);
ss.chunk = require(8);
ss.shuffle = require(48);
ss.shuffleInPlace = require(49);
ss.sample = require(42);
ss.ckmeans = require(9);
ss.uniqueCountSorted = require(58);
ss.sumNthPowerDeviations = require(54);
ss.equalIntervalBreaks = require(12);

// sample statistics
ss.sampleCovariance = require(44);
ss.sampleCorrelation = require(43);
ss.sampleVariance = require(47);
ss.sampleStandardDeviation = require(46);
ss.sampleSkewness = require(45);

// measures of centrality
ss.geometricMean = require(15);
ss.harmonicMean = require(16);
ss.mean = ss.average = require(23);
ss.median = require(24);
ss.medianSorted = require(26);

ss.rootMeanSquare = ss.rms = require(41);
ss.variance = require(59);
ss.tTest = require(56);
ss.tTestTwoSample = require(57);
// ss.jenks = require('./src/jenks');

// Classifiers
ss.bayesian = require(2);
ss.perceptron = require(33);

// Distribution-related methods
ss.epsilon = require(11); // We make ε available to the test suite.
ss.factorial = require(14);
ss.bernoulliDistribution = require(3);
ss.binomialDistribution = require(4);
ss.poissonDistribution = require(34);
ss.chiSquaredGoodnessOfFit = require(7);

// Normal distribution
ss.zScore = require(60);
ss.cumulativeStdNormalProbability = require(10);
ss.standardNormalTable = require(52);
ss.errorFunction = ss.erf = require(13);
ss.inverseErrorFunction = require(18);
ss.probit = require(35);
ss.mixin = require(29);

// Root-finding methods
ss.bisect = require(5);

},{"10":10,"11":11,"12":12,"13":13,"14":14,"15":15,"16":16,"17":17,"18":18,"19":19,"2":2,"20":20,"21":21,"22":22,"23":23,"24":24,"25":25,"26":26,"27":27,"28":28,"29":29,"3":3,"30":30,"31":31,"33":33,"34":34,"35":35,"36":36,"37":37,"38":38,"4":4,"40":40,"41":41,"42":42,"43":43,"44":44,"45":45,"46":46,"47":47,"48":48,"49":49,"5":5,"51":51,"52":52,"53":53,"54":54,"55":55,"56":56,"57":57,"58":58,"59":59,"60":60,"7":7,"8":8,"9":9}],2:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * [Bayesian Classifier](http://en.wikipedia.org/wiki/Naive_Bayes_classifier)
 *
 * This is a naïve bayesian classifier that takes
 * singly-nested objects.
 *
 * @class
 * @example
 * var bayes = new BayesianClassifier();
 * bayes.train({
 *   species: 'Cat'
 * }, 'animal');
 * var result = bayes.score({
 *   species: 'Cat'
 * })
 * // result
 * // {
 * //   animal: 1
 * // }
 */
function BayesianClassifier() {
    // The number of items that are currently
    // classified in the model
    this.totalCount = 0;
    // Every item classified in the model
    this.data = {};
}

/**
 * Train the classifier with a new item, which has a single
 * dimension of Javascript literal keys and values.
 *
 * @param {Object} item an object with singly-deep properties
 * @param {string} category the category this item belongs to
 * @return {undefined} adds the item to the classifier
 */
BayesianClassifier.prototype.train = function(item, category) {
    // If the data object doesn't have any values
    // for this category, create a new object for it.
    if (!this.data[category]) {
        this.data[category] = {};
    }

    // Iterate through each key in the item.
    for (var k in item) {
        var v = item[k];
        // Initialize the nested object `data[category][k][item[k]]`
        // with an object of keys that equal 0.
        if (this.data[category][k] === undefined) {
            this.data[category][k] = {};
        }
        if (this.data[category][k][v] === undefined) {
            this.data[category][k][v] = 0;
        }

        // And increment the key for this key/value combination.
        this.data[category][k][item[k]]++;
    }

    // Increment the number of items classified
    this.totalCount++;
};

/**
 * Generate a score of how well this item matches all
 * possible categories based on its attributes
 *
 * @param {Object} item an item in the same format as with train
 * @returns {Object} of probabilities that this item belongs to a
 * given category.
 */
BayesianClassifier.prototype.score = function(item) {
    // Initialize an empty array of odds per category.
    var odds = {}, category;
    // Iterate through each key in the item,
    // then iterate through each category that has been used
    // in previous calls to `.train()`
    for (var k in item) {
        var v = item[k];
        for (category in this.data) {
            // Create an empty object for storing key - value combinations
            // for this category.
            if (odds[category] === undefined) { odds[category] = {}; }

            // If this item doesn't even have a property, it counts for nothing,
            // but if it does have the property that we're looking for from
            // the item to categorize, it counts based on how popular it is
            // versus the whole population.
            if (this.data[category][k]) {
                odds[category][k + '_' + v] = (this.data[category][k][v] || 0) / this.totalCount;
            } else {
                odds[category][k + '_' + v] = 0;
            }
        }
    }

    // Set up a new object that will contain sums of these odds by category
    var oddsSums = {};

    for (category in odds) {
        // Tally all of the odds for each category-combination pair -
        // the non-existence of a category does not add anything to the
        // score.
        for (var combination in odds[category]) {
            if (oddsSums[category] === undefined) {
                oddsSums[category] = 0;
            }
            oddsSums[category] += odds[category][combination];
        }
    }

    return oddsSums;
};

module.exports = BayesianClassifier;

},{}],3:[function(require,module,exports){
'use strict';
/* @flow */

var binomialDistribution = require(4);

/**
 * The [Bernoulli distribution](http://en.wikipedia.org/wiki/Bernoulli_distribution)
 * is the probability discrete
 * distribution of a random variable which takes value 1 with success
 * probability `p` and value 0 with failure
 * probability `q` = 1 - `p`. It can be used, for example, to represent the
 * toss of a coin, where "1" is defined to mean "heads" and "0" is defined
 * to mean "tails" (or vice versa). It is
 * a special case of a Binomial Distribution
 * where `n` = 1.
 *
 * @param {number} p input value, between 0 and 1 inclusive
 * @returns {number} value of bernoulli distribution at this point
 * @example
 * bernoulliDistribution(0.5); // => { '0': 0.5, '1': 0.5 }
 */
function bernoulliDistribution(p/*: number */) {
    // Check that `p` is a valid probability (0 ≤ p ≤ 1)
    if (p < 0 || p > 1 ) { return NaN; }

    return binomialDistribution(1, p);
}

module.exports = bernoulliDistribution;

},{"4":4}],4:[function(require,module,exports){
'use strict';
/* @flow */

var epsilon = require(11);
var factorial = require(14);

/**
 * The [Binomial Distribution](http://en.wikipedia.org/wiki/Binomial_distribution) is the discrete probability
 * distribution of the number of successes in a sequence of n independent yes/no experiments, each of which yields
 * success with probability `probability`. Such a success/failure experiment is also called a Bernoulli experiment or
 * Bernoulli trial; when trials = 1, the Binomial Distribution is a Bernoulli Distribution.
 *
 * @param {number} trials number of trials to simulate
 * @param {number} probability
 * @returns {Object} output
 */
function binomialDistribution(
    trials/*: number */,
    probability/*: number */)/*: ?Object */ {
    // Check that `p` is a valid probability (0 ≤ p ≤ 1),
    // that `n` is an integer, strictly positive.
    if (probability < 0 || probability > 1 ||
        trials <= 0 || trials % 1 !== 0) {
        return undefined;
    }

    // We initialize `x`, the random variable, and `accumulator`, an accumulator
    // for the cumulative distribution function to 0. `distribution_functions`
    // is the object we'll return with the `probability_of_x` and the
    // `cumulativeProbability_of_x`, as well as the calculated mean &
    // variance. We iterate until the `cumulativeProbability_of_x` is
    // within `epsilon` of 1.0.
    var x = 0,
        cumulativeProbability = 0,
        cells = {};

    // This algorithm iterates through each potential outcome,
    // until the `cumulativeProbability` is very close to 1, at
    // which point we've defined the vast majority of outcomes
    do {
        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        cells[x] = factorial(trials) /
            (factorial(x) * factorial(trials - x)) *
            (Math.pow(probability, x) * Math.pow(1 - probability, trials - x));
        cumulativeProbability += cells[x];
        x++;
    // when the cumulativeProbability is nearly 1, we've calculated
    // the useful range of this distribution
    } while (cumulativeProbability < 1 - epsilon);

    return cells;
}

module.exports = binomialDistribution;

},{"11":11,"14":14}],5:[function(require,module,exports){
'use strict';
/* @flow */

var sign = require(50);
/**
 * [Bisection method](https://en.wikipedia.org/wiki/Bisection_method) is a root-finding 
 * method that repeatedly bisects an interval to find the root.
 * 
 * This function returns a numerical approximation to the exact value.
 * 
 * @param {Function} func input function
 * @param {Number} start - start of interval
 * @param {Number} end - end of interval
 * @param {Number} maxIterations - the maximum number of iterations
 * @param {Number} errorTolerance - the error tolerance
 * @returns {Number} estimated root value
 * @throws {TypeError} Argument func must be a function
 * 
 * @example
 * bisect(Math.cos,0,4,100,0.003); // => 1.572265625
 */
function bisect(
    func/*: (x: any) => number */,
    start/*: number */,
    end/*: number */,
    maxIterations/*: number */,
    errorTolerance/*: number */)/*:number*/ {

    if (typeof func !== 'function') throw new TypeError('func must be a function');
    
    for (var i = 0; i < maxIterations; i++) {
        var output = (start + end) / 2;

        if (func(output) === 0 || Math.abs((end - start) / 2) < errorTolerance) {
            return output;
        }

        if (sign(func(output)) === sign(func(start))) {
            start = output;
        } else {
            end = output;
        }
    }
    
    throw new Error('maximum number of iterations exceeded');
}

module.exports = bisect;

},{"50":50}],6:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * **Percentage Points of the χ2 (Chi-Squared) Distribution**
 *
 * The [χ2 (Chi-Squared) Distribution](http://en.wikipedia.org/wiki/Chi-squared_distribution) is used in the common
 * chi-squared tests for goodness of fit of an observed distribution to a theoretical one, the independence of two
 * criteria of classification of qualitative data, and in confidence interval estimation for a population standard
 * deviation of a normal distribution from a sample standard deviation.
 *
 * Values from Appendix 1, Table III of William W. Hines & Douglas C. Montgomery, "Probability and Statistics in
 * Engineering and Management Science", Wiley (1980).
 */
var chiSquaredDistributionTable = { '1':
   { '0.995': 0,
     '0.99': 0,
     '0.975': 0,
     '0.95': 0,
     '0.9': 0.02,
     '0.5': 0.45,
     '0.1': 2.71,
     '0.05': 3.84,
     '0.025': 5.02,
     '0.01': 6.63,
     '0.005': 7.88 },
  '2':
   { '0.995': 0.01,
     '0.99': 0.02,
     '0.975': 0.05,
     '0.95': 0.1,
     '0.9': 0.21,
     '0.5': 1.39,
     '0.1': 4.61,
     '0.05': 5.99,
     '0.025': 7.38,
     '0.01': 9.21,
     '0.005': 10.6 },
  '3':
   { '0.995': 0.07,
     '0.99': 0.11,
     '0.975': 0.22,
     '0.95': 0.35,
     '0.9': 0.58,
     '0.5': 2.37,
     '0.1': 6.25,
     '0.05': 7.81,
     '0.025': 9.35,
     '0.01': 11.34,
     '0.005': 12.84 },
  '4':
   { '0.995': 0.21,
     '0.99': 0.3,
     '0.975': 0.48,
     '0.95': 0.71,
     '0.9': 1.06,
     '0.5': 3.36,
     '0.1': 7.78,
     '0.05': 9.49,
     '0.025': 11.14,
     '0.01': 13.28,
     '0.005': 14.86 },
  '5':
   { '0.995': 0.41,
     '0.99': 0.55,
     '0.975': 0.83,
     '0.95': 1.15,
     '0.9': 1.61,
     '0.5': 4.35,
     '0.1': 9.24,
     '0.05': 11.07,
     '0.025': 12.83,
     '0.01': 15.09,
     '0.005': 16.75 },
  '6':
   { '0.995': 0.68,
     '0.99': 0.87,
     '0.975': 1.24,
     '0.95': 1.64,
     '0.9': 2.2,
     '0.5': 5.35,
     '0.1': 10.65,
     '0.05': 12.59,
     '0.025': 14.45,
     '0.01': 16.81,
     '0.005': 18.55 },
  '7':
   { '0.995': 0.99,
     '0.99': 1.25,
     '0.975': 1.69,
     '0.95': 2.17,
     '0.9': 2.83,
     '0.5': 6.35,
     '0.1': 12.02,
     '0.05': 14.07,
     '0.025': 16.01,
     '0.01': 18.48,
     '0.005': 20.28 },
  '8':
   { '0.995': 1.34,
     '0.99': 1.65,
     '0.975': 2.18,
     '0.95': 2.73,
     '0.9': 3.49,
     '0.5': 7.34,
     '0.1': 13.36,
     '0.05': 15.51,
     '0.025': 17.53,
     '0.01': 20.09,
     '0.005': 21.96 },
  '9':
   { '0.995': 1.73,
     '0.99': 2.09,
     '0.975': 2.7,
     '0.95': 3.33,
     '0.9': 4.17,
     '0.5': 8.34,
     '0.1': 14.68,
     '0.05': 16.92,
     '0.025': 19.02,
     '0.01': 21.67,
     '0.005': 23.59 },
  '10':
   { '0.995': 2.16,
     '0.99': 2.56,
     '0.975': 3.25,
     '0.95': 3.94,
     '0.9': 4.87,
     '0.5': 9.34,
     '0.1': 15.99,
     '0.05': 18.31,
     '0.025': 20.48,
     '0.01': 23.21,
     '0.005': 25.19 },
  '11':
   { '0.995': 2.6,
     '0.99': 3.05,
     '0.975': 3.82,
     '0.95': 4.57,
     '0.9': 5.58,
     '0.5': 10.34,
     '0.1': 17.28,
     '0.05': 19.68,
     '0.025': 21.92,
     '0.01': 24.72,
     '0.005': 26.76 },
  '12':
   { '0.995': 3.07,
     '0.99': 3.57,
     '0.975': 4.4,
     '0.95': 5.23,
     '0.9': 6.3,
     '0.5': 11.34,
     '0.1': 18.55,
     '0.05': 21.03,
     '0.025': 23.34,
     '0.01': 26.22,
     '0.005': 28.3 },
  '13':
   { '0.995': 3.57,
     '0.99': 4.11,
     '0.975': 5.01,
     '0.95': 5.89,
     '0.9': 7.04,
     '0.5': 12.34,
     '0.1': 19.81,
     '0.05': 22.36,
     '0.025': 24.74,
     '0.01': 27.69,
     '0.005': 29.82 },
  '14':
   { '0.995': 4.07,
     '0.99': 4.66,
     '0.975': 5.63,
     '0.95': 6.57,
     '0.9': 7.79,
     '0.5': 13.34,
     '0.1': 21.06,
     '0.05': 23.68,
     '0.025': 26.12,
     '0.01': 29.14,
     '0.005': 31.32 },
  '15':
   { '0.995': 4.6,
     '0.99': 5.23,
     '0.975': 6.27,
     '0.95': 7.26,
     '0.9': 8.55,
     '0.5': 14.34,
     '0.1': 22.31,
     '0.05': 25,
     '0.025': 27.49,
     '0.01': 30.58,
     '0.005': 32.8 },
  '16':
   { '0.995': 5.14,
     '0.99': 5.81,
     '0.975': 6.91,
     '0.95': 7.96,
     '0.9': 9.31,
     '0.5': 15.34,
     '0.1': 23.54,
     '0.05': 26.3,
     '0.025': 28.85,
     '0.01': 32,
     '0.005': 34.27 },
  '17':
   { '0.995': 5.7,
     '0.99': 6.41,
     '0.975': 7.56,
     '0.95': 8.67,
     '0.9': 10.09,
     '0.5': 16.34,
     '0.1': 24.77,
     '0.05': 27.59,
     '0.025': 30.19,
     '0.01': 33.41,
     '0.005': 35.72 },
  '18':
   { '0.995': 6.26,
     '0.99': 7.01,
     '0.975': 8.23,
     '0.95': 9.39,
     '0.9': 10.87,
     '0.5': 17.34,
     '0.1': 25.99,
     '0.05': 28.87,
     '0.025': 31.53,
     '0.01': 34.81,
     '0.005': 37.16 },
  '19':
   { '0.995': 6.84,
     '0.99': 7.63,
     '0.975': 8.91,
     '0.95': 10.12,
     '0.9': 11.65,
     '0.5': 18.34,
     '0.1': 27.2,
     '0.05': 30.14,
     '0.025': 32.85,
     '0.01': 36.19,
     '0.005': 38.58 },
  '20':
   { '0.995': 7.43,
     '0.99': 8.26,
     '0.975': 9.59,
     '0.95': 10.85,
     '0.9': 12.44,
     '0.5': 19.34,
     '0.1': 28.41,
     '0.05': 31.41,
     '0.025': 34.17,
     '0.01': 37.57,
     '0.005': 40 },
  '21':
   { '0.995': 8.03,
     '0.99': 8.9,
     '0.975': 10.28,
     '0.95': 11.59,
     '0.9': 13.24,
     '0.5': 20.34,
     '0.1': 29.62,
     '0.05': 32.67,
     '0.025': 35.48,
     '0.01': 38.93,
     '0.005': 41.4 },
  '22':
   { '0.995': 8.64,
     '0.99': 9.54,
     '0.975': 10.98,
     '0.95': 12.34,
     '0.9': 14.04,
     '0.5': 21.34,
     '0.1': 30.81,
     '0.05': 33.92,
     '0.025': 36.78,
     '0.01': 40.29,
     '0.005': 42.8 },
  '23':
   { '0.995': 9.26,
     '0.99': 10.2,
     '0.975': 11.69,
     '0.95': 13.09,
     '0.9': 14.85,
     '0.5': 22.34,
     '0.1': 32.01,
     '0.05': 35.17,
     '0.025': 38.08,
     '0.01': 41.64,
     '0.005': 44.18 },
  '24':
   { '0.995': 9.89,
     '0.99': 10.86,
     '0.975': 12.4,
     '0.95': 13.85,
     '0.9': 15.66,
     '0.5': 23.34,
     '0.1': 33.2,
     '0.05': 36.42,
     '0.025': 39.36,
     '0.01': 42.98,
     '0.005': 45.56 },
  '25':
   { '0.995': 10.52,
     '0.99': 11.52,
     '0.975': 13.12,
     '0.95': 14.61,
     '0.9': 16.47,
     '0.5': 24.34,
     '0.1': 34.28,
     '0.05': 37.65,
     '0.025': 40.65,
     '0.01': 44.31,
     '0.005': 46.93 },
  '26':
   { '0.995': 11.16,
     '0.99': 12.2,
     '0.975': 13.84,
     '0.95': 15.38,
     '0.9': 17.29,
     '0.5': 25.34,
     '0.1': 35.56,
     '0.05': 38.89,
     '0.025': 41.92,
     '0.01': 45.64,
     '0.005': 48.29 },
  '27':
   { '0.995': 11.81,
     '0.99': 12.88,
     '0.975': 14.57,
     '0.95': 16.15,
     '0.9': 18.11,
     '0.5': 26.34,
     '0.1': 36.74,
     '0.05': 40.11,
     '0.025': 43.19,
     '0.01': 46.96,
     '0.005': 49.65 },
  '28':
   { '0.995': 12.46,
     '0.99': 13.57,
     '0.975': 15.31,
     '0.95': 16.93,
     '0.9': 18.94,
     '0.5': 27.34,
     '0.1': 37.92,
     '0.05': 41.34,
     '0.025': 44.46,
     '0.01': 48.28,
     '0.005': 50.99 },
  '29':
   { '0.995': 13.12,
     '0.99': 14.26,
     '0.975': 16.05,
     '0.95': 17.71,
     '0.9': 19.77,
     '0.5': 28.34,
     '0.1': 39.09,
     '0.05': 42.56,
     '0.025': 45.72,
     '0.01': 49.59,
     '0.005': 52.34 },
  '30':
   { '0.995': 13.79,
     '0.99': 14.95,
     '0.975': 16.79,
     '0.95': 18.49,
     '0.9': 20.6,
     '0.5': 29.34,
     '0.1': 40.26,
     '0.05': 43.77,
     '0.025': 46.98,
     '0.01': 50.89,
     '0.005': 53.67 },
  '40':
   { '0.995': 20.71,
     '0.99': 22.16,
     '0.975': 24.43,
     '0.95': 26.51,
     '0.9': 29.05,
     '0.5': 39.34,
     '0.1': 51.81,
     '0.05': 55.76,
     '0.025': 59.34,
     '0.01': 63.69,
     '0.005': 66.77 },
  '50':
   { '0.995': 27.99,
     '0.99': 29.71,
     '0.975': 32.36,
     '0.95': 34.76,
     '0.9': 37.69,
     '0.5': 49.33,
     '0.1': 63.17,
     '0.05': 67.5,
     '0.025': 71.42,
     '0.01': 76.15,
     '0.005': 79.49 },
  '60':
   { '0.995': 35.53,
     '0.99': 37.48,
     '0.975': 40.48,
     '0.95': 43.19,
     '0.9': 46.46,
     '0.5': 59.33,
     '0.1': 74.4,
     '0.05': 79.08,
     '0.025': 83.3,
     '0.01': 88.38,
     '0.005': 91.95 },
  '70':
   { '0.995': 43.28,
     '0.99': 45.44,
     '0.975': 48.76,
     '0.95': 51.74,
     '0.9': 55.33,
     '0.5': 69.33,
     '0.1': 85.53,
     '0.05': 90.53,
     '0.025': 95.02,
     '0.01': 100.42,
     '0.005': 104.22 },
  '80':
   { '0.995': 51.17,
     '0.99': 53.54,
     '0.975': 57.15,
     '0.95': 60.39,
     '0.9': 64.28,
     '0.5': 79.33,
     '0.1': 96.58,
     '0.05': 101.88,
     '0.025': 106.63,
     '0.01': 112.33,
     '0.005': 116.32 },
  '90':
   { '0.995': 59.2,
     '0.99': 61.75,
     '0.975': 65.65,
     '0.95': 69.13,
     '0.9': 73.29,
     '0.5': 89.33,
     '0.1': 107.57,
     '0.05': 113.14,
     '0.025': 118.14,
     '0.01': 124.12,
     '0.005': 128.3 },
  '100':
   { '0.995': 67.33,
     '0.99': 70.06,
     '0.975': 74.22,
     '0.95': 77.93,
     '0.9': 82.36,
     '0.5': 99.33,
     '0.1': 118.5,
     '0.05': 124.34,
     '0.025': 129.56,
     '0.01': 135.81,
     '0.005': 140.17 } };

module.exports = chiSquaredDistributionTable;

},{}],7:[function(require,module,exports){
'use strict';
/* @flow */

var mean = require(23);
var chiSquaredDistributionTable = require(6);

/**
 * The [χ2 (Chi-Squared) Goodness-of-Fit Test](http://en.wikipedia.org/wiki/Goodness_of_fit#Pearson.27s_chi-squared_test)
 * uses a measure of goodness of fit which is the sum of differences between observed and expected outcome frequencies
 * (that is, counts of observations), each squared and divided by the number of observations expected given the
 * hypothesized distribution. The resulting χ2 statistic, `chiSquared`, can be compared to the chi-squared distribution
 * to determine the goodness of fit. In order to determine the degrees of freedom of the chi-squared distribution, one
 * takes the total number of observed frequencies and subtracts the number of estimated parameters. The test statistic
 * follows, approximately, a chi-square distribution with (k − c) degrees of freedom where `k` is the number of non-empty
 * cells and `c` is the number of estimated parameters for the distribution.
 *
 * @param {Array<number>} data
 * @param {Function} distributionType a function that returns a point in a distribution:
 * for instance, binomial, bernoulli, or poisson
 * @param {number} significance
 * @returns {number} chi squared goodness of fit
 * @example
 * // Data from Poisson goodness-of-fit example 10-19 in William W. Hines & Douglas C. Montgomery,
 * // "Probability and Statistics in Engineering and Management Science", Wiley (1980).
 * var data1019 = [
 *     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 *     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 *     1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
 *     2, 2, 2, 2, 2, 2, 2, 2, 2,
 *     3, 3, 3, 3
 * ];
 * ss.chiSquaredGoodnessOfFit(data1019, ss.poissonDistribution, 0.05)); //= false
 */
function chiSquaredGoodnessOfFit(
    data/*: Array<number> */,
    distributionType/*: Function */,
    significance/*: number */)/*: boolean */ {
    // Estimate from the sample data, a weighted mean.
    var inputMean = mean(data),
        // Calculated value of the χ2 statistic.
        chiSquared = 0,
        // Degrees of freedom, calculated as (number of class intervals -
        // number of hypothesized distribution parameters estimated - 1)
        degreesOfFreedom,
        // Number of hypothesized distribution parameters estimated, expected to be supplied in the distribution test.
        // Lose one degree of freedom for estimating `lambda` from the sample data.
        c = 1,
        // The hypothesized distribution.
        // Generate the hypothesized distribution.
        hypothesizedDistribution = distributionType(inputMean),
        observedFrequencies = [],
        expectedFrequencies = [],
        k;

    // Create an array holding a histogram from the sample data, of
    // the form `{ value: numberOfOcurrences }`
    for (var i = 0; i < data.length; i++) {
        if (observedFrequencies[data[i]] === undefined) {
            observedFrequencies[data[i]] = 0;
        }
        observedFrequencies[data[i]]++;
    }

    // The histogram we created might be sparse - there might be gaps
    // between values. So we iterate through the histogram, making
    // sure that instead of undefined, gaps have 0 values.
    for (i = 0; i < observedFrequencies.length; i++) {
        if (observedFrequencies[i] === undefined) {
            observedFrequencies[i] = 0;
        }
    }

    // Create an array holding a histogram of expected data given the
    // sample size and hypothesized distribution.
    for (k in hypothesizedDistribution) {
        if (k in observedFrequencies) {
            expectedFrequencies[+k] = hypothesizedDistribution[k] * data.length;
        }
    }

    // Working backward through the expected frequencies, collapse classes
    // if less than three observations are expected for a class.
    // This transformation is applied to the observed frequencies as well.
    for (k = expectedFrequencies.length - 1; k >= 0; k--) {
        if (expectedFrequencies[k] < 3) {
            expectedFrequencies[k - 1] += expectedFrequencies[k];
            expectedFrequencies.pop();

            observedFrequencies[k - 1] += observedFrequencies[k];
            observedFrequencies.pop();
        }
    }

    // Iterate through the squared differences between observed & expected
    // frequencies, accumulating the `chiSquared` statistic.
    for (k = 0; k < observedFrequencies.length; k++) {
        chiSquared += Math.pow(
            observedFrequencies[k] - expectedFrequencies[k], 2) /
            expectedFrequencies[k];
    }

    // Calculate degrees of freedom for this test and look it up in the
    // `chiSquaredDistributionTable` in order to
    // accept or reject the goodness-of-fit of the hypothesized distribution.
    degreesOfFreedom = observedFrequencies.length - c - 1;
    return chiSquaredDistributionTable[degreesOfFreedom][significance] < chiSquared;
}

module.exports = chiSquaredGoodnessOfFit;

},{"23":23,"6":6}],8:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * Split an array into chunks of a specified size. This function
 * has the same behavior as [PHP's array_chunk](http://php.net/manual/en/function.array-chunk.php)
 * function, and thus will insert smaller-sized chunks at the end if
 * the input size is not divisible by the chunk size.
 *
 * `sample` is expected to be an array, and `chunkSize` a number.
 * The `sample` array can contain any kind of data.
 *
 * @param {Array} sample any array of values
 * @param {number} chunkSize size of each output array
 * @returns {Array<Array>} a chunked array
 * @example
 * chunk([1, 2, 3, 4], 2);
 * // => [[1, 2], [3, 4]]
 */
function chunk(sample/*:Array<any>*/, chunkSize/*:number*/)/*:?Array<Array<any>>*/ {

    // a list of result chunks, as arrays in an array
    var output = [];

    // `chunkSize` must be zero or higher - otherwise the loop below,
    // in which we call `start += chunkSize`, will loop infinitely.
    // So, we'll detect and throw in that case to indicate
    // invalid input.
    if (chunkSize <= 0) {
        throw new Error('chunk size must be a positive integer');
    }

    // `start` is the index at which `.slice` will start selecting
    // new array elements
    for (var start = 0; start < sample.length; start += chunkSize) {

        // for each chunk, slice that part of the array and add it
        // to the output. The `.slice` function does not change
        // the original array.
        output.push(sample.slice(start, start + chunkSize));
    }
    return output;
}

module.exports = chunk;

},{}],9:[function(require,module,exports){
'use strict';
/* @flow */

var uniqueCountSorted = require(58),
    numericSort = require(32);

/**
 * Create a new column x row matrix.
 *
 * @private
 * @param {number} columns
 * @param {number} rows
 * @return {Array<Array<number>>} matrix
 * @example
 * makeMatrix(10, 10);
 */
function makeMatrix(columns, rows) {
    var matrix = [];
    for (var i = 0; i < columns; i++) {
        var column = [];
        for (var j = 0; j < rows; j++) {
            column.push(0);
        }
        matrix.push(column);
    }
    return matrix;
}

/**
 * Ckmeans clustering is an improvement on heuristic-based clustering
 * approaches like Jenks. The algorithm was developed in
 * [Haizhou Wang and Mingzhou Song](http://journal.r-project.org/archive/2011-2/RJournal_2011-2_Wang+Song.pdf)
 * as a [dynamic programming](https://en.wikipedia.org/wiki/Dynamic_programming) approach
 * to the problem of clustering numeric data into groups with the least
 * within-group sum-of-squared-deviations.
 *
 * Minimizing the difference within groups - what Wang & Song refer to as
 * `withinss`, or within sum-of-squares, means that groups are optimally
 * homogenous within and the data is split into representative groups.
 * This is very useful for visualization, where you may want to represent
 * a continuous variable in discrete color or style groups. This function
 * can provide groups that emphasize differences between data.
 *
 * Being a dynamic approach, this algorithm is based on two matrices that
 * store incrementally-computed values for squared deviations and backtracking
 * indexes.
 *
 * Unlike the [original implementation](https://cran.r-project.org/web/packages/Ckmeans.1d.dp/index.html),
 * this implementation does not include any code to automatically determine
 * the optimal number of clusters: this information needs to be explicitly
 * provided.
 *
 * ### References
 * _Ckmeans.1d.dp: Optimal k-means Clustering in One Dimension by Dynamic
 * Programming_ Haizhou Wang and Mingzhou Song ISSN 2073-4859
 *
 * from The R Journal Vol. 3/2, December 2011
 * @param {Array<number>} data input data, as an array of number values
 * @param {number} nClusters number of desired classes. This cannot be
 * greater than the number of values in the data array.
 * @returns {Array<Array<number>>} clustered input
 * @example
 * ckmeans([-1, 2, -1, 2, 4, 5, 6, -1, 2, -1], 3);
 * // The input, clustered into groups of similar numbers.
 * //= [[-1, -1, -1, -1], [2, 2, 2], [4, 5, 6]]);
 */
function ckmeans(data/*: Array<number> */, nClusters/*: number */)/*: Array<Array<number>> */ {

    if (nClusters > data.length) {
        throw new Error('Cannot generate more classes than there are data values');
    }

    var sorted = numericSort(data),
        // we'll use this as the maximum number of clusters
        uniqueCount = uniqueCountSorted(sorted);

    // if all of the input values are identical, there's one cluster
    // with all of the input in it.
    if (uniqueCount === 1) {
        return [sorted];
    }

    // named 'D' originally
    var matrix = makeMatrix(nClusters, sorted.length),
        // named 'B' originally
        backtrackMatrix = makeMatrix(nClusters, sorted.length);

    // This is a dynamic programming way to solve the problem of minimizing
    // within-cluster sum of squares. It's similar to linear regression
    // in this way, and this calculation incrementally computes the
    // sum of squares that are later read.

    // The outer loop iterates through clusters, from 0 to nClusters.
    for (var cluster = 0; cluster < nClusters; cluster++) {

        // At the start of each loop, the mean starts as the first element
        var firstClusterMean = sorted[0];

        for (var sortedIdx = Math.max(cluster, 1);
             sortedIdx < sorted.length;
             sortedIdx++) {

            if (cluster === 0) {

                // Increase the running sum of squares calculation by this
                // new value
                var squaredDifference = Math.pow(
                    sorted[sortedIdx] - firstClusterMean, 2);
                matrix[cluster][sortedIdx] = matrix[cluster][sortedIdx - 1] +
                    (sortedIdx / (sortedIdx + 1)) * squaredDifference;

                // We're computing a running mean by taking the previous
                // mean value, multiplying it by the number of elements
                // seen so far, and then dividing it by the number of
                // elements total.
                var newSum = sortedIdx * firstClusterMean + sorted[sortedIdx];
                firstClusterMean = newSum / (sortedIdx + 1);

            } else {

                var sumSquaredDistances = 0,
                    meanXJ = 0;

                for (var j = sortedIdx; j >= cluster; j--) {

                    sumSquaredDistances += (sortedIdx - j) /
                        (sortedIdx - j + 1) *
                        Math.pow(sorted[j] - meanXJ, 2);

                    meanXJ = (sorted[j] + (sortedIdx - j) * meanXJ) /
                        (sortedIdx - j + 1);

                    if (j === sortedIdx) {
                        matrix[cluster][sortedIdx] = sumSquaredDistances;
                        backtrackMatrix[cluster][sortedIdx] = j;
                        if (j > 0) {
                            matrix[cluster][sortedIdx] += matrix[cluster - 1][j - 1];
                        }
                    } else {
                        if (j === 0) {
                            if (sumSquaredDistances <= matrix[cluster][sortedIdx]) {
                                matrix[cluster][sortedIdx] = sumSquaredDistances;
                                backtrackMatrix[cluster][sortedIdx] = j;
                            }
                        } else if (sumSquaredDistances + matrix[cluster - 1][j - 1] < matrix[cluster][sortedIdx]) {
                            matrix[cluster][sortedIdx] = sumSquaredDistances + matrix[cluster - 1][j - 1];
                            backtrackMatrix[cluster][sortedIdx] = j;
                        }
                    }
                }
            }
        }
    }

    // The real work of Ckmeans clustering happens in the matrix generation:
    // the generated matrices encode all possible clustering combinations, and
    // once they're generated we can solve for the best clustering groups
    // very quickly.
    var clusters = [],
        clusterRight = backtrackMatrix[0].length - 1;

    // Backtrack the clusters from the dynamic programming matrix. This
    // starts at the bottom-right corner of the matrix (if the top-left is 0, 0),
    // and moves the cluster target with the loop.
    for (cluster = backtrackMatrix.length - 1; cluster >= 0; cluster--) {

        var clusterLeft = backtrackMatrix[cluster][clusterRight];

        // fill the cluster from the sorted input by taking a slice of the
        // array. the backtrack matrix makes this easy - it stores the
        // indexes where the cluster should start and end.
        clusters[cluster] = sorted.slice(clusterLeft, clusterRight + 1);

        if (cluster > 0) {
            clusterRight = clusterLeft - 1;
        }
    }

    return clusters;
}

module.exports = ckmeans;

},{"32":32,"58":58}],10:[function(require,module,exports){
'use strict';
/* @flow */

var standardNormalTable = require(52);

/**
 * **[Cumulative Standard Normal Probability](http://en.wikipedia.org/wiki/Standard_normal_table)**
 *
 * Since probability tables cannot be
 * printed for every normal distribution, as there are an infinite variety
 * of normal distributions, it is common practice to convert a normal to a
 * standard normal and then use the standard normal table to find probabilities.
 *
 * You can use `.5 + .5 * errorFunction(x / Math.sqrt(2))` to calculate the probability
 * instead of looking it up in a table.
 *
 * @param {number} z
 * @returns {number} cumulative standard normal probability
 */
function cumulativeStdNormalProbability(z /*:number */)/*:number */ {

    // Calculate the position of this value.
    var absZ = Math.abs(z),
        // Each row begins with a different
        // significant digit: 0.5, 0.6, 0.7, and so on. Each value in the table
        // corresponds to a range of 0.01 in the input values, so the value is
        // multiplied by 100.
        index = Math.min(Math.round(absZ * 100), standardNormalTable.length - 1);

    // The index we calculate must be in the table as a positive value,
    // but we still pay attention to whether the input is positive
    // or negative, and flip the output value as a last step.
    if (z >= 0) {
        return standardNormalTable[index];
    } else {
        // due to floating-point arithmetic, values in the table with
        // 4 significant figures can nevertheless end up as repeating
        // fractions when they're computed here.
        return +(1 - standardNormalTable[index]).toFixed(4);
    }
}

module.exports = cumulativeStdNormalProbability;

},{"52":52}],11:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * We use `ε`, epsilon, as a stopping criterion when we want to iterate
 * until we're "close enough". Epsilon is a very small number: for
 * simple statistics, that number is **0.0001**
 *
 * This is used in calculations like the binomialDistribution, in which
 * the process of finding a value is [iterative](https://en.wikipedia.org/wiki/Iterative_method):
 * it progresses until it is close enough.
 *
 * Below is an example of using epsilon in [gradient descent](https://en.wikipedia.org/wiki/Gradient_descent),
 * where we're trying to find a local minimum of a function's derivative,
 * given by the `fDerivative` method.
 *
 * @example
 * // From calculation, we expect that the local minimum occurs at x=9/4
 * var x_old = 0;
 * // The algorithm starts at x=6
 * var x_new = 6;
 * var stepSize = 0.01;
 *
 * function fDerivative(x) {
 *   return 4 * Math.pow(x, 3) - 9 * Math.pow(x, 2);
 * }
 *
 * // The loop runs until the difference between the previous
 * // value and the current value is smaller than epsilon - a rough
 * // meaure of 'close enough'
 * while (Math.abs(x_new - x_old) > ss.epsilon) {
 *   x_old = x_new;
 *   x_new = x_old - stepSize * fDerivative(x_old);
 * }
 *
 * console.log('Local minimum occurs at', x_new);
 */
var epsilon = 0.0001;

module.exports = epsilon;

},{}],12:[function(require,module,exports){
'use strict';
/* @flow */

var max = require(21),
    min = require(27);

/**
 * Given an array of data, this will find the extent of the
 * data and return an array of breaks that can be used
 * to categorize the data into a number of classes. The
 * returned array will always be 1 longer than the number of
 * classes because it includes the minimum value.
 *
 * @param {Array<number>} data input data, as an array of number values
 * @param {number} nClasses number of desired classes
 * @returns {Array<number>} array of class break positions
 * @example
 * equalIntervalBreaks([1, 2, 3, 4, 5, 6], 4); //= [1, 2.25, 3.5, 4.75, 6]
 */
function equalIntervalBreaks(data/*: Array<number> */, nClasses/*:number*/)/*: Array<number> */ {

    if (data.length <= 1) {
        return data;
    }

    var theMin = min(data),
        theMax = max(data); 

    // the first break will always be the minimum value
    // in the dataset
    var breaks = [theMin];

    // The size of each break is the full range of the data
    // divided by the number of classes requested
    var breakSize = (theMax - theMin) / nClasses;

    // In the case of nClasses = 1, this loop won't run
    // and the returned breaks will be [min, max]
    for (var i = 1; i < nClasses; i++) {
        breaks.push(breaks[0] + breakSize * i);
    }

    // the last break will always be the
    // maximum.
    breaks.push(theMax);

    return breaks;
}

module.exports = equalIntervalBreaks;

},{"21":21,"27":27}],13:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * **[Gaussian error function](http://en.wikipedia.org/wiki/Error_function)**
 *
 * The `errorFunction(x/(sd * Math.sqrt(2)))` is the probability that a value in a
 * normal distribution with standard deviation sd is within x of the mean.
 *
 * This function returns a numerical approximation to the exact value.
 *
 * @param {number} x input
 * @return {number} error estimation
 * @example
 * errorFunction(1).toFixed(2); // => '0.84'
 */
function errorFunction(x/*: number */)/*: number */ {
    var t = 1 / (1 + 0.5 * Math.abs(x));
    var tau = t * Math.exp(-Math.pow(x, 2) -
        1.26551223 +
        1.00002368 * t +
        0.37409196 * Math.pow(t, 2) +
        0.09678418 * Math.pow(t, 3) -
        0.18628806 * Math.pow(t, 4) +
        0.27886807 * Math.pow(t, 5) -
        1.13520398 * Math.pow(t, 6) +
        1.48851587 * Math.pow(t, 7) -
        0.82215223 * Math.pow(t, 8) +
        0.17087277 * Math.pow(t, 9));
    if (x >= 0) {
        return 1 - tau;
    } else {
        return tau - 1;
    }
}

module.exports = errorFunction;

},{}],14:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * A [Factorial](https://en.wikipedia.org/wiki/Factorial), usually written n!, is the product of all positive
 * integers less than or equal to n. Often factorial is implemented
 * recursively, but this iterative approach is significantly faster
 * and simpler.
 *
 * @param {number} n input
 * @returns {number} factorial: n!
 * @example
 * factorial(5); // => 120
 */
function factorial(n /*: number */)/*: number */ {

    // factorial is mathematically undefined for negative numbers
    if (n < 0) { return NaN; }

    // typically you'll expand the factorial function going down, like
    // 5! = 5 * 4 * 3 * 2 * 1. This is going in the opposite direction,
    // counting from 2 up to the number in question, and since anything
    // multiplied by 1 is itself, the loop only needs to start at 2.
    var accumulator = 1;
    for (var i = 2; i <= n; i++) {
        // for each number up to and including the number `n`, multiply
        // the accumulator my that number.
        accumulator *= i;
    }
    return accumulator;
}

module.exports = factorial;

},{}],15:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The [Geometric Mean](https://en.wikipedia.org/wiki/Geometric_mean) is
 * a mean function that is more useful for numbers in different
 * ranges.
 *
 * This is the nth root of the input numbers multiplied by each other.
 *
 * The geometric mean is often useful for
 * **[proportional growth](https://en.wikipedia.org/wiki/Geometric_mean#Proportional_growth)**: given
 * growth rates for multiple years, like _80%, 16.66% and 42.85%_, a simple
 * mean will incorrectly estimate an average growth rate, whereas a geometric
 * mean will correctly estimate a growth rate that, over those years,
 * will yield the same end value.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input array
 * @returns {number} geometric mean
 * @example
 * var growthRates = [1.80, 1.166666, 1.428571];
 * var averageGrowth = geometricMean(growthRates);
 * var averageGrowthRates = [averageGrowth, averageGrowth, averageGrowth];
 * var startingValue = 10;
 * var startingValueMean = 10;
 * growthRates.forEach(function(rate) {
 *   startingValue *= rate;
 * });
 * averageGrowthRates.forEach(function(rate) {
 *   startingValueMean *= rate;
 * });
 * startingValueMean === startingValue;
 */
function geometricMean(x /*: Array<number> */) {
    // The mean of no numbers is null
    if (x.length === 0) { return undefined; }

    // the starting value.
    var value = 1;

    for (var i = 0; i < x.length; i++) {
        // the geometric mean is only valid for positive numbers
        if (x[i] <= 0) { return undefined; }

        // repeatedly multiply the value by each number
        value *= x[i];
    }

    return Math.pow(value, 1 / x.length);
}

module.exports = geometricMean;

},{}],16:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The [Harmonic Mean](https://en.wikipedia.org/wiki/Harmonic_mean) is
 * a mean function typically used to find the average of rates.
 * This mean is calculated by taking the reciprocal of the arithmetic mean
 * of the reciprocals of the input numbers.
 *
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array.
 *
 * @param {Array<number>} x input
 * @returns {number} harmonic mean
 * @example
 * harmonicMean([2, 3]).toFixed(2) // => '2.40'
 */
function harmonicMean(x /*: Array<number> */) {
    // The mean of no numbers is null
    if (x.length === 0) { return undefined; }

    var reciprocalSum = 0;

    for (var i = 0; i < x.length; i++) {
        // the harmonic mean is only valid for positive numbers
        if (x[i] <= 0) { return undefined; }

        reciprocalSum += 1 / x[i];
    }

    // divide n by the the reciprocal sum
    return x.length / reciprocalSum;
}

module.exports = harmonicMean;

},{}],17:[function(require,module,exports){
'use strict';
/* @flow */

var quantile = require(37);

/**
 * The [Interquartile range](http://en.wikipedia.org/wiki/Interquartile_range) is
 * a measure of statistical dispersion, or how scattered, spread, or
 * concentrated a distribution is. It's computed as the difference between
 * the third quartile and first quartile.
 *
 * @param {Array<number>} sample
 * @returns {number} interquartile range: the span between lower and upper quartile,
 * 0.25 and 0.75
 * @example
 * interquartileRange([0, 1, 2, 3]); // => 2
 */
function interquartileRange(sample/*: Array<number> */) {
    // Interquartile range is the span between the upper quartile,
    // at `0.75`, and lower quartile, `0.25`
    var q1 = quantile(sample, 0.75),
        q2 = quantile(sample, 0.25);

    if (typeof q1 === 'number' && typeof q2 === 'number') {
        return q1 - q2;
    }
}

module.exports = interquartileRange;

},{"37":37}],18:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The Inverse [Gaussian error function](http://en.wikipedia.org/wiki/Error_function)
 * returns a numerical approximation to the value that would have caused
 * `errorFunction()` to return x.
 *
 * @param {number} x value of error function
 * @returns {number} estimated inverted value
 */
function inverseErrorFunction(x/*: number */)/*: number */ {
    var a = (8 * (Math.PI - 3)) / (3 * Math.PI * (4 - Math.PI));

    var inv = Math.sqrt(Math.sqrt(
        Math.pow(2 / (Math.PI * a) + Math.log(1 - x * x) / 2, 2) -
        Math.log(1 - x * x) / a) -
        (2 / (Math.PI * a) + Math.log(1 - x * x) / 2));

    if (x >= 0) {
        return inv;
    } else {
        return -inv;
    }
}

module.exports = inverseErrorFunction;

},{}],19:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * [Simple linear regression](http://en.wikipedia.org/wiki/Simple_linear_regression)
 * is a simple way to find a fitted line
 * between a set of coordinates. This algorithm finds the slope and y-intercept of a regression line
 * using the least sum of squares.
 *
 * @param {Array<Array<number>>} data an array of two-element of arrays,
 * like `[[0, 1], [2, 3]]`
 * @returns {Object} object containing slope and intersect of regression line
 * @example
 * linearRegression([[0, 0], [1, 1]]); // => { m: 1, b: 0 }
 */
function linearRegression(data/*: Array<Array<number>> */)/*: { m: number, b: number } */ {

    var m, b;

    // Store data length in a local variable to reduce
    // repeated object property lookups
    var dataLength = data.length;

    //if there's only one point, arbitrarily choose a slope of 0
    //and a y-intercept of whatever the y of the initial point is
    if (dataLength === 1) {
        m = 0;
        b = data[0][1];
    } else {
        // Initialize our sums and scope the `m` and `b`
        // variables that define the line.
        var sumX = 0, sumY = 0,
            sumXX = 0, sumXY = 0;

        // Use local variables to grab point values
        // with minimal object property lookups
        var point, x, y;

        // Gather the sum of all x values, the sum of all
        // y values, and the sum of x^2 and (x*y) for each
        // value.
        //
        // In math notation, these would be SS_x, SS_y, SS_xx, and SS_xy
        for (var i = 0; i < dataLength; i++) {
            point = data[i];
            x = point[0];
            y = point[1];

            sumX += x;
            sumY += y;

            sumXX += x * x;
            sumXY += x * y;
        }

        // `m` is the slope of the regression line
        m = ((dataLength * sumXY) - (sumX * sumY)) /
            ((dataLength * sumXX) - (sumX * sumX));

        // `b` is the y-intercept of the line.
        b = (sumY / dataLength) - ((m * sumX) / dataLength);
    }

    // Return both values as an object.
    return {
        m: m,
        b: b
    };
}


module.exports = linearRegression;

},{}],20:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * Given the output of `linearRegression`: an object
 * with `m` and `b` values indicating slope and intercept,
 * respectively, generate a line function that translates
 * x values into y values.
 *
 * @param {Object} mb object with `m` and `b` members, representing
 * slope and intersect of desired line
 * @returns {Function} method that computes y-value at any given
 * x-value on the line.
 * @example
 * var l = linearRegressionLine(linearRegression([[0, 0], [1, 1]]));
 * l(0) // = 0
 * l(2) // = 2
 * linearRegressionLine({ b: 0, m: 1 })(1); // => 1
 * linearRegressionLine({ b: 1, m: 1 })(1); // => 2
 */
function linearRegressionLine(mb/*: { b: number, m: number }*/)/*: Function */ {
    // Return a function that computes a `y` value for each
    // x value it is given, based on the values of `b` and `a`
    // that we just computed.
    return function(x) {
        return mb.b + (mb.m * x);
    };
}

module.exports = linearRegressionLine;

},{}],21:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * This computes the maximum number in an array.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} maximum value
 * @example
 * max([1, 2, 3, 4]);
 * // => 4
 */
function max(x /*: Array<number> */) /*:number*/ {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, max is
        // NaN and is thus made the maximum element in the array
        if (value === undefined || x[i] > value) {
            value = x[i];
        }
    }
    if (value === undefined) {
        return NaN;
    }
    return value;
}

module.exports = max;

},{}],22:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The maximum is the highest number in the array. With a sorted array,
 * the last element in the array is always the largest, so this calculation
 * can be done in one step, or constant time.
 *
 * @param {Array<number>} x input
 * @returns {number} maximum value
 * @example
 * maxSorted([-100, -10, 1, 2, 5]); // => 5
 */
function maxSorted(x /*: Array<number> */)/*:number*/ {
    return x[x.length - 1];
}

module.exports = maxSorted;

},{}],23:[function(require,module,exports){
'use strict';
/* @flow */

var sum = require(53);

/**
 * The mean, _also known as average_,
 * is the sum of all values over the number of values.
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input values
 * @returns {number} mean
 * @example
 * mean([0, 10]); // => 5
 */
function mean(x /*: Array<number> */)/*:number*/ {
    // The mean of no numbers is null
    if (x.length === 0) { return NaN; }

    return sum(x) / x.length;
}

module.exports = mean;

},{"53":53}],24:[function(require,module,exports){
'use strict';
/* @flow */

var quantile = require(37);

/**
 * The [median](http://en.wikipedia.org/wiki/Median) is
 * the middle number of a list. This is often a good indicator of 'the middle'
 * when there are outliers that skew the `mean()` value.
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * The median isn't necessarily one of the elements in the list: the value
 * can be the average of two elements if the list has an even length
 * and the two central values are different.
 *
 * @param {Array<number>} x input
 * @returns {number} median value
 * @example
 * median([10, 2, 5, 100, 2, 1]); // => 3.5
 */
function median(x /*: Array<number> */)/*:number*/ {
    return +quantile(x, 0.5);
}

module.exports = median;

},{"37":37}],25:[function(require,module,exports){
'use strict';
/* @flow */

var median = require(24);

/**
 * The [Median Absolute Deviation](http://en.wikipedia.org/wiki/Median_absolute_deviation) is
 * a robust measure of statistical
 * dispersion. It is more resilient to outliers than the standard deviation.
 *
 * @param {Array<number>} x input array
 * @returns {number} median absolute deviation
 * @example
 * medianAbsoluteDeviation([1, 1, 2, 2, 4, 6, 9]); // => 1
 */
function medianAbsoluteDeviation(x /*: Array<number> */) {
    // The mad of nothing is null
    var medianValue = median(x),
        medianAbsoluteDeviations = [];

    // Make a list of absolute deviations from the median
    for (var i = 0; i < x.length; i++) {
        medianAbsoluteDeviations.push(Math.abs(x[i] - medianValue));
    }

    // Find the median value of that list
    return median(medianAbsoluteDeviations);
}

module.exports = medianAbsoluteDeviation;

},{"24":24}],26:[function(require,module,exports){
'use strict';
/* @flow */

var quantileSorted = require(38);

/**
 * The [median](http://en.wikipedia.org/wiki/Median) is
 * the middle number of a list. This is often a good indicator of 'the middle'
 * when there are outliers that skew the `mean()` value.
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * The median isn't necessarily one of the elements in the list: the value
 * can be the average of two elements if the list has an even length
 * and the two central values are different.
 *
 * @param {Array<number>} sorted input
 * @returns {number} median value
 * @example
 * medianSorted([10, 2, 5, 100, 2, 1]); // => 52.5
 */
function medianSorted(sorted /*: Array<number> */)/*:number*/ {
    return quantileSorted(sorted, 0.5);
}

module.exports = medianSorted;

},{"38":38}],27:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The min is the lowest number in the array. This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} minimum value
 * @example
 * min([1, 5, -10, 100, 2]); // => -10
 */
function min(x /*: Array<number> */)/*:number*/ {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, min is
        // NaN and is thus made the minimum element in the array
        if (value === undefined || x[i] < value) {
            value = x[i];
        }
    }
    if (value === undefined) {
        return NaN;
    }
    return value;
}

module.exports = min;

},{}],28:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The minimum is the lowest number in the array. With a sorted array,
 * the first element in the array is always the smallest, so this calculation
 * can be done in one step, or constant time.
 *
 * @param {Array<number>} x input
 * @returns {number} minimum value
 * @example
 * minSorted([-100, -10, 1, 2, 5]); // => -100
 */
function minSorted(x /*: Array<number> */)/*:number*/ {
    return x[0];
}

module.exports = minSorted;

},{}],29:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * **Mixin** simple_statistics to a single Array instance if provided
 * or the Array native object if not. This is an optional
 * feature that lets you treat simple_statistics as a native feature
 * of Javascript.
 *
 * @param {Object} ss simple statistics
 * @param {Array} [array=] a single array instance which will be augmented
 * with the extra methods. If omitted, mixin will apply to all arrays
 * by changing the global `Array.prototype`.
 * @returns {*} the extended Array, or Array.prototype if no object
 * is given.
 *
 * @example
 * var myNumbers = [1, 2, 3];
 * mixin(ss, myNumbers);
 * console.log(myNumbers.sum()); // 6
 */
function mixin(ss /*: Object */, array /*: ?Array<any> */)/*: any */ {
    var support = !!(Object.defineProperty && Object.defineProperties);
    // Coverage testing will never test this error.
    /* istanbul ignore next */
    if (!support) {
        throw new Error('without defineProperty, simple-statistics cannot be mixed in');
    }

    // only methods which work on basic arrays in a single step
    // are supported
    var arrayMethods = ['median', 'standardDeviation', 'sum', 'product',
        'sampleSkewness',
        'mean', 'min', 'max', 'quantile', 'geometricMean',
        'harmonicMean', 'root_mean_square'];

    // create a closure with a method name so that a reference
    // like `arrayMethods[i]` doesn't follow the loop increment
    function wrap(method) {
        return function() {
            // cast any arguments into an array, since they're
            // natively objects
            var args = Array.prototype.slice.apply(arguments);
            // make the first argument the array itself
            args.unshift(this);
            // return the result of the ss method
            return ss[method].apply(ss, args);
        };
    }

    // select object to extend
    var extending;
    if (array) {
        // create a shallow copy of the array so that our internal
        // operations do not change it by reference
        extending = array.slice();
    } else {
        extending = Array.prototype;
    }

    // for each array function, define a function that gets
    // the array as the first argument.
    // We use [defineProperty](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty)
    // because it allows these properties to be non-enumerable:
    // `for (var in x)` loops will not run into problems with this
    // implementation.
    for (var i = 0; i < arrayMethods.length; i++) {
        Object.defineProperty(extending, arrayMethods[i], {
            value: wrap(arrayMethods[i]),
            configurable: true,
            enumerable: false,
            writable: true
        });
    }

    return extending;
}

module.exports = mixin;

},{}],30:[function(require,module,exports){
'use strict';
/* @flow */

var numericSort = require(32),
    modeSorted = require(31);

/**
 * The [mode](http://bit.ly/W5K4Yt) is the number that appears in a list the highest number of times.
 * There can be multiple modes in a list: in the event of a tie, this
 * algorithm will return the most recently seen mode.
 *
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(nlog(n))` because it needs to sort the array internally
 * before running an `O(n)` search to find the mode.
 *
 * @param {Array<number>} x input
 * @returns {number} mode
 * @example
 * mode([0, 0, 1]); // => 0
 */
function mode(x /*: Array<number> */)/*:number*/ {
    // Sorting the array lets us iterate through it below and be sure
    // that every time we see a new number it's new and we'll never
    // see the same number twice
    return modeSorted(numericSort(x));
}

module.exports = mode;

},{"31":31,"32":32}],31:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The [mode](http://bit.ly/W5K4Yt) is the number that appears in a list the highest number of times.
 * There can be multiple modes in a list: in the event of a tie, this
 * algorithm will return the most recently seen mode.
 *
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs in `O(n)` because the input is sorted.
 *
 * @param {Array<number>} sorted input
 * @returns {number} mode
 * @example
 * modeSorted([0, 0, 1]); // => 0
 */
function modeSorted(sorted /*: Array<number> */)/*:number*/ {

    // Handle edge cases:
    // The mode of an empty list is NaN
    if (sorted.length === 0) { return NaN; }
    else if (sorted.length === 1) { return sorted[0]; }

    // This assumes it is dealing with an array of size > 1, since size
    // 0 and 1 are handled immediately. Hence it starts at index 1 in the
    // array.
    var last = sorted[0],
        // store the mode as we find new modes
        value = NaN,
        // store how many times we've seen the mode
        maxSeen = 0,
        // how many times the current candidate for the mode
        // has been seen
        seenThis = 1;

    // end at sorted.length + 1 to fix the case in which the mode is
    // the highest number that occurs in the sequence. the last iteration
    // compares sorted[i], which is undefined, to the highest number
    // in the series
    for (var i = 1; i < sorted.length + 1; i++) {
        // we're seeing a new number pass by
        if (sorted[i] !== last) {
            // the last number is the new mode since we saw it more
            // often than the old one
            if (seenThis > maxSeen) {
                maxSeen = seenThis;
                value = last;
            }
            seenThis = 1;
            last = sorted[i];
        // if this isn't a new number, it's one more occurrence of
        // the potential mode
        } else { seenThis++; }
    }
    return value;
}

module.exports = modeSorted;

},{}],32:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * Sort an array of numbers by their numeric value, ensuring that the
 * array is not changed in place.
 *
 * This is necessary because the default behavior of .sort
 * in JavaScript is to sort arrays as string values
 *
 *     [1, 10, 12, 102, 20].sort()
 *     // output
 *     [1, 10, 102, 12, 20]
 *
 * @param {Array<number>} array input array
 * @return {Array<number>} sorted array
 * @private
 * @example
 * numericSort([3, 2, 1]) // => [1, 2, 3]
 */
function numericSort(array /*: Array<number> */) /*: Array<number> */ {
    return array
        // ensure the array is changed in-place
        .slice()
        // comparator function that treats input as numeric
        .sort(function(a, b) {
            return a - b;
        });
}

module.exports = numericSort;

},{}],33:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * This is a single-layer [Perceptron Classifier](http://en.wikipedia.org/wiki/Perceptron) that takes
 * arrays of numbers and predicts whether they should be classified
 * as either 0 or 1 (negative or positive examples).
 * @class
 * @example
 * // Create the model
 * var p = new PerceptronModel();
 * // Train the model with input with a diagonal boundary.
 * for (var i = 0; i < 5; i++) {
 *     p.train([1, 1], 1);
 *     p.train([0, 1], 0);
 *     p.train([1, 0], 0);
 *     p.train([0, 0], 0);
 * }
 * p.predict([0, 0]); // 0
 * p.predict([0, 1]); // 0
 * p.predict([1, 0]); // 0
 * p.predict([1, 1]); // 1
 */
function PerceptronModel() {
    // The weights, or coefficients of the model;
    // weights are only populated when training with data.
    this.weights = [];
    // The bias term, or intercept; it is also a weight but
    // it's stored separately for convenience as it is always
    // multiplied by one.
    this.bias = 0;
}

/**
 * **Predict**: Use an array of features with the weight array and bias
 * to predict whether an example is labeled 0 or 1.
 *
 * @param {Array<number>} features an array of features as numbers
 * @returns {number} 1 if the score is over 0, otherwise 0
 */
PerceptronModel.prototype.predict = function(features) {

    // Only predict if previously trained
    // on the same size feature array(s).
    if (features.length !== this.weights.length) { return null; }

    // Calculate the sum of features times weights,
    // with the bias added (implicitly times one).
    var score = 0;
    for (var i = 0; i < this.weights.length; i++) {
        score += this.weights[i] * features[i];
    }
    score += this.bias;

    // Classify as 1 if the score is over 0, otherwise 0.
    if (score > 0) {
        return 1;
    } else {
        return 0;
    }
};

/**
 * **Train** the classifier with a new example, which is
 * a numeric array of features and a 0 or 1 label.
 *
 * @param {Array<number>} features an array of features as numbers
 * @param {number} label either 0 or 1
 * @returns {PerceptronModel} this
 */
PerceptronModel.prototype.train = function(features, label) {
    // Require that only labels of 0 or 1 are considered.
    if (label !== 0 && label !== 1) { return null; }
    // The length of the feature array determines
    // the length of the weight array.
    // The perceptron will continue learning as long as
    // it keeps seeing feature arrays of the same length.
    // When it sees a new data shape, it initializes.
    if (features.length !== this.weights.length) {
        this.weights = features;
        this.bias = 1;
    }
    // Make a prediction based on current weights.
    var prediction = this.predict(features);
    // Update the weights if the prediction is wrong.
    if (prediction !== label) {
        var gradient = label - prediction;
        for (var i = 0; i < this.weights.length; i++) {
            this.weights[i] += gradient * features[i];
        }
        this.bias += gradient;
    }
    return this;
};

module.exports = PerceptronModel;

},{}],34:[function(require,module,exports){
'use strict';
/* @flow */

var epsilon = require(11);
var factorial = require(14);

/**
 * The [Poisson Distribution](http://en.wikipedia.org/wiki/Poisson_distribution)
 * is a discrete probability distribution that expresses the probability
 * of a given number of events occurring in a fixed interval of time
 * and/or space if these events occur with a known average rate and
 * independently of the time since the last event.
 *
 * The Poisson Distribution is characterized by the strictly positive
 * mean arrival or occurrence rate, `λ`.
 *
 * @param {number} lambda location poisson distribution
 * @returns {number} value of poisson distribution at that point
 */
function poissonDistribution(lambda/*: number */) {
    // Check that lambda is strictly positive
    if (lambda <= 0) { return undefined; }

    // our current place in the distribution
    var x = 0,
        // and we keep track of the current cumulative probability, in
        // order to know when to stop calculating chances.
        cumulativeProbability = 0,
        // the calculated cells to be returned
        cells = {};

    // This algorithm iterates through each potential outcome,
    // until the `cumulativeProbability` is very close to 1, at
    // which point we've defined the vast majority of outcomes
    do {
        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        cells[x] = (Math.pow(Math.E, -lambda) * Math.pow(lambda, x)) / factorial(x);
        cumulativeProbability += cells[x];
        x++;
    // when the cumulativeProbability is nearly 1, we've calculated
    // the useful range of this distribution
    } while (cumulativeProbability < 1 - epsilon);

    return cells;
}

module.exports = poissonDistribution;

},{"11":11,"14":14}],35:[function(require,module,exports){
'use strict';
/* @flow */

var epsilon = require(11);
var inverseErrorFunction = require(18);

/**
 * The [Probit](http://en.wikipedia.org/wiki/Probit)
 * is the inverse of cumulativeStdNormalProbability(),
 * and is also known as the normal quantile function.
 *
 * It returns the number of standard deviations from the mean
 * where the p'th quantile of values can be found in a normal distribution.
 * So, for example, probit(0.5 + 0.6827/2) ≈ 1 because 68.27% of values are
 * normally found within 1 standard deviation above or below the mean.
 *
 * @param {number} p
 * @returns {number} probit
 */
function probit(p /*: number */)/*: number */ {
    if (p === 0) {
        p = epsilon;
    } else if (p >= 1) {
        p = 1 - epsilon;
    }
    return Math.sqrt(2) * inverseErrorFunction(2 * p - 1);
}

module.exports = probit;

},{"11":11,"18":18}],36:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The [product](https://en.wikipedia.org/wiki/Product_(mathematics)) of an array
 * is the result of multiplying all numbers together, starting using one as the multiplicative identity.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @return {number} product of all input numbers
 * @example
 * product([1, 2, 3, 4]); // => 24
 */
function product(x/*: Array<number> */)/*: number */ {
    var value = 1;
    for (var i = 0; i < x.length; i++) {
        value *= x[i];
    }
    return value;
}

module.exports = product;

},{}],37:[function(require,module,exports){
'use strict';
/* @flow */

var quantileSorted = require(38);
var quickselect = require(39);

/**
 * The [quantile](https://en.wikipedia.org/wiki/Quantile):
 * this is a population quantile, since we assume to know the entire
 * dataset in this library. This is an implementation of the
 * [Quantiles of a Population](http://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population)
 * algorithm from wikipedia.
 *
 * Sample is a one-dimensional array of numbers,
 * and p is either a decimal number from 0 to 1 or an array of decimal
 * numbers from 0 to 1.
 * In terms of a k/q quantile, p = k/q - it's just dealing with fractions or dealing
 * with decimal values.
 * When p is an array, the result of the function is also an array containing the appropriate
 * quantiles in input order
 *
 * @param {Array<number>} sample a sample from the population
 * @param {number} p the desired quantile, as a number between 0 and 1
 * @returns {number} quantile
 * @example
 * quantile([3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20], 0.5); // => 9
 */
function quantile(sample /*: Array<number> */, p /*: Array<number> | number */) {
    var copy = sample.slice();

    if (Array.isArray(p)) {
        // rearrange elements so that each element corresponding to a requested
        // quantile is on a place it would be if the array was fully sorted
        multiQuantileSelect(copy, p);
        // Initialize the result array
        var results = [];
        // For each requested quantile
        for (var i = 0; i < p.length; i++) {
            results[i] = quantileSorted(copy, p[i]);
        }
        return results;
    } else {
        var idx = quantileIndex(copy.length, p);
        quantileSelect(copy, idx, 0, copy.length - 1);
        return quantileSorted(copy, p);
    }
}

function quantileSelect(arr, k, left, right) {
    if (k % 1 === 0) {
        quickselect(arr, k, left, right);
    } else {
        k = Math.floor(k);
        quickselect(arr, k, left, right);
        quickselect(arr, k + 1, k + 1, right);
    }
}

function multiQuantileSelect(arr, p) {
    var indices = [0];
    for (var i = 0; i < p.length; i++) {
        indices.push(quantileIndex(arr.length, p[i]));
    }
    indices.push(arr.length - 1);
    indices.sort(compare);

    var stack = [0, indices.length - 1];

    while (stack.length) {
        var r = Math.ceil(stack.pop());
        var l = Math.floor(stack.pop());
        if (r - l <= 1) continue;

        var m = Math.floor((l + r) / 2);
        quantileSelect(arr, indices[m], indices[l], indices[r]);

        stack.push(l, m, m, r);
    }
}

function compare(a, b) {
    return a - b;
}

function quantileIndex(len /*: number */, p /*: number */)/*:number*/ {
    var idx = len * p;
    if (p === 1) {
        // If p is 1, directly return the last index
        return len - 1;
    } else if (p === 0) {
        // If p is 0, directly return the first index
        return 0;
    } else if (idx % 1 !== 0) {
        // If index is not integer, return the next index in array
        return Math.ceil(idx) - 1;
    } else if (len % 2 === 0) {
        // If the list has even-length, we'll return the middle of two indices
        // around quantile to indicate that we need an average value of the two
        return idx - 0.5;
    } else {
        // Finally, in the simple case of an integer index
        // with an odd-length list, return the index
        return idx;
    }
}

module.exports = quantile;

},{"38":38,"39":39}],38:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * This is the internal implementation of quantiles: when you know
 * that the order is sorted, you don't need to re-sort it, and the computations
 * are faster.
 *
 * @param {Array<number>} sample input data
 * @param {number} p desired quantile: a number between 0 to 1, inclusive
 * @returns {number} quantile value
 * @example
 * quantileSorted([3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20], 0.5); // => 9
 */
function quantileSorted(sample /*: Array<number> */, p /*: number */)/*:number*/ {
    var idx = sample.length * p;
    if (p < 0 || p > 1) {
        return NaN;
    } else if (p === 1) {
        // If p is 1, directly return the last element
        return sample[sample.length - 1];
    } else if (p === 0) {
        // If p is 0, directly return the first element
        return sample[0];
    } else if (idx % 1 !== 0) {
        // If p is not integer, return the next element in array
        return sample[Math.ceil(idx) - 1];
    } else if (sample.length % 2 === 0) {
        // If the list has even-length, we'll take the average of this number
        // and the next value, if there is one
        return (sample[idx - 1] + sample[idx]) / 2;
    } else {
        // Finally, in the simple case of an integer value
        // with an odd-length list, return the sample value at the index.
        return sample[idx];
    }
}

module.exports = quantileSorted;

},{}],39:[function(require,module,exports){
'use strict';
/* @flow */

module.exports = quickselect;

/**
 * Rearrange items in `arr` so that all items in `[left, k]` range are the smallest.
 * The `k`-th element will have the `(k - left + 1)`-th smallest value in `[left, right]`.
 *
 * Implements Floyd-Rivest selection algorithm https://en.wikipedia.org/wiki/Floyd-Rivest_algorithm
 *
 * @private
 * @param {Array<number>} arr input array
 * @param {number} k pivot index
 * @param {number} left left index
 * @param {number} right right index
 * @returns {undefined}
 * @example
 * var arr = [65, 28, 59, 33, 21, 56, 22, 95, 50, 12, 90, 53, 28, 77, 39];
 * quickselect(arr, 8);
 * // = [39, 28, 28, 33, 21, 12, 22, 50, 53, 56, 59, 65, 90, 77, 95]
 */
function quickselect(arr /*: Array<number> */, k /*: number */, left /*: number */, right /*: number */) {
    left = left || 0;
    right = right || (arr.length - 1);

    while (right > left) {
        // 600 and 0.5 are arbitrary constants chosen in the original paper to minimize execution time
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n);
            if (m - n / 2 < 0) sd *= -1;
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselect(arr, k, newLeft, newRight);
        }

        var t = arr[k];
        var i = left;
        var j = right;

        swap(arr, left, k);
        if (arr[right] > t) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (arr[i] < t) i++;
            while (arr[j] > t) j--;
        }

        if (arr[left] === t) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

},{}],40:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The [R Squared](http://en.wikipedia.org/wiki/Coefficient_of_determination)
 * value of data compared with a function `f`
 * is the sum of the squared differences between the prediction
 * and the actual value.
 *
 * @param {Array<Array<number>>} data input data: this should be doubly-nested
 * @param {Function} func function called on `[i][0]` values within the dataset
 * @returns {number} r-squared value
 * @example
 * var samples = [[0, 0], [1, 1]];
 * var regressionLine = linearRegressionLine(linearRegression(samples));
 * rSquared(samples, regressionLine); // = 1 this line is a perfect fit
 */
function rSquared(data /*: Array<Array<number>> */, func /*: Function */) /*: number */ {
    if (data.length < 2) { return 1; }

    // Compute the average y value for the actual
    // data set in order to compute the
    // _total sum of squares_
    var sum = 0, average;
    for (var i = 0; i < data.length; i++) {
        sum += data[i][1];
    }
    average = sum / data.length;

    // Compute the total sum of squares - the
    // squared difference between each point
    // and the average of all points.
    var sumOfSquares = 0;
    for (var j = 0; j < data.length; j++) {
        sumOfSquares += Math.pow(average - data[j][1], 2);
    }

    // Finally estimate the error: the squared
    // difference between the estimate and the actual data
    // value at each point.
    var err = 0;
    for (var k = 0; k < data.length; k++) {
        err += Math.pow(data[k][1] - func(data[k][0]), 2);
    }

    // As the error grows larger, its ratio to the
    // sum of squares increases and the r squared
    // value grows lower.
    return 1 - err / sumOfSquares;
}

module.exports = rSquared;

},{}],41:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The Root Mean Square (RMS) is
 * a mean function used as a measure of the magnitude of a set
 * of numbers, regardless of their sign.
 * This is the square root of the mean of the squares of the
 * input numbers.
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} root mean square
 * @example
 * rootMeanSquare([-1, 1, -1, 1]); // => 1
 */
function rootMeanSquare(x /*: Array<number> */)/*:number*/ {
    if (x.length === 0) { return NaN; }

    var sumOfSquares = 0;
    for (var i = 0; i < x.length; i++) {
        sumOfSquares += Math.pow(x[i], 2);
    }

    return Math.sqrt(sumOfSquares / x.length);
}

module.exports = rootMeanSquare;

},{}],42:[function(require,module,exports){
'use strict';
/* @flow */

var shuffle = require(48);

/**
 * Create a [simple random sample](http://en.wikipedia.org/wiki/Simple_random_sample)
 * from a given array of `n` elements.
 *
 * The sampled values will be in any order, not necessarily the order
 * they appear in the input.
 *
 * @param {Array} array input array. can contain any type
 * @param {number} n count of how many elements to take
 * @param {Function} [randomSource=Math.random] an optional source of entropy
 * instead of Math.random
 * @return {Array} subset of n elements in original array
 * @example
 * var values = [1, 2, 4, 5, 6, 7, 8, 9];
 * sample(values, 3); // returns 3 random values, like [2, 5, 8];
 */
function sample/*:: <T> */(
    array /*: Array<T> */,
    n /*: number */,
    randomSource /*: Function */) /*: Array<T> */ {
    // shuffle the original array using a fisher-yates shuffle
    var shuffled = shuffle(array, randomSource);

    // and then return a subset of it - the first `n` elements.
    return shuffled.slice(0, n);
}

module.exports = sample;

},{"48":48}],43:[function(require,module,exports){
'use strict';
/* @flow */

var sampleCovariance = require(44);
var sampleStandardDeviation = require(46);

/**
 * The [correlation](http://en.wikipedia.org/wiki/Correlation_and_dependence) is
 * a measure of how correlated two datasets are, between -1 and 1
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample correlation
 * @example
 * sampleCorrelation([1, 2, 3, 4, 5, 6], [2, 2, 3, 4, 5, 60]).toFixed(2);
 * // => '0.69'
 */
function sampleCorrelation(x/*: Array<number> */, y/*: Array<number> */)/*:number*/ {
    var cov = sampleCovariance(x, y),
        xstd = sampleStandardDeviation(x),
        ystd = sampleStandardDeviation(y);

    return cov / xstd / ystd;
}

module.exports = sampleCorrelation;

},{"44":44,"46":46}],44:[function(require,module,exports){
'use strict';
/* @flow */

var mean = require(23);

/**
 * [Sample covariance](https://en.wikipedia.org/wiki/Sample_mean_and_sampleCovariance) of two datasets:
 * how much do the two datasets move together?
 * x and y are two datasets, represented as arrays of numbers.
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample covariance
 * @example
 * sampleCovariance([1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1]); // => -3.5
 */
function sampleCovariance(x /*:Array<number>*/, y /*:Array<number>*/)/*:number*/ {

    // The two datasets must have the same length which must be more than 1
    if (x.length <= 1 || x.length !== y.length) {
        return NaN;
    }

    // determine the mean of each dataset so that we can judge each
    // value of the dataset fairly as the difference from the mean. this
    // way, if one dataset is [1, 2, 3] and [2, 3, 4], their covariance
    // does not suffer because of the difference in absolute values
    var xmean = mean(x),
        ymean = mean(y),
        sum = 0;

    // for each pair of values, the covariance increases when their
    // difference from the mean is associated - if both are well above
    // or if both are well below
    // the mean, the covariance increases significantly.
    for (var i = 0; i < x.length; i++) {
        sum += (x[i] - xmean) * (y[i] - ymean);
    }

    // this is Bessels' Correction: an adjustment made to sample statistics
    // that allows for the reduced degree of freedom entailed in calculating
    // values from samples rather than complete populations.
    var besselsCorrection = x.length - 1;

    // the covariance is weighted by the length of the datasets.
    return sum / besselsCorrection;
}

module.exports = sampleCovariance;

},{"23":23}],45:[function(require,module,exports){
'use strict';
/* @flow */

var sumNthPowerDeviations = require(54);
var sampleStandardDeviation = require(46);

/**
 * [Skewness](http://en.wikipedia.org/wiki/Skewness) is
 * a measure of the extent to which a probability distribution of a
 * real-valued random variable "leans" to one side of the mean.
 * The skewness value can be positive or negative, or even undefined.
 *
 * Implementation is based on the adjusted Fisher-Pearson standardized
 * moment coefficient, which is the version found in Excel and several
 * statistical packages including Minitab, SAS and SPSS.
 *
 * @param {Array<number>} x input
 * @returns {number} sample skewness
 * @example
 * sampleSkewness([2, 4, 6, 3, 1]); // => 0.590128656384365
 */
function sampleSkewness(x /*: Array<number> */)/*:number*/ {
    // The skewness of less than three arguments is null
    var theSampleStandardDeviation = sampleStandardDeviation(x);

    if (isNaN(theSampleStandardDeviation) || x.length < 3) {
        return NaN;
    }

    var n = x.length,
        cubedS = Math.pow(theSampleStandardDeviation, 3),
        sumCubedDeviations = sumNthPowerDeviations(x, 3);

    return n * sumCubedDeviations / ((n - 1) * (n - 2) * cubedS);
}

module.exports = sampleSkewness;

},{"46":46,"54":54}],46:[function(require,module,exports){
'use strict';
/* @flow */

var sampleVariance = require(47);

/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance.
 *
 * @param {Array<number>} x input array
 * @returns {number} sample standard deviation
 * @example
 * sampleStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]).toFixed(2);
 * // => '2.14'
 */
function sampleStandardDeviation(x/*:Array<number>*/)/*:number*/ {
    // The standard deviation of no numbers is null
    var sampleVarianceX = sampleVariance(x);
    if (isNaN(sampleVarianceX)) { return NaN; }
    return Math.sqrt(sampleVarianceX);
}

module.exports = sampleStandardDeviation;

},{"47":47}],47:[function(require,module,exports){
'use strict';
/* @flow */

var sumNthPowerDeviations = require(54);

/*
 * The [sample variance](https://en.wikipedia.org/wiki/Variance#Sample_variance)
 * is the sum of squared deviations from the mean. The sample variance
 * is distinguished from the variance by the usage of [Bessel's Correction](https://en.wikipedia.org/wiki/Bessel's_correction):
 * instead of dividing the sum of squared deviations by the length of the input,
 * it is divided by the length minus one. This corrects the bias in estimating
 * a value from a set that you don't know if full.
 *
 * References:
 * * [Wolfram MathWorld on Sample Variance](http://mathworld.wolfram.com/SampleVariance.html)
 *
 * @param {Array<number>} x input array
 * @return {number} sample variance
 * @example
 * sampleVariance([1, 2, 3, 4, 5]); // => 2.5
 */
function sampleVariance(x /*: Array<number> */)/*:number*/ {
    // The variance of no numbers is null
    if (x.length <= 1) { return NaN; }

    var sumSquaredDeviationsValue = sumNthPowerDeviations(x, 2);

    // this is Bessels' Correction: an adjustment made to sample statistics
    // that allows for the reduced degree of freedom entailed in calculating
    // values from samples rather than complete populations.
    var besselsCorrection = x.length - 1;

    // Find the mean value of that list
    return sumSquaredDeviationsValue / besselsCorrection;
}

module.exports = sampleVariance;

},{"54":54}],48:[function(require,module,exports){
'use strict';
/* @flow */

var shuffleInPlace = require(49);

/*
 * A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 * is a fast way to create a random permutation of a finite set. This is
 * a function around `shuffle_in_place` that adds the guarantee that
 * it will not modify its input.
 *
 * @param {Array} sample an array of any kind of element
 * @param {Function} [randomSource=Math.random] an optional entropy source
 * @return {Array} shuffled version of input
 * @example
 * var shuffled = shuffle([1, 2, 3, 4]);
 * shuffled; // = [2, 3, 1, 4] or any other random permutation
 */
function shuffle/*::<T>*/(sample/*:Array<T>*/, randomSource/*:Function*/) {
    // slice the original array so that it is not modified
    sample = sample.slice();

    // and then shuffle that shallow-copied array, in place
    return shuffleInPlace(sample.slice(), randomSource);
}

module.exports = shuffle;

},{"49":49}],49:[function(require,module,exports){
'use strict';
/* @flow */

/*
 * A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 * in-place - which means that it **will change the order of the original
 * array by reference**.
 *
 * This is an algorithm that generates a random [permutation](https://en.wikipedia.org/wiki/Permutation)
 * of a set.
 *
 * @param {Array} sample input array
 * @param {Function} [randomSource=Math.random] an optional source of entropy
 * @returns {Array} sample
 * @example
 * var sample = [1, 2, 3, 4];
 * shuffleInPlace(sample);
 * // sample is shuffled to a value like [2, 1, 4, 3]
 */
function shuffleInPlace(sample/*:Array<any>*/, randomSource/*:Function*/)/*:Array<any>*/ {


    // a custom random number source can be provided if you want to use
    // a fixed seed or another random number generator, like
    // [random-js](https://www.npmjs.org/package/random-js)
    randomSource = randomSource || Math.random;

    // store the current length of the sample to determine
    // when no elements remain to shuffle.
    var length = sample.length;

    // temporary is used to hold an item when it is being
    // swapped between indices.
    var temporary;

    // The index to swap at each stage.
    var index;

    // While there are still items to shuffle
    while (length > 0) {
        // chose a random index within the subset of the array
        // that is not yet shuffled
        index = Math.floor(randomSource() * length--);

        // store the value that we'll move temporarily
        temporary = sample[length];

        // swap the value at `sample[length]` with `sample[index]`
        sample[length] = sample[index];
        sample[index] = temporary;
    }

    return sample;
}

module.exports = shuffleInPlace;

},{}],50:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * [Sign](https://en.wikipedia.org/wiki/Sign_function) is a function 
 * that extracts the sign of a real number
 * 
 * @param {Number} x input value
 * @returns {Number} sign value either 1, 0 or -1
 * @throws {TypeError} if the input argument x is not a number
 * 
 * @example
 * sign(2); // => 1
 */
function sign(x/*: number */)/*: number */ {
    if (typeof x === 'number') {
        if (x < 0) {
            return -1;
        } else if (x === 0) {
            return 0
        } else {
            return 1;
        }
    } else {
        throw new TypeError('not a number');
    }
}

module.exports = sign;

},{}],51:[function(require,module,exports){
'use strict';
/* @flow */

var variance = require(59);

/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance. It's useful for measuring the amount
 * of variation or dispersion in a set of values.
 *
 * Standard deviation is only appropriate for full-population knowledge: for
 * samples of a population, {@link sampleStandardDeviation} is
 * more appropriate.
 *
 * @param {Array<number>} x input
 * @returns {number} standard deviation
 * @example
 * variance([2, 4, 4, 4, 5, 5, 7, 9]); // => 4
 * standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]); // => 2
 */
function standardDeviation(x /*: Array<number> */)/*:number*/ {
    // The standard deviation of no numbers is null
    var v = variance(x);
    if (isNaN(v)) { return 0; }
    return Math.sqrt(v);
}

module.exports = standardDeviation;

},{"59":59}],52:[function(require,module,exports){
'use strict';
/* @flow */

var SQRT_2PI = Math.sqrt(2 * Math.PI);

function cumulativeDistribution(z) {
    var sum = z,
        tmp = z;

    // 15 iterations are enough for 4-digit precision
    for (var i = 1; i < 15; i++) {
        tmp *= z * z / (2 * i + 1);
        sum += tmp;
    }
    return Math.round((0.5 + (sum / SQRT_2PI) * Math.exp(-z * z / 2)) * 1e4) / 1e4;
}

/**
 * A standard normal table, also called the unit normal table or Z table,
 * is a mathematical table for the values of Φ (phi), which are the values of
 * the cumulative distribution function of the normal distribution.
 * It is used to find the probability that a statistic is observed below,
 * above, or between values on the standard normal distribution, and by
 * extension, any normal distribution.
 *
 * The probabilities are calculated using the
 * [Cumulative distribution function](https://en.wikipedia.org/wiki/Normal_distribution#Cumulative_distribution_function).
 * The table used is the cumulative, and not cumulative from 0 to mean
 * (even though the latter has 5 digits precision, instead of 4).
 */
var standardNormalTable/*: Array<number> */ = [];

for (var z = 0; z <= 3.09; z += 0.01) {
    standardNormalTable.push(cumulativeDistribution(z));
}

module.exports = standardNormalTable;

},{}],53:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * Our default sum is the [Kahan summation algorithm](https://en.wikipedia.org/wiki/Kahan_summation_algorithm) is
 * a method for computing the sum of a list of numbers while correcting
 * for floating-point errors. Traditionally, sums are calculated as many
 * successive additions, each one with its own floating-point roundoff. These
 * losses in precision add up as the number of numbers increases. This alternative
 * algorithm is more accurate than the simple way of calculating sums by simple
 * addition.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @return {number} sum of all input numbers
 * @example
 * sum([1, 2, 3]); // => 6
 */
function sum(x/*: Array<number> */)/*: number */ {

    // like the traditional sum algorithm, we keep a running
    // count of the current sum.
    var sum = 0;

    // but we also keep three extra variables as bookkeeping:
    // most importantly, an error correction value. This will be a very
    // small number that is the opposite of the floating point precision loss.
    var errorCompensation = 0;

    // this will be each number in the list corrected with the compensation value.
    var correctedCurrentValue;

    // and this will be the next sum
    var nextSum;

    for (var i = 0; i < x.length; i++) {
        // first correct the value that we're going to add to the sum
        correctedCurrentValue = x[i] - errorCompensation;

        // compute the next sum. sum is likely a much larger number
        // than correctedCurrentValue, so we'll lose precision here,
        // and measure how much precision is lost in the next step
        nextSum = sum + correctedCurrentValue;

        // we intentionally didn't assign sum immediately, but stored
        // it for now so we can figure out this: is (sum + nextValue) - nextValue
        // not equal to 0? ideally it would be, but in practice it won't:
        // it will be some very small number. that's what we record
        // as errorCompensation.
        errorCompensation = nextSum - sum - correctedCurrentValue;

        // now that we've computed how much we'll correct for in the next
        // loop, start treating the nextSum as the current sum.
        sum = nextSum;
    }

    return sum;
}

module.exports = sum;

},{}],54:[function(require,module,exports){
'use strict';
/* @flow */

var mean = require(23);

/**
 * The sum of deviations to the Nth power.
 * When n=2 it's the sum of squared deviations.
 * When n=3 it's the sum of cubed deviations.
 *
 * @param {Array<number>} x
 * @param {number} n power
 * @returns {number} sum of nth power deviations
 * @example
 * var input = [1, 2, 3];
 * // since the variance of a set is the mean squared
 * // deviations, we can calculate that with sumNthPowerDeviations:
 * var variance = sumNthPowerDeviations(input) / input.length;
 */
function sumNthPowerDeviations(x/*: Array<number> */, n/*: number */)/*:number*/ {
    var meanValue = mean(x),
        sum = 0;

    for (var i = 0; i < x.length; i++) {
        sum += Math.pow(x[i] - meanValue, n);
    }

    return sum;
}

module.exports = sumNthPowerDeviations;

},{"23":23}],55:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The simple [sum](https://en.wikipedia.org/wiki/Summation) of an array
 * is the result of adding all numbers together, starting from zero.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @return {number} sum of all input numbers
 * @example
 * sumSimple([1, 2, 3]); // => 6
 */
function sumSimple(x/*: Array<number> */)/*: number */ {
    var value = 0;
    for (var i = 0; i < x.length; i++) {
        value += x[i];
    }
    return value;
}

module.exports = sumSimple;

},{}],56:[function(require,module,exports){
'use strict';
/* @flow */

var standardDeviation = require(51);
var mean = require(23);

/**
 * This is to compute [a one-sample t-test](https://en.wikipedia.org/wiki/Student%27s_t-test#One-sample_t-test), comparing the mean
 * of a sample to a known value, x.
 *
 * in this case, we're trying to determine whether the
 * population mean is equal to the value that we know, which is `x`
 * here. usually the results here are used to look up a
 * [p-value](http://en.wikipedia.org/wiki/P-value), which, for
 * a certain level of significance, will let you determine that the
 * null hypothesis can or cannot be rejected.
 *
 * @param {Array<number>} sample an array of numbers as input
 * @param {number} x expected vale of the population mean
 * @returns {number} value
 * @example
 * tTest([1, 2, 3, 4, 5, 6], 3.385).toFixed(2); // => '0.16'
 */
function tTest(sample/*: Array<number> */, x/*: number */)/*:number*/ {
    // The mean of the sample
    var sampleMean = mean(sample);

    // The standard deviation of the sample
    var sd = standardDeviation(sample);

    // Square root the length of the sample
    var rootN = Math.sqrt(sample.length);

    // returning the t value
    return (sampleMean - x) / (sd / rootN);
}

module.exports = tTest;

},{"23":23,"51":51}],57:[function(require,module,exports){
'use strict';
/* @flow */

var mean = require(23);
var sampleVariance = require(47);

/**
 * This is to compute [two sample t-test](http://en.wikipedia.org/wiki/Student's_t-test).
 * Tests whether "mean(X)-mean(Y) = difference", (
 * in the most common case, we often have `difference == 0` to test if two samples
 * are likely to be taken from populations with the same mean value) with
 * no prior knowledge on standard deviations of both samples
 * other than the fact that they have the same standard deviation.
 *
 * Usually the results here are used to look up a
 * [p-value](http://en.wikipedia.org/wiki/P-value), which, for
 * a certain level of significance, will let you determine that the
 * null hypothesis can or cannot be rejected.
 *
 * `diff` can be omitted if it equals 0.
 *
 * [This is used to confirm or deny](http://www.monarchlab.org/Lab/Research/Stats/2SampleT.aspx)
 * a null hypothesis that the two populations that have been sampled into
 * `sampleX` and `sampleY` are equal to each other.
 *
 * @param {Array<number>} sampleX a sample as an array of numbers
 * @param {Array<number>} sampleY a sample as an array of numbers
 * @param {number} [difference=0]
 * @returns {number} test result
 * @example
 * ss.tTestTwoSample([1, 2, 3, 4], [3, 4, 5, 6], 0); //= -2.1908902300206643
 */
function tTestTwoSample(
    sampleX/*: Array<number> */,
    sampleY/*: Array<number> */,
    difference/*: number */) {
    var n = sampleX.length,
        m = sampleY.length;

    // If either sample doesn't actually have any values, we can't
    // compute this at all, so we return `null`.
    if (!n || !m) { return null; }

    // default difference (mu) is zero
    if (!difference) {
        difference = 0;
    }

    var meanX = mean(sampleX),
        meanY = mean(sampleY),
        sampleVarianceX = sampleVariance(sampleX),
        sampleVarianceY = sampleVariance(sampleY);

    if (typeof meanX === 'number' &&
        typeof meanY === 'number' &&
        typeof sampleVarianceX === 'number' &&
        typeof sampleVarianceY === 'number') {
        var weightedVariance = ((n - 1) * sampleVarianceX +
            (m - 1) * sampleVarianceY) / (n + m - 2);

        return (meanX - meanY - difference) /
            Math.sqrt(weightedVariance * (1 / n + 1 / m));
    }
}

module.exports = tTestTwoSample;

},{"23":23,"47":47}],58:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * For a sorted input, counting the number of unique values
 * is possible in constant time and constant memory. This is
 * a simple implementation of the algorithm.
 *
 * Values are compared with `===`, so objects and non-primitive objects
 * are not handled in any special way.
 *
 * @param {Array} input an array of primitive values.
 * @returns {number} count of unique values
 * @example
 * uniqueCountSorted([1, 2, 3]); // => 3
 * uniqueCountSorted([1, 1, 1]); // => 1
 */
function uniqueCountSorted(input/*: Array<any>*/)/*: number */ {
    var uniqueValueCount = 0,
        lastSeenValue;
    for (var i = 0; i < input.length; i++) {
        if (i === 0 || input[i] !== lastSeenValue) {
            lastSeenValue = input[i];
            uniqueValueCount++;
        }
    }
    return uniqueValueCount;
}

module.exports = uniqueCountSorted;

},{}],59:[function(require,module,exports){
'use strict';
/* @flow */

var sumNthPowerDeviations = require(54);

/**
 * The [variance](http://en.wikipedia.org/wiki/Variance)
 * is the sum of squared deviations from the mean.
 *
 * This is an implementation of variance, not sample variance:
 * see the `sampleVariance` method if you want a sample measure.
 *
 * @param {Array<number>} x a population
 * @returns {number} variance: a value greater than or equal to zero.
 * zero indicates that all values are identical.
 * @example
 * variance([1, 2, 3, 4, 5, 6]); // => 2.9166666666666665
 */
function variance(x/*: Array<number> */)/*:number*/ {
    // The variance of no numbers is null
    if (x.length === 0) { return NaN; }

    // Find the mean of squared deviations between the
    // mean value and each value.
    return sumNthPowerDeviations(x, 2) / x.length;
}

module.exports = variance;

},{"54":54}],60:[function(require,module,exports){
'use strict';
/* @flow */

/**
 * The [Z-Score, or Standard Score](http://en.wikipedia.org/wiki/Standard_score).
 *
 * The standard score is the number of standard deviations an observation
 * or datum is above or below the mean. Thus, a positive standard score
 * represents a datum above the mean, while a negative standard score
 * represents a datum below the mean. It is a dimensionless quantity
 * obtained by subtracting the population mean from an individual raw
 * score and then dividing the difference by the population standard
 * deviation.
 *
 * The z-score is only defined if one knows the population parameters;
 * if one only has a sample set, then the analogous computation with
 * sample mean and sample standard deviation yields the
 * Student's t-statistic.
 *
 * @param {number} x
 * @param {number} mean
 * @param {number} standardDeviation
 * @return {number} z score
 * @example
 * zScore(78, 80, 5); // => -0.4
 */
function zScore(x/*:number*/, mean/*:number*/, standardDeviation/*:number*/)/*:number*/ {
    return (x - mean) / standardDeviation;
}

module.exports = zScore;

},{}]},{},[1])(1)
});
//# sourceMappingURL=simple-statistics.js.map
;

//***** libs/vendor/jsclass/jsclass-all.js *****//
var JS = (typeof this.JS === 'undefined') ? {} : this.JS;
JS.Date = Date;

(function(factory) {
  var $ = (typeof this.global === 'object') ? this.global : this,
      E = (typeof exports === 'object');

  if (E) {
    exports.JS = exports;
    JS = exports;
  } else {
    $.JS = JS;
  }
  factory($, JS);

})(function(global, exports) {
'use strict';

var Package = function(loader) {
  Package._index(this);

  this._loader    = loader;
  this._names     = new OrderedSet();
  this._deps      = new OrderedSet();
  this._uses      = new OrderedSet();
  this._styles    = new OrderedSet();
  this._observers = {};
  this._events    = {};
};

Package.displayName = 'Package';
Package.toString = function() { return Package.displayName };

Package.log = function(message) {
  if (!exports.debug) return;
  if (typeof window === 'undefined') return;
  if (typeof global.runtime === 'object') runtime.trace(message);
  if (global.console && console.info) console.info(message);
};

var resolve = function(filename) {
  if (/^https?:/.test(filename)) return filename;
  var root = exports.ROOT;
  if (root) filename = (root + '/' + filename).replace(/\/+/g, '/');
  return filename;
};

//================================================================
// Ordered list of unique elements, for storing dependencies

var OrderedSet = function(list) {
  this._members = this.list = [];
  this._index = {};
  if (!list) return;

  for (var i = 0, n = list.length; i < n; i++)
    this.push(list[i]);
};

OrderedSet.prototype.push = function(item) {
  var key   = (item.id !== undefined) ? item.id : item,
      index = this._index;

  if (index.hasOwnProperty(key)) return;
  index[key] = this._members.length;
  this._members.push(item);
};

//================================================================
// Wrapper for deferred values

var Deferred = Package.Deferred = function() {
  this._status    = 'deferred';
  this._value     = null;
  this._callbacks = [];
};

Deferred.prototype.callback = function(callback, context) {
  if (this._status === 'succeeded') callback.call(context, this._value);
  else this._callbacks.push([callback, context]);
};

Deferred.prototype.succeed = function(value) {
  this._status = 'succeeded';
  this._value  = value;
  var callback;
  while (callback = this._callbacks.shift())
    callback[0].call(callback[1], value);
};

//================================================================
// Environment settings

Package.ENV = exports.ENV = global;

Package.onerror = function(e) { throw e };

Package._throw = function(message) {
  Package.onerror(new Error(message));
};


//================================================================
// Configuration methods, called by the DSL

var instance = Package.prototype,

    methods = [['requires', '_deps'],
               ['uses',     '_uses']],

    i = methods.length;

while (i--)
  (function(pair) {
    var method = pair[0], list = pair[1];
    instance[method] = function() {
      var n = arguments.length, i;
      for (i = 0; i < n; i++) this[list].push(arguments[i]);
      return this;
    };
  })(methods[i]);

instance.provides = function() {
  var n = arguments.length, i;
  for (i = 0; i < n; i++) {
    this._names.push(arguments[i]);
    Package._getFromCache(arguments[i]).pkg = this;
  }
  return this;
};

instance.styling = function() {
  for (var i = 0, n = arguments.length; i < n; i++)
    this._styles.push(resolve(arguments[i]));
};

instance.setup = function(block) {
  this._onload = block;
  return this;
};

//================================================================
// Event dispatchers, for communication between packages

instance._on = function(eventType, block, context) {
  if (this._events[eventType]) return block.call(context);
  var list = this._observers[eventType] = this._observers[eventType] || [];
  list.push([block, context]);
  this._load();
};

instance._fire = function(eventType) {
  if (this._events[eventType]) return false;
  this._events[eventType] = true;

  var list = this._observers[eventType];
  if (!list) return true;
  delete this._observers[eventType];

  for (var i = 0, n = list.length; i < n; i++)
    list[i][0].call(list[i][1]);

  return true;
};

//================================================================
// Loading frontend and other miscellany

instance._isLoaded = function(withExceptions) {
  if (!withExceptions && this.__isLoaded !== undefined) return this.__isLoaded;

  var names = this._names.list,
      i     = names.length,
      name, object;

  while (i--) { name = names[i];
    object = Package._getObject(name, this._exports);
    if (object !== undefined) continue;
    if (withExceptions)
      return Package._throw('Expected package at ' + this._loader + ' to define ' + name);
    else
      return this.__isLoaded = false;
  }
  return this.__isLoaded = true;
};

instance._load = function() {
  if (!this._fire('request')) return;
  if (!this._isLoaded()) this._prefetch();

  var allDeps = this._deps.list.concat(this._uses.list),
      source  = this._source || [],
      n       = (this._loader || {}).length,
      self    = this;

  Package.when({load: allDeps});

  Package.when({complete: this._deps.list}, function() {
    Package.when({complete: allDeps, load: [this]}, function() {
      this._fire('complete');
    }, this);

    var loadNext = function(exports) {
      if (n === 0) return fireOnLoad(exports);
      n -= 1;
      var index = self._loader.length - n - 1;
      Package.loader.loadFile(self._loader[index], loadNext, source[index]);
    };

    var fireOnLoad = function(exports) {
      self._exports = exports;
      if (self._onload) self._onload();
      self._isLoaded(true);
      self._fire('load');
    };

    if (this._isLoaded()) {
      this._fire('download');
      return this._fire('load');
    }

    if (this._loader === undefined)
      return Package._throw('No load path found for ' + this._names.list[0]);

    if (typeof this._loader === 'function')
      this._loader(fireOnLoad);
    else
      loadNext();

    if (!Package.loader.loadStyle) return;

    var styles = this._styles.list,
        i      = styles.length;

    while (i--) Package.loader.loadStyle(styles[i]);

    this._fire('download');
  }, this);
};

instance._prefetch = function() {
  if (this._source || !(this._loader instanceof Array) || !Package.loader.fetch)
    return;

  this._source = [];

  for (var i = 0, n = this._loader.length; i < n; i++)
    this._source[i] = Package.loader.fetch(this._loader[i]);
};

instance.toString = function() {
  return 'Package:' + this._names.list.join(',');
};

//================================================================
// Class-level event API, handles group listeners

Package.when = function(eventTable, block, context) {
  var eventList = [], objects = {}, event, packages, i;
  for (event in eventTable) {
    if (!eventTable.hasOwnProperty(event)) continue;
    objects[event] = [];
    packages = new OrderedSet(eventTable[event]);
    i = packages.list.length;
    while (i--) eventList.push([event, packages.list[i], i]);
  }

  var waiting = i = eventList.length;
  if (waiting === 0) return block && block.call(context, objects);

  while (i--)
    (function(event) {
      var pkg = Package._getByName(event[1]);
      pkg._on(event[0], function() {
        objects[event[0]][event[2]] = Package._getObject(event[1], pkg._exports);
        waiting -= 1;
        if (waiting === 0 && block) block.call(context, objects);
      });
    })(eventList[i]);
};

//================================================================
// Indexes for fast lookup by path and name, and assigning IDs

var globalPackage = (global.JS || {}).Package || {};

Package._autoIncrement = globalPackage._autoIncrement || 1;
Package._indexByPath   = globalPackage._indexByPath   || {};
Package._indexByName   = globalPackage._indexByName   || {};
Package._autoloaders   = globalPackage._autoloaders   || [];

Package._index = function(pkg) {
  pkg.id = this._autoIncrement;
  this._autoIncrement += 1;
};

Package._getByPath = function(loader) {
  var path = loader.toString(),
      pkg  = this._indexByPath[path];

  if (pkg) return pkg;

  if (typeof loader === 'string')
    loader = [].slice.call(arguments);

  pkg = this._indexByPath[path] = new this(loader);
  return pkg;
};

Package._getByName = function(name) {
  if (typeof name !== 'string') return name;
  var cached = this._getFromCache(name);
  if (cached.pkg) return cached.pkg;

  var autoloaded = this._manufacture(name);
  if (autoloaded) return autoloaded;

  var placeholder = new this();
  placeholder.provides(name);
  return placeholder;
};

Package.remove = function(name) {
  var pkg = this._getByName(name);
  delete this._indexByName[name];
  delete this._indexByPath[pkg._loader];
};

//================================================================
// Auotloading API, generates packages from naming patterns

Package._autoload = function(pattern, options) {
  this._autoloaders.push([pattern, options]);
};

Package._manufacture = function(name) {
  var autoloaders = this._autoloaders,
      n = autoloaders.length,
      i, j, autoloader, path;

  for (i = 0; i < n; i++) {
    autoloader = autoloaders[i];
    if (!autoloader[0].test(name)) continue;

    path = autoloader[1].from;
    if (typeof path === 'string') path = this._convertNameToPath(path);

    var pkg = new this([path(name)]);
    pkg.provides(name);

    if (path = autoloader[1].require) {
      path = [].concat(path);
      j = path.length;
      while (j--) pkg.requires(name.replace(autoloader[0], path[j]));
    }

    return pkg;
  }
  return null;
};

Package._convertNameToPath = function(from) {
  return function(name) {
    return from.replace(/\/?$/, '/') +
           name.replace(/([a-z])([A-Z])/g, function(m,a,b) { return a + '_' + b })
               .replace(/\./g, '/')
               .toLowerCase() + '.js';
  };
};

//================================================================
// Cache for named packages and runtime objects

Package._getFromCache = function(name) {
  return this._indexByName[name] = this._indexByName[name] || {};
};

Package._getObject = function(name, rootObject) {
  if (typeof name !== 'string') return undefined;

  var cached = rootObject ? {} : this._getFromCache(name);
  if (cached.obj !== undefined) return cached.obj;

  var object = rootObject || this.ENV,
      parts  = name.split('.'), part;

  while (part = parts.shift()) object = object && object[part];

  if (rootObject && object === undefined)
    return this._getObject(name);

  return cached.obj = object;
};

Package.CommonJSLoader = {
  usable: function() {
    return typeof require === 'function' &&
           typeof exports === 'object';
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    var file, module;

    if (typeof process !== 'undefined') {
      module = path.replace(/\.[^\.]+$/g, '');
      file   = require('path').resolve(module);
    }
    else if (typeof phantom !== 'undefined') {
      file = phantom.libraryPath.replace(/\/$/, '') + '/' +
             path.replace(/^\//, '');
    }

    this._currentPath = file + '.js';
    var module = require(file);
    fireCallbacks(module);

    return module;
  }
};

Package.BrowserLoader = {
  HOST_REGEX: /^(https?\:)?\/\/[^\/]+/i,

  usable: function() {
    return !!Package._getObject('window.document.getElementsByTagName') &&
           typeof phantom === 'undefined';
  },

  __FILE__: function() {
    var scripts = document.getElementsByTagName('script'),
        src     = scripts[scripts.length - 1].src,
        url     = window.location.href;

    if (/^\w+\:\/+/.test(src)) return src;
    if (/^\//.test(src)) return window.location.origin + src;
    return url.replace(/[^\/]*$/g, '') + src;
  },

  cacheBust: function(path) {
    if (exports.cache !== false) return path;
    var token = new JS.Date().getTime();
    return path + (/\?/.test(path) ? '&' : '?') + token;
  },

  fetch: function(path) {
    var originalPath = path;
    path = this.cacheBust(path);

    this.HOST = this.HOST || this.HOST_REGEX.exec(window.location.href);
    var host = this.HOST_REGEX.exec(path);

    if (!this.HOST || (host && host[0] !== this.HOST[0])) return null;
    Package.log('[FETCH] ' + path);

    var source = new Package.Deferred(),
        self   = this,
        xhr    = window.ActiveXObject
               ? new ActiveXObject('Microsoft.XMLHTTP')
               : new XMLHttpRequest();

    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      xhr.onreadystatechange = self._K;
      source.succeed(xhr.responseText + '\n//@ sourceURL=' + originalPath);
      xhr = null;
    };
    xhr.send(null);
    return source;
  },

  loadFile: function(path, fireCallbacks, source) {
    if (!source) path = this.cacheBust(path);

    var self   = this,
        head   = document.getElementsByTagName('head')[0],
        script = document.createElement('script');

    script.type = 'text/javascript';

    if (source)
      return source.callback(function(code) {
        Package.log('[EXEC]  ' + path);
        var execute = new Function('code', 'eval(code)');
        execute(code);
        fireCallbacks();
      });

    Package.log('[LOAD] ' + path);
    script.src = path;

    script.onload = script.onreadystatechange = function() {
      var state = script.readyState, status = script.status;
      if ( !state || state === 'loaded' || state === 'complete' ||
           (state === 4 && status === 200) ) {
        fireCallbacks();
        script.onload = script.onreadystatechange = self._K;
        head   = null;
        script = null;
      }
    };
    head.appendChild(script);
  },

  loadStyle: function(path) {
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = this.cacheBust(path);

    document.getElementsByTagName('head')[0].appendChild(link);
  },

  _K: function() {}
};

Package.RhinoLoader = {
  usable: function() {
    return typeof java === 'object' &&
           typeof require === 'function';
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    var cwd    = java.lang.System.getProperty('user.dir'),
        module = path.replace(/\.[^\.]+$/g, '');

    var requirePath = new java.io.File(cwd, module).toString();
    this._currentPath = requirePath + '.js';
    var module = require(requirePath);
    fireCallbacks(module);

    return module;
  }
};

Package.ServerLoader = {
  usable: function() {
    return typeof Package._getObject('load') === 'function' &&
           typeof Package._getObject('version') === 'function';
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    this._currentPath = path;
    load(path);
    fireCallbacks();
  }
};

Package.WshLoader = {
  usable: function() {
    return !!Package._getObject('ActiveXObject') &&
           !!Package._getObject('WScript');
  },

  __FILE__: function() {
    return this._currentPath;
  },

  loadFile: function(path, fireCallbacks) {
    this._currentPath = path;
    var fso = new ActiveXObject('Scripting.FileSystemObject'), file, runner;
    try {
      file   = fso.OpenTextFile(path);
      runner = function() { eval(file.ReadAll()) };
      runner();
      fireCallbacks();
    } finally {
      try { if (file) file.Close() } catch (e) {}
    }
  }
};

Package.XULRunnerLoader = {
  jsloader:   '@mozilla.org/moz/jssubscript-loader;1',
  cssservice: '@mozilla.org/content/style-sheet-service;1',
  ioservice:  '@mozilla.org/network/io-service;1',

  usable: function() {
    try {
      var CC = (Components || {}).classes;
      return !!(CC && CC[this.jsloader] && CC[this.jsloader].getService);
    } catch(e) {
      return false;
    }
  },

  setup: function() {
    var Cc = Components.classes, Ci = Components.interfaces;
    this.ssl = Cc[this.jsloader].getService(Ci.mozIJSSubScriptLoader);
    this.sss = Cc[this.cssservice].getService(Ci.nsIStyleSheetService);
    this.ios = Cc[this.ioservice].getService(Ci.nsIIOService);
  },

  loadFile: function(path, fireCallbacks) {
    Package.log('[LOAD] ' + path);

    this.ssl.loadSubScript(path);
    fireCallbacks();
  },

  loadStyle: function(path) {
    var uri = this.ios.newURI(path, null, null);
    this.sss.loadAndRegisterSheet(uri, this.sss.USER_SHEET);
  }
};

var candidates = [  Package.XULRunnerLoader,
                    Package.RhinoLoader,
                    Package.BrowserLoader,
                    Package.CommonJSLoader,
                    Package.ServerLoader,
                    Package.WshLoader ],

    n = candidates.length,
    i, candidate;

for (i = 0; i < n; i++) {
  candidate = candidates[i];
  if (candidate.usable()) {
    Package.loader = candidate;
    if (candidate.setup) candidate.setup();
    break;
  }
}

var DSL = {
  __FILE__: function() {
    return Package.loader.__FILE__();
  },

  pkg: function(name, path) {
    var pkg = path
        ? Package._getByPath(path)
        : Package._getByName(name);
    pkg.provides(name);
    return pkg;
  },

  file: function(filename) {
    var files = [], i = arguments.length;
    while (i--) files[i] = resolve(arguments[i]);
    return Package._getByPath.apply(Package, files);
  },

  load: function(path, fireCallbacks) {
    Package.loader.loadFile(path, fireCallbacks);
  },

  autoload: function(pattern, options) {
    Package._autoload(pattern, options);
  }
};

DSL.files  = DSL.file;
DSL.loader = DSL.file;

var packages = function(declaration) {
  declaration.call(DSL);
};

var parseLoadArgs = function(args) {
 var files = [], i = 0;

  while (typeof args[i] === 'string'){
    files.push(args[i]);
    i += 1;
  }

  return {files: files, callback: args[i], context: args[i+1]};
};

exports.load = function(path, callback) {
  var args = parseLoadArgs(arguments),
      n    = args.files.length;

  var loadNext = function(index) {
    if (index === n) return args.callback.call(args.context);
    Package.loader.loadFile(args.files[index], function() {
      loadNext(index + 1);
    });
  };
  loadNext(0);
};

exports.require = function() {
  var args = parseLoadArgs(arguments);

  Package.when({complete: args.files}, function(objects) {
    if (!args.callback) return;
    args.callback.apply(args.context, objects && objects.complete);
  });

  return this;
};

exports.Package  = Package;
exports.Packages = exports.packages = packages;
exports.DSL      = DSL;
});

var JS = (typeof this.JS === 'undefined') ? {} : this.JS;

(function(factory) {
  var $ = (typeof this.global === 'object') ? this.global : this,
      E = (typeof exports === 'object');

  if (E) {
    exports.JS = exports;
    JS = exports;
  } else {
    $.JS = JS;
  }
  factory($, JS);

})(function(global, exports) {
'use strict';

var JS = {ENV: global};

JS.END_WITHOUT_DOT = /([^\.])$/;

JS.array = function(enumerable) {
  var array = [], i = enumerable.length;
  while (i--) array[i] = enumerable[i];
  return array;
};

JS.bind = function(method, object) {
  return function() {
    return method.apply(object, arguments);
  };
};

JS.Date = JS.ENV.Date;

JS.extend = function(destination, source, overwrite) {
  if (!destination || !source) return destination;
  for (var field in source) {
    if (destination[field] === source[field]) continue;
    if (overwrite === false && destination.hasOwnProperty(field)) continue;
    destination[field] = source[field];
  }
  return destination;
};

JS.indexOf = function(list, item) {
  if (list.indexOf) return list.indexOf(item);
  var i = list.length;
  while (i--) {
    if (list[i] === item) return i;
  }
  return -1;
};

JS.isType = function(object, type) {
  if (typeof type === 'string')
    return typeof object === type;

  if (object === null || object === undefined)
    return false;

  return (typeof type === 'function' && object instanceof type) ||
         (object.isA && object.isA(type)) ||
         object.constructor === type;
};

JS.makeBridge = function(parent) {
  var bridge = function() {};
  bridge.prototype = parent.prototype;
  return new bridge();
};

JS.makeClass = function(parent) {
  parent = parent || Object;

  var constructor = function() {
    return this.initialize
         ? this.initialize.apply(this, arguments) || this
         : this;
  };
  constructor.prototype = JS.makeBridge(parent);

  constructor.superclass = parent;

  constructor.subclasses = [];
  if (parent.subclasses) parent.subclasses.push(constructor);

  return constructor;
};

JS.match = function(category, object) {
  if (object === undefined) return false;
  return typeof category.test === 'function'
       ? category.test(object)
       : category.match(object);
};

JS.Method = JS.makeClass();

JS.extend(JS.Method.prototype, {
  initialize: function(module, name, callable) {
    this.module   = module;
    this.name     = name;
    this.callable = callable;

    this._words = {};
    if (typeof callable !== 'function') return;

    this.arity  = callable.length;

    var matches = callable.toString().match(/\b[a-z\_\$][a-z0-9\_\$]*\b/ig),
        i       = matches.length;

    while (i--) this._words[matches[i]] = true;
  },

  setName: function(name) {
    this.callable.displayName =
    this.displayName = name;
  },

  contains: function(word) {
    return this._words.hasOwnProperty(word);
  },

  call: function() {
    return this.callable.call.apply(this.callable, arguments);
  },

  apply: function(receiver, args) {
    return this.callable.apply(receiver, args);
  },

  compile: function(environment) {
    var method     = this,
        trace      = method.module.__trace__ || environment.__trace__,
        callable   = method.callable,
        words      = method._words,
        allWords   = JS.Method._keywords,
        i          = allWords.length,
        keywords   = [],
        keyword;

    while  (i--) {
      keyword = allWords[i];
      if (words[keyword.name]) keywords.push(keyword);
    }
    if (keywords.length === 0 && !trace) return callable;

    var compiled = function() {
      var N = keywords.length, j = N, previous = {}, keyword, existing, kwd;

      while (j--) {
        keyword  = keywords[j];
        existing = this[keyword.name];

        if (existing && !existing.__kwd__) continue;

        previous[keyword.name] = {
          _value: existing,
          _own:   this.hasOwnProperty(keyword.name)
        };
        kwd = keyword.filter(method, environment, this, arguments);
        if (kwd) kwd.__kwd__ = true;
        this[keyword.name] = kwd;
      }
      var returnValue = callable.apply(this, arguments),
          j = N;

      while (j--) {
        keyword = keywords[j];
        if (!previous[keyword.name]) continue;
        if (previous[keyword.name]._own)
          this[keyword.name] = previous[keyword.name]._value;
        else
          delete this[keyword.name];
      }
      return returnValue;
    };

    var StackTrace = trace && (exports.StackTrace || require('./stack_trace').StackTrace);
    if (trace) return StackTrace.wrap(compiled, method, environment);
    return compiled;
  },

  toString: function() {
    var name = this.displayName || (this.module.toString() + '#' + this.name);
    return '#<Method:' + name + '>';
  }
});

JS.Method.create = function(module, name, callable) {
  if (callable && callable.__inc__ && callable.__fns__)
    return callable;

  var method = (typeof callable !== 'function')
             ? callable
             : new this(module, name, callable);

  this.notify(method);
  return method;
};

JS.Method.compile = function(method, environment) {
  return (method instanceof this)
      ? method.compile(environment)
      : method;
};

JS.Method.__listeners__ = [];

JS.Method.added = function(block, context) {
  this.__listeners__.push([block, context]);
};

JS.Method.notify = function(method) {
  var listeners = this.__listeners__,
      i = listeners.length,
      listener;

  while (i--) {
    listener = listeners[i];
    listener[0].call(listener[1], method);
  }
};

JS.Method._keywords = [];

JS.Method.keyword = function(name, filter) {
  this._keywords.push({name: name, filter: filter});
};

JS.Method.tracing = function(classes, block, context) {
  var pkg = exports.require ? exports : require('./loader');
  pkg.require('JS.StackTrace', function(StackTrace) {
    var logger = StackTrace.logger,
        active = logger.active;

    classes = [].concat(classes);
    this.trace(classes);
    logger.active = true;
    block.call(context);

    this.untrace(classes);
    logger.active = active;
  }, this);
};

JS.Method.trace = function(classes) {
  var i = classes.length;
  while (i--) {
    classes[i].__trace__ = true;
    classes[i].resolve();
  }
};

JS.Method.untrace = function(classes) {
  var i = classes.length;
  while (i--) {
    classes[i].__trace__ = false;
    classes[i].resolve();
  }
};

JS.Module = JS.makeClass();
JS.Module.__queue__ = [];

JS.extend(JS.Module.prototype, {
  initialize: function(name, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[1];
      methods = arguments[0];
      name    = undefined;
    }
    options = options || {};

    this.__inc__ = [];
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = options._target;
    this.__anc__ = null;
    this.__mct__ = {};

    this.setName(name);
    this.include(methods, {_resolve: false});

    if (JS.Module.__queue__)
      JS.Module.__queue__.push(this);
  },

  setName: function(name) {
    this.displayName = name || '';

    for (var field in this.__fns__)
      this.__name__(field);

    if (name && this.__meta__)
      this.__meta__.setName(name + '.');
  },

  __name__: function(name) {
    if (!this.displayName) return;

    var object = this.__fns__[name];
    if (!object) return;

    name = this.displayName.replace(JS.END_WITHOUT_DOT, '$1#') + name;
    if (typeof object.setName === 'function') return object.setName(name);
    if (typeof object === 'function') object.displayName = name;
  },

  define: function(name, callable, options) {
    var method  = JS.Method.create(this, name, callable),
        resolve = (options || {})._resolve;

    this.__fns__[name] = method;
    this.__name__(name);
    if (resolve !== false) this.resolve();
  },

  include: function(module, options) {
    if (!module) return this;

    var options = options || {},
        resolve = options._resolve !== false,
        extend  = module.extend,
        include = module.include,
        extended, field, value, mixins, i, n;

    if (module.__fns__ && module.__inc__) {
      this.__inc__.push(module);
      if ((module.__dep__ || {}).push) module.__dep__.push(this);

      if (extended = options._extended) {
        if (typeof module.extended === 'function')
          module.extended(extended);
      }
      else {
        if (typeof module.included === 'function')
          module.included(this);
      }
    }
    else {
      if (this.shouldIgnore('extend', extend)) {
        mixins = [].concat(extend);
        for (i = 0, n = mixins.length; i < n; i++)
          this.extend(mixins[i]);
      }
      if (this.shouldIgnore('include', include)) {
        mixins = [].concat(include);
        for (i = 0, n = mixins.length; i < n; i++)
          this.include(mixins[i], {_resolve: false});
      }
      for (field in module) {
        if (!module.hasOwnProperty(field)) continue;
        value = module[field];
        if (this.shouldIgnore(field, value)) continue;
        this.define(field, value, {_resolve: false});
      }
      if (module.hasOwnProperty('toString'))
        this.define('toString', module.toString, {_resolve: false});
    }

    if (resolve) this.resolve();
    return this;
  },

  alias: function(aliases) {
    for (var method in aliases) {
      if (!aliases.hasOwnProperty(method)) continue;
      this.define(method, this.instanceMethod(aliases[method]), {_resolve: false});
    }
    this.resolve();
  },

  resolve: function(host) {
    var host   = host || this,
        target = host.__tgt__,
        inc    = this.__inc__,
        fns    = this.__fns__,
        i, n, key, compiled;

    if (host === this) {
      this.__anc__ = null;
      this.__mct__ = {};
      i = this.__dep__.length;
      while (i--) this.__dep__[i].resolve();
    }

    if (!target) return;

    for (i = 0, n = inc.length; i < n; i++)
      inc[i].resolve(host);

    for (key in fns) {
      compiled = JS.Method.compile(fns[key], host);
      if (target[key] !== compiled) target[key] = compiled;
    }
    if (fns.hasOwnProperty('toString'))
      target.toString = JS.Method.compile(fns.toString, host);
  },

  shouldIgnore: function(field, value) {
    return (field === 'extend' || field === 'include') &&
           (typeof value !== 'function' ||
             (value.__fns__ && value.__inc__));
  },

  ancestors: function(list) {
    var cachable = !list,
        list     = list || [],
        inc      = this.__inc__;

    if (cachable && this.__anc__) return this.__anc__.slice();

    for (var i = 0, n = inc.length; i < n; i++)
      inc[i].ancestors(list);

    if (JS.indexOf(list, this) < 0)
      list.push(this);

    if (cachable) this.__anc__ = list.slice();
    return list;
  },

  lookup: function(name) {
    var cached = this.__mct__[name];
    if (cached && cached.slice) return cached.slice();

    var ancestors = this.ancestors(),
        methods   = [],
        fns;

    for (var i = 0, n = ancestors.length; i < n; i++) {
      fns = ancestors[i].__fns__;
      if (fns.hasOwnProperty(name)) methods.push(fns[name]);
    }
    this.__mct__[name] = methods.slice();
    return methods;
  },

  includes: function(module) {
    if (module === this) return true;

    var inc  = this.__inc__;

    for (var i = 0, n = inc.length; i < n; i++) {
      if (inc[i].includes(module))
        return true;
    }
    return false;
  },

  instanceMethod: function(name) {
    return this.lookup(name).pop();
  },

  instanceMethods: function(recursive, list) {
    var methods = list || [],
        fns     = this.__fns__,
        field;

    for (field in fns) {
      if (!JS.isType(this.__fns__[field], JS.Method)) continue;
      if (JS.indexOf(methods, field) >= 0) continue;
      methods.push(field);
    }

    if (recursive !== false) {
      var ancestors = this.ancestors(), i = ancestors.length;
      while (i--) ancestors[i].instanceMethods(false, methods);
    }
    return methods;
  },

  match: function(object) {
    return object && object.isA && object.isA(this);
  },

  toString: function() {
    return this.displayName;
  }
});

JS.Kernel = new JS.Module('Kernel', {
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    var name = this.toString() + '.';
    this.__meta__ = new JS.Module(name, null, {_target: this});
    return this.__meta__.include(this.klass, {_resolve: false});
  },

  equals: function(other) {
    return this === other;
  },

  extend: function(module, options) {
    var resolve = (options || {})._resolve;
    this.__eigen__().include(module, {_extended: this, _resolve: resolve});
    return this;
  },

  hash: function() {
    return JS.Kernel.hashFor(this);
  },

  isA: function(module) {
    return (typeof module === 'function' && this instanceof module) ||
           this.__eigen__().includes(module);
  },

  method: function(name) {
    var cache = this.__mct__ = this.__mct__ || {},
        value = cache[name],
        field = this[name];

    if (typeof field !== 'function') return field;
    if (value && field === value._value) return value._bound;

    var bound = JS.bind(field, this);
    cache[name] = {_value: field, _bound: bound};
    return bound;
  },

  methods: function() {
    return this.__eigen__().instanceMethods();
  },

  tap: function(block, context) {
    block.call(context, this);
    return this;
  },

  toString: function() {
    if (this.displayName) return this.displayName;
    var name = this.klass.displayName || this.klass.toString();
    return '#<' + name + ':' + this.hash() + '>';
  }
});

(function() {
  var id = 1;

  JS.Kernel.hashFor = function(object) {
    if (object.__hash__ !== undefined) return object.__hash__;
    object.__hash__ = (new JS.Date().getTime() + id).toString(16);
    id += 1;
    return object.__hash__;
  };
})();

JS.Class = JS.makeClass(JS.Module);

JS.extend(JS.Class.prototype, {
  initialize: function(name, parent, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[2];
      methods = arguments[1];
      parent  = arguments[0];
      name    = undefined;
    }
    if (typeof parent !== 'function') {
      options = methods;
      methods = parent;
      parent  = Object;
    }
    JS.Module.prototype.initialize.call(this, name);
    options = options || {};

    var klass = JS.makeClass(parent);
    JS.extend(klass, this);

    klass.prototype.constructor =
    klass.prototype.klass = klass;

    klass.__eigen__().include(parent.__meta__, {_resolve: options._resolve});
    klass.setName(name);

    klass.__tgt__ = klass.prototype;

    var parentModule = (parent === Object)
                     ? {}
                     : (parent.__fns__ ? parent : new JS.Module(parent.prototype, {_resolve: false}));

    klass.include(JS.Kernel,    {_resolve: false})
         .include(parentModule, {_resolve: false})
         .include(methods,      {_resolve: false});

    if (options._resolve !== false) klass.resolve();

    if (typeof parent.inherited === 'function')
      parent.inherited(klass);

    return klass;
  }
});

(function() {
  var methodsFromPrototype = function(klass) {
    var methods = {},
        proto   = klass.prototype;

    for (var field in proto) {
      if (!proto.hasOwnProperty(field)) continue;
      methods[field] = JS.Method.create(klass, field, proto[field]);
    }
    return methods;
  };

  var classify = function(name, parentName) {
    var klass  = JS[name],
        parent = JS[parentName];

    klass.__inc__ = [];
    klass.__dep__ = [];
    klass.__fns__ = methodsFromPrototype(klass);
    klass.__tgt__ = klass.prototype;

    klass.prototype.constructor =
    klass.prototype.klass = klass;

    JS.extend(klass, JS.Class.prototype);
    klass.include(parent || JS.Kernel);
    klass.setName(name);

    klass.constructor = klass.klass = JS.Class;
  };

  classify('Method');
  classify('Module');
  classify('Class', 'Module');

  var eigen = JS.Kernel.instanceMethod('__eigen__');

  eigen.call(JS.Method).resolve();
  eigen.call(JS.Module).resolve();
  eigen.call(JS.Class).include(JS.Module.__meta__);
})();

JS.NotImplementedError = new JS.Class('NotImplementedError', Error);

JS.Method.keyword('callSuper', function(method, env, receiver, args) {
  var methods    = env.lookup(method.name),
      stackIndex = methods.length - 1,
      params     = JS.array(args);

  if (stackIndex === 0) return undefined;

  var _super = function() {
    var i = arguments.length;
    while (i--) params[i] = arguments[i];

    stackIndex -= 1;
    if (stackIndex === 0) delete receiver.callSuper;
    var returnValue = methods[stackIndex].apply(receiver, params);
    receiver.callSuper = _super;
    stackIndex += 1;

    return returnValue;
  };

  return _super;
});

JS.Method.keyword('blockGiven', function(method, env, receiver, args) {
  var block = Array.prototype.slice.call(args, method.arity),
      hasBlock = (typeof block[0] === 'function');

  return function() { return hasBlock };
});

JS.Method.keyword('yieldWith', function(method, env, receiver, args) {
  var block = Array.prototype.slice.call(args, method.arity);

  return function() {
    if (typeof block[0] !== 'function') return;
    return block[0].apply(block[1] || null, arguments);
  };
});

JS.Interface = new JS.Class('Interface', {
  initialize: function(methods) {
    this.test = function(object, returnName) {
      var n = methods.length;
      while (n--) {
        if (typeof object[methods[n]] !== 'function')
          return returnName ? methods[n] : false;
      }
      return true;
    };
  },

  extend: {
    ensure: function() {
      var args = JS.array(arguments), object = args.shift(), face, result;
      while (face = args.shift()) {
        result = face.test(object, true);
        if (result !== true) throw new Error('object does not implement ' + result + '()');
      }
    }
  }
});

JS.Singleton = new JS.Class('Singleton', {
  initialize: function(name, parent, methods) {
    return new (new JS.Class(name, parent, methods));
  }
});

JS.extend(exports, JS);
if (global.JS) JS.extend(global.JS, JS);
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Enumerable = new JS.Module('Enumerable', {
  extend: {
    ALL_EQUAL: {},

    forEach: function(block, context) {
      if (!block) return new Enumerator(this, 'forEach');
      for (var i = 0; i < this.length; i++)
        block.call(context, this[i]);
      return this;
    },

    isComparable: function(list) {
      return list.all(function(item) { return typeof item.compareTo === 'function' });
    },

    areEqual: function(expected, actual) {
      var result;

      if (expected === actual)
        return true;

      if (expected && typeof expected.equals === 'function')
        return expected.equals(actual);

      if (expected instanceof Function)
        return expected === actual;

      if (expected instanceof Array) {
        if (!(actual instanceof Array)) return false;
        for (var i = 0, n = expected.length; i < n; i++) {
          result = this.areEqual(expected[i], actual[i]);
          if (result === this.ALL_EQUAL) return true;
          if (!result) return false;
        }
        if (expected.length !== actual.length) return false;
        return true;
      }

      if (expected instanceof Date) {
        if (!(actual instanceof Date)) return false;
        if (expected.getTime() !== actual.getTime()) return false;
        return true;
      }

      if (expected instanceof Object) {
        if (!(actual instanceof Object)) return false;
        if (this.objectSize(expected) !== this.objectSize(actual)) return false;
        for (var key in expected) {
          if (!this.areEqual(expected[key], actual[key]))
            return false;
        }
        return true;
      }

      return false;
    },

    objectKeys: function(object, includeProto) {
      var keys = [];
      for (var key in object) {
        if (object.hasOwnProperty(key) || includeProto !== false)
          keys.push(key);
      }
      return keys;
    },

    objectSize: function(object) {
      return this.objectKeys(object).length;
    },

    Collection: new JS.Class({
      initialize: function(array) {
        this.length = 0;
        if (array) Enumerable.forEach.call(array, this.push, this);
      },

      push: function(item) {
        Array.prototype.push.call(this, item);
      },

      clear: function() {
        var i = this.length;
        while (i--) delete this[i];
        this.length = 0;
      }
    })
  },

  all: function(block, context) {
    block = Enumerable.toFn(block);
    var truth = true;
    this.forEach(function(item) {
      truth = truth && (block ? block.apply(context, arguments) : item);
    });
    return !!truth;
  },

  any: function(block, context) {
    block = Enumerable.toFn(block);
    var truth = false;
    this.forEach(function(item) {
      truth = truth || (block ? block.apply(context, arguments) : item);
    });
    return !!truth;
  },

  chunk: function(block, context) {
    if (!block) return this.enumFor('chunk');

    var result  = [],
        value   = null,
        started = false;

    this.forEach(function(item) {
      var v = block.apply(context, arguments);
      if (started) {
        if (Enumerable.areEqual(value, v))
          result[result.length - 1][1].push(item);
        else
          result.push([v, [item]]);
      } else {
        result.push([v, [item]]);
        started = true;
      }
      value = v;
    });
    return result;
  },

  count: function(block, context) {
    if (typeof this.size === 'function') return this.size();
    var count = 0, object = block;

    if (block && typeof block !== 'function')
      block = function(x) { return Enumerable.areEqual(x, object) };

    this.forEach(function() {
      if (!block || block.apply(context, arguments))
        count += 1;
    });
    return count;
  },

  cycle: function(n, block, context) {
    if (!block) return this.enumFor('cycle', n);
    block = Enumerable.toFn(block);
    while (n--) this.forEach(block, context);
  },

  drop: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i >= n) entries.push(item);
    });
    return entries;
  },

  dropWhile: function(block, context) {
    if (!block) return this.enumFor('dropWhile');
    block = Enumerable.toFn(block);

    var entries = [],
        drop    = true;

    this.forEach(function(item) {
      if (drop) drop = drop && block.apply(context, arguments);
      if (!drop) entries.push(item);
    });
    return entries;
  },

  forEachCons: function(n, block, context) {
    if (!block) return this.enumFor('forEachCons', n);
    block = Enumerable.toFn(block);

    var entries = this.toArray(),
        size    = entries.length,
        limit   = size - n,
        i;

    for (i = 0; i <= limit; i++)
      block.call(context, entries.slice(i, i+n));

    return this;
  },

  forEachSlice: function(n, block, context) {
    if (!block) return this.enumFor('forEachSlice', n);
    block = Enumerable.toFn(block);

    var entries = this.toArray(),
        size    = entries.length,
        m       = Math.ceil(size/n),
        i;

    for (i = 0; i < m; i++)
      block.call(context, entries.slice(i*n, (i+1)*n));

    return this;
  },

  forEachWithIndex: function(offset, block, context) {
    if (typeof offset === 'function') {
      context = block;
      block   = offset;
      offset  = 0;
    }
    offset = offset || 0;

    if (!block) return this.enumFor('forEachWithIndex', offset);
    block = Enumerable.toFn(block);

    return this.forEach(function(item) {
      var result = block.call(context, item, offset);
      offset += 1;
      return result;
    });
  },

  forEachWithObject: function(object, block, context) {
    if (!block) return this.enumFor('forEachWithObject', object);
    block = Enumerable.toFn(block);

    this.forEach(function() {
      var args = [object].concat(JS.array(arguments));
      block.apply(context, args);
    });
    return object;
  },

  find: function(block, context) {
    if (!block) return this.enumFor('find');
    block = Enumerable.toFn(block);

    var needle = {}, K = needle;
    this.forEach(function(item) {
      if (needle !== K) return;
      needle = block.apply(context, arguments) ? item : needle;
    });
    return needle === K ? null : needle;
  },

  findIndex: function(needle, context) {
    if (needle === undefined) return this.enumFor('findIndex');

    var index = null,
        block = (typeof needle === 'function');

    this.forEachWithIndex(function(item, i) {
      if (index !== null) return;
      if (Enumerable.areEqual(needle, item) || (block && needle.apply(context, arguments)))
        index = i;
    });
    return index;
  },

  first: function(n) {
    var entries = this.toArray();
    return (n === undefined) ? entries[0] : entries.slice(0,n);
  },

  grep: function(pattern, block, context) {
    block = Enumerable.toFn(block);
    var results = [];
    this.forEach(function(item) {
      var match = (typeof pattern.match === 'function') ? pattern.match(item)
                : (typeof pattern.test === 'function')  ? pattern.test(item)
                : JS.isType(item, pattern);

      if (!match) return;
      if (block) item = block.apply(context, arguments);
      results.push(item);
    });
    return results;
  },

  groupBy: function(block, context) {
    if (!block) return this.enumFor('groupBy');
    block = Enumerable.toFn(block);

    var Hash = ((typeof require === 'function') ? require('./hash') : JS).Hash,
        hash = new Hash();

    this.forEach(function(item) {
      var value = block.apply(context, arguments);
      if (!hash.hasKey(value)) hash.store(value, []);
      hash.get(value).push(item);
    });
    return hash;
  },

  inject: function(memo, block, context) {
    var args    = JS.array(arguments),
        counter = 0,
        K       = {};

    switch (args.length) {
      case 1:   memo      = K;
                block     = args[0];
                break;

      case 2:   if (typeof memo === 'function') {
                  memo    = K;
                  block   = args[0];
                  context = args[1];
                }
    }
    block = Enumerable.toFn(block);

    this.forEach(function(item) {
      if (!counter++ && memo === K) return memo = item;
      var args = [memo].concat(JS.array(arguments));
      memo = block.apply(context, args);
    });
    return memo;
  },

  map: function(block, context) {
    if (!block) return this.enumFor('map');
    block = Enumerable.toFn(block);

    var map = [];
    this.forEach(function() {
      map.push(block.apply(context, arguments));
    });
    return map;
  },

  max: function(block, context) {
    return this.minmax(block, context)[1];
  },

  maxBy: function(block, context) {
    if (!block) return this.enumFor('maxBy');
    return this.minmaxBy(block, context)[1];
  },

  member: function(needle) {
    return this.any(function(item) { return Enumerable.areEqual(item, needle) });
  },

  min: function(block, context) {
    return this.minmax(block, context)[0];
  },

  minBy: function(block, context) {
    if (!block) return this.enumFor('minBy');
    return this.minmaxBy(block, context)[0];
  },

  minmax: function(block, context) {
    var list = this.sort(block, context);
    return [list[0], list[list.length - 1]];
  },

  minmaxBy: function(block, context) {
    if (!block) return this.enumFor('minmaxBy');
    var list = this.sortBy(block, context);
    return [list[0], list[list.length - 1]];
  },

  none: function(block, context) {
    return !this.any(block, context);
  },

  one: function(block, context) {
    block = Enumerable.toFn(block);
    var count = 0;
    this.forEach(function(item) {
      if (block ? block.apply(context, arguments) : item) count += 1;
    });
    return count === 1;
  },

  partition: function(block, context) {
    if (!block) return this.enumFor('partition');
    block = Enumerable.toFn(block);

    var ayes = [], noes = [];
    this.forEach(function(item) {
      (block.apply(context, arguments) ? ayes : noes).push(item);
    });
    return [ayes, noes];
  },

  reject: function(block, context) {
    if (!block) return this.enumFor('reject');
    block = Enumerable.toFn(block);

    var map = [];
    this.forEach(function(item) {
      if (!block.apply(context, arguments)) map.push(item);
    });
    return map;
  },

  reverseForEach: function(block, context) {
    if (!block) return this.enumFor('reverseForEach');
    block = Enumerable.toFn(block);

    var entries = this.toArray(),
        n       = entries.length;

    while (n--) block.call(context, entries[n]);
    return this;
  },

  select: function(block, context) {
    if (!block) return this.enumFor('select');
    block = Enumerable.toFn(block);

    var map = [];
    this.forEach(function(item) {
      if (block.apply(context, arguments)) map.push(item);
    });
    return map;
  },

  sort: function(block, context) {
    var comparable = Enumerable.isComparable(this),
        entries    = this.toArray();

    block = block || (comparable
        ? function(a,b) { return a.compareTo(b); }
        : null);
    return block
        ? entries.sort(function(a,b) { return block.call(context, a, b); })
        : entries.sort();
  },

  sortBy: function(block, context) {
    if (!block) return this.enumFor('sortBy');
    block = Enumerable.toFn(block);

    var util       = Enumerable,
        map        = new util.Collection(this.map(block, context)),
        comparable = util.isComparable(map);

    return new util.Collection(map.zip(this).sort(function(a, b) {
      a = a[0]; b = b[0];
      return comparable ? a.compareTo(b) : (a < b ? -1 : (a > b ? 1 : 0));
    })).map(function(item) { return item[1]; });
  },

  take: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i < n) entries.push(item);
    });
    return entries;
  },

  takeWhile: function(block, context) {
    if (!block) return this.enumFor('takeWhile');
    block = Enumerable.toFn(block);

    var entries = [],
        take    = true;
    this.forEach(function(item) {
      if (take) take = take && block.apply(context, arguments);
      if (take) entries.push(item);
    });
    return entries;
  },

  toArray: function() {
    return this.drop(0);
  },

  zip: function() {
    var util    = Enumerable,
        args    = [],
        counter = 0,
        n       = arguments.length,
        block, context;

    if (typeof arguments[n-1] === 'function') {
      block = arguments[n-1]; context = {};
    }
    if (typeof arguments[n-2] === 'function') {
      block = arguments[n-2]; context = arguments[n-1];
    }
    util.forEach.call(arguments, function(arg) {
      if (arg === block || arg === context) return;
      if (arg.toArray) arg = arg.toArray();
      if (JS.isType(arg, Array)) args.push(arg);
    });
    var results = this.map(function(item) {
      var zip = [item];
      util.forEach.call(args, function(arg) {
        zip.push(arg[counter] === undefined ? null : arg[counter]);
      });
      return ++counter && zip;
    });
    if (!block) return results;
    util.forEach.call(results, block, context);
  }
});

// http://developer.mozilla.org/en/docs/index.php?title=Core_JavaScript_1.5_Reference:Global_Objects:Array&oldid=58326
Enumerable.define('forEach', Enumerable.forEach);

Enumerable.alias({
  collect:    'map',
  detect:     'find',
  entries:    'toArray',
  every:      'all',
  findAll:    'select',
  filter:     'select',
  reduce:     'inject',
  some:       'any'
});

Enumerable.extend({
  toFn: function(object) {
    if (!object) return object;
    if (object.toFunction) return object.toFunction();
    if (this.OPS[object]) return this.OPS[object];
    if (JS.isType(object, 'string') || JS.isType(object, String))
    return function() {
        var args   = JS.array(arguments),
            target = args.shift(),
            method = target[object];
        return (typeof method === 'function') ? method.apply(target, args) : method;
      };
    return object;
  },

  OPS: {
    '+':    function(a,b) { return a + b },
    '-':    function(a,b) { return a - b },
    '*':    function(a,b) { return a * b },
    '/':    function(a,b) { return a / b },
    '%':    function(a,b) { return a % b },
    '^':    function(a,b) { return a ^ b },
    '&':    function(a,b) { return a & b },
    '&&':   function(a,b) { return a && b },
    '|':    function(a,b) { return a | b },
    '||':   function(a,b) { return a || b },
    '==':   function(a,b) { return a == b },
    '!=':   function(a,b) { return a != b },
    '>':    function(a,b) { return a > b },
    '>=':   function(a,b) { return a >= b },
    '<':    function(a,b) { return a < b },
    '<=':   function(a,b) { return a <= b },
    '===':  function(a,b) { return a === b },
    '!==':  function(a,b) { return a !== b },
    '[]':   function(a,b) { return a[b] },
    '()':   function(a,b) { return a(b) }
  },

  Enumerator: new JS.Class({
    include: Enumerable,

    extend: {
      DEFAULT_METHOD: 'forEach'
    },

    initialize: function(object, method, args) {
      this._object = object;
      this._method = method || this.klass.DEFAULT_METHOD;
      this._args   = (args || []).slice();
    },

    // this is largely here to support testing since I don't want to make the
    // ivars public
    equals: function(enumerator) {
      return JS.isType(enumerator, this.klass) &&
             this._object === enumerator._object &&
             this._method === enumerator._method &&
             Enumerable.areEqual(this._args, enumerator._args);
          },

          forEach: function(block, context) {
      if (!block) return this;
      var args = this._args.slice();
      args.push(block);
      if (context) args.push(context);
      return this._object[this._method].apply(this._object, args);
    }
  })
});

Enumerable.Enumerator.alias({
  cons:       'forEachCons',
  reverse:    'reverseForEach',
  slice:      'forEachSlice',
  withIndex:  'forEachWithIndex',
  withObject: 'forEachWithObject'
});

Enumerable.Collection.include(Enumerable);

JS.Kernel.include({
  enumFor: function(method) {
    var args   = JS.array(arguments),
        method = args.shift();
    return new Enumerable.Enumerator(this, method, args);
  }
}, {_resolve: false});

JS.Kernel.alias({toEnum: 'enumFor'});

exports.Enumerable = Enumerable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Observable = new JS.Module('Observable', {
  extend: {
    DEFAULT_METHOD: 'update'
  },

  addObserver: function(observer, context) {
    (this.__observers__ = this.__observers__ || []).push({_block: observer, _context: context});
  },

  removeObserver: function(observer, context) {
    this.__observers__ = this.__observers__ || [];
    context = context;
    var i = this.countObservers();
    while (i--) {
      if (this.__observers__[i]._block === observer && this.__observers__[i]._context === context) {
        this.__observers__.splice(i,1);
        return;
      }
    }
  },

  removeObservers: function() {
    this.__observers__ = [];
  },

  countObservers: function() {
    return (this.__observers__ = this.__observers__ || []).length;
  },

  notifyObservers: function() {
    if (!this.isChanged()) return;
    var i = this.countObservers(), observer, block, context;
    while (i--) {
      observer = this.__observers__[i];
      block    = observer._block;
      context  = observer._context;
      if (typeof block === 'function') block.apply(context, arguments);
      else block[context || Observable.DEFAULT_METHOD].apply(block, arguments);
    }
  },

  setChanged: function(state) {
    this.__changed__ = !(state === false);
  },

  isChanged: function() {
    if (this.__changed__ === undefined) this.__changed__ = true;
    return !!this.__changed__;
  }
});

Observable.alias({
  subscribe:    'addObserver',
  unsubscribe:  'removeObserver'
}, true);

exports.Observable = Observable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Observable = js.Observable || require('./observable').Observable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, Observable, E ? exports : js);

})(function(JS, Enumerable, Observable, exports) {
'use strict';

var Command = new JS.Class('Command', {
  initialize: function(functions) {
    if (typeof functions === 'function')
      functions = {execute: functions};
    this._functions = functions;
    this._stack = this._functions.stack || null;
  },

  execute: function(push) {
    if (this._stack) this._stack._restart();
    var exec = this._functions.execute;
    if (exec) exec.apply(this);
    if (this._stack && push !== false) this._stack.push(this);
  },

  undo: function() {
    var exec = this._functions.undo;
    if (exec) exec.apply(this);
  },

  extend: {
    Stack: new JS.Class({
      include: [Observable || {}, Enumerable || {}],

      initialize: function(options) {
        options = options || {};
        this._redo = options.redo || null;
        this.clear();
      },

      forEach: function(block, context) {
        if (!block) return this.enumFor('forEach');
        block = Enumerable.toFn(block);

        for (var i = 0, n = this._stack.length; i < n; i++) {
          if (this._stack[i] !== undefined)
            block.call(context, this._stack[i], i);
        }
        return this;
      },

      clear: function() {
        this._stack = [];
        this.length = this.pointer = 0;
      },

      _restart: function() {
        if (this.pointer === 0 && this._redo && this._redo.execute)
          this._redo.execute();
      },

      push: function(command) {
        this._stack.splice(this.pointer, this.length);
        this._stack.push(command);
        this.length = this.pointer = this._stack.length;
        if (this.notifyObservers) this.notifyObservers(this);
      },

      stepTo: function(position) {
        if (position < 0 || position > this.length) return;
        var i, n;

        switch (true) {
          case position > this.pointer :
            for (i = this.pointer, n = position; i < n; i++)
              this._stack[i].execute(false);
            break;

          case position < this.pointer :
            if (this._redo && this._redo.execute) {
              this._redo.execute();
              for (i = 0, n = position; i < n; i++)
                this._stack[i].execute(false);
            } else {
              for (i = 0, n = this.pointer - position; i < n; i++)
                this._stack[this.pointer - i - 1].undo();
            }
            break;
        }
        this.pointer = position;
        if (this.notifyObservers) this.notifyObservers(this);
      },

      undo: function() {
        this.stepTo(this.pointer - 1);
      },

      redo: function() {
        this.stepTo(this.pointer + 1);
      }
    })
  }
});

exports.Command = Command;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Comparable = new JS.Module('Comparable', {
  extend: {
    ClassMethods: new JS.Module({
      compare: function(one, another) {
        return one.compareTo(another);
      }
    }),

    included: function(base) {
      base.extend(this.ClassMethods);
    }
  },

  lt: function(other) {
    return this.compareTo(other) < 0;
  },

  lte: function(other) {
    return this.compareTo(other) < 1;
  },

  gt: function(other) {
    return this.compareTo(other) > 0;
  },

  gte: function(other) {
    return this.compareTo(other) > -1;
  },

  eq: function(other) {
    return this.compareTo(other) === 0;
  },

  between: function(a, b) {
    return this.gte(a) && this.lte(b);
  }
});

exports.Comparable = Comparable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, E ? exports : js);

})(function(JS, Enumerable, exports) {
'use strict';

var Console = new JS.Module('Console', {
  extend: {
    nameOf: function(object, root) {
      var results = [], i, n, field, l;

      if (JS.isType(object, Array)) {
        for (i = 0, n = object.length; i < n; i++)
          results.push(this.nameOf(object[i]));
        return results;
      }

      if (object.displayName) return object.displayName;

      field = [{name: null, o: root || JS.ENV}];
      l = 0;
      while (typeof field === 'object' && l < this.MAX_DEPTH) {
        l += 1;
        field = this.descend(field, object);
      }
      if (typeof field == 'string') {
        field = field.replace(/\.prototype\./g, '#');
        object.displayName = field;
        if (object.__meta__) object.__meta__.displayName = field + '.__meta__';
      }
      return object.displayName;
    },

    descend: function(list, needle) {
      var results = [],
          n       = list.length,
          i       = n,
          key, item, name;

      while (i--) {
        item = list[i];
        if (JS.isType(item.o, Array)) continue;
        name = item.name ? item.name + '.' : '';
        for (key in item.o) {
          if (needle && item.o[key] === needle) return name + key;
          results.push({name: name + key, o: item.o[key]});
        }
      }
      return results;
    },

    convert: function(object, stack) {
      if (object === null || object === undefined) return String(object);
      var E = Enumerable, stack = stack || [], items;

      if (JS.indexOf(stack, object) >= 0) return '#circular';

      if (object instanceof Error) {
        return (typeof object.message === 'string' && !object.message)
             ? object.name
             : object.name + (object.message ? ': ' + object.message : '');
      }

      if (object instanceof Array) {
        stack.push(object);
        items = new E.Collection(object).map(function(item) {
            return this.convert(item, stack);
          }, this).join(', ');
        stack.pop();
        return items ? '[ ' + items + ' ]' : '[]';
      }

      if (object instanceof String || typeof object === 'string')
        return '"' + object + '"';

      if (object instanceof Function)
        return object.displayName ||
               object.name ||
              (object.toString().match(/^\s*function ([^\(]+)\(/) || [])[1] ||
               '#function';

      if (object instanceof Date)
        return object.toGMTString();

      if (object.toString &&
          object.toString !== Object.prototype.toString &&
          !object.toString.__traced__)
        return object.toString();

      if (object.nodeType !== undefined) return object.toString();

      stack.push(object);
      items = new E.Collection(E.objectKeys(object, false).sort()).map(function(key) {
          return this.convert(key, stack) + ': ' + this.convert(object[key], stack);
        }, this).join(', ');
      stack.pop();
      return items ? '{ ' + items + ' }' : '{}';
    },

    filterBacktrace: function(stack) {
      if (!stack) return stack;
      stack = stack.replace(/^\S.*\n?/gm, '');
      var filter = this.adapter.backtraceFilter();

      return filter
           ? stack.replace(filter, '')
           : stack;
    },

    ANSI_CSI:       '\u001B[',
    DEFAULT_WIDTH:  78,
    DEFAULT_HEIGHT: 24,
    MAX_DEPTH:      4,
    NO_COLOR:       'NO_COLOR',

    ESCAPE_CODES: {
      cursor: {
        cursorUp:           '%1A',
        cursorDown:         '%1B',
        cursorForward:      '%1C',
        cursorBack:         '%1D',
        cursorNextLine:     '%1E',
        cursorPrevLine:     '%1F',
        cursorColumn:       '%1G',
        cursorPosition:     '%1;%2H',
        cursorHide:         '?25l',
        cursorShow:         '?25h'
      },

      screen: {
        eraseScreenForward: '0J',
        eraseScreenBack:    '1J',
        eraseScreen:        '2J',
        eraseLineForward:   '0K',
        eraseLineBack:      '1K',
        eraseLine:          '2K'
      },

      reset: {
        reset:      '0m'
      },

      weight: {
        bold:       '1m',   normal:     '22m'
      },

      style: {
        italic:     '',     noitalic:   ''
      },

      underline: {
        underline:  '4m',   noline:     '24m'
      },

      blink: {
        blink:      '5m',   noblink:    '25m'
      },

      color: {
        black:      '30m',
        red:        '31m',
        green:      '32m',
        yellow:     '33m',
        blue:       '34m',
        magenta:    '35m',
        cyan:       '36m',
        white:      '37m',
        nocolor:    '39m',
        grey:       '90m'
      },

      background: {
        bgblack:    '40m',
        bgred:      '41m',
        bggreen:    '42m',
        bgyellow:   '43m',
        bgblue:     '44m',
        bgmagenta:  '45m',
        bgcyan:     '46m',
        bgwhite:    '47m',
        bgnocolor:  '49m'
      }
    },

    coloring: function() {
      return this.adapter.coloring();
    },

    envvar: function(name) {
      return this.adapter.envvar(name);
    },

    escape: function(string) {
      return Console.ANSI_CSI + string;
    },

    exit: function(status) {
      this.adapter.exit(status);
    },

    getDimensions: function() {
      return this.adapter.getDimensions();
    }
  },

  consoleFormat: function() {
    this.reset();
    var i = arguments.length;
    while (i--) this[arguments[i]]();
  },

  print: function(string) {
    string = (string === undefined ? '' : string).toString();
    Console.adapter.print(string);
  },

  puts: function(string) {
    string = (string === undefined ? '' : string).toString();
    Console.adapter.puts(string);
  }
});

Console.extend({
  Base: new JS.Class({
    __buffer__: '',
    __format__: '',

    backtraceFilter: function() {
      if (typeof version === 'function' && version() > 100) {
        return /.*/;
      } else {
        return null;
      }
    },

    coloring: function() {
      return !this.envvar(Console.NO_COLOR);
    },

    echo: function(string) {
      if (typeof console !== 'undefined') return console.log(string);
      if (typeof print === 'function')    return print(string);
    },

    envvar: function(name) {
      return null;
    },

    exit: function(status) {
      if (typeof system === 'object' && system.exit) system.exit(status);
      if (typeof quit === 'function')                quit(status);
    },

    format: function(type, name, args) {
      if (!this.coloring()) return;
      var escape = Console.ESCAPE_CODES[type][name];

      for (var i = 0, n = args.length; i < n; i++)
        escape = escape.replace('%' + (i+1), args[i]);

      this.__format__ += Console.escape(escape);
    },

    flushFormat: function() {
      var format = this.__format__;
      this.__format__ = '';
      return format;
    },

    getDimensions: function() {
      var width  = this.envvar('COLUMNS') || Console.DEFAULT_WIDTH,
          height = this.envvar('ROWS')    || Console.DEFAULT_HEIGHT;

      return [parseInt(width, 10), parseInt(height, 10)];
    },

    print: function(string) {
      var coloring = this.coloring(),
          width    = this.getDimensions()[0],
          esc      = Console.escape,
          length, prefix, line;

      while (string.length > 0) {
        length = this.__buffer__.length;
        prefix = (length > 0 && coloring) ? esc('1F') + esc((length + 1) + 'G') : '';
        line   = string.substr(0, width - length);

        this.__buffer__ += line;

        if (coloring) this.echo(prefix + this.flushFormat() + line);

        if (this.__buffer__.length === width) {
          if (!coloring) this.echo(this.__buffer__);
          this.__buffer__ = '';
        }
        string = string.substr(width - length);
      }
    },

    puts: function(string) {
      var coloring = this.coloring(),
          esc      = Console.escape,
          length   = this.__buffer__.length,
          prefix   = (length > 0 && coloring) ? esc('1F') + esc((length + 1) + 'G') : this.__buffer__;

      this.echo(prefix + this.flushFormat() + string);
      this.__buffer__ = '';
    }
  })
});

Console.extend({
  Browser: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(window.location.href.replace(/(\/[^\/]+)/g, '($1)?') + '/?', 'g');
    },

    coloring: function() {
      if (this.envvar(Console.NO_COLOR)) return false;
      return Console.AIR;
    },

    echo: function(string) {
      if (window.runtime) return window.runtime.trace(string);
      if (window.console) return console.log(string);
      alert(string);
    },

    envvar: function(name) {
      return window[name] || null;
    },

    getDimensions: function() {
      if (Console.AIR) return this.callSuper();
      return [1024, 1];
    }
  })
});

Console.extend({
  BrowserColor: new JS.Class(Console.Browser, {
    COLORS: {
      green: 'limegreen'
    },

    __queue__: [],
    __state__: null,

    format: function(type, name) {
      name = name.replace(/^bg/, '');

      var state = JS.extend({}, this.__state__ || {}),
          color = this.COLORS[name] || name,
          no    = /^no/.test(name);

      if (type === 'reset')
        state = null;
      else if (no)
        delete state[type];
      else if (type === 'weight')
        state.weight = 'font-weight: ' + name;
      else if (type === 'style')
        state.style = 'font-style: ' + name;
      else if (type === 'underline')
        state.underline = 'text-decoration: underline';
      else if (type === 'color')
        state.color = 'color: ' + color;
      else if (type === 'background')
        state.background = 'background-color: ' + color;
      else
        state = undefined;

      if (state !== undefined) {
        this.__state__ = state;
        this.__queue__.push(state);
      }
    },

    print: function(string) {
      this.__queue__.push(string)
    },

    puts: function(string) {
      this.print(string);
      var buffer = '', formats = [], item;
      while ((item = this.__queue__.shift()) !== undefined) {
        if (typeof item === 'string') {
          if (this.__state__) {
            buffer += '%c' + item;
            formats.push(this._serialize(this.__state__));
          } else {
            buffer += item;
          }
        } else {
          this.__state__ = item;
        }
      }
      console.log.apply(console, [buffer].concat(formats));
    },

    _serialize: function(state) {
      var rules = [];
      for (var key in state) rules.push(state[key]);
      return rules.join('; ');
    }
  })
});

Console.extend({
  Node: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(process.cwd() + '/', 'g');
    },

    coloring: function() {
      return !this.envvar(Console.NO_COLOR) && require('tty').isatty(1);
    },

    envvar: function(name) {
      return process.env[name] || null;
    },

    exit: function(status) {
      process.exit(status);
    },

    getDimensions: function() {
      var width, height, dims;
      if (process.stdout.getWindowSize) {
        dims   = process.stdout.getWindowSize();
        width  = dims[0];
        height = dims[1];
      } else {
        dims   = process.binding('stdio').getWindowSize();
        width  = dims[1];
        height = dims[0];
      }
      return [width, height];
    },

    print: function(string) {
      process.stdout.write(this.flushFormat() + string);
    },

    puts: function(string) {
      console.log(this.flushFormat() + string);
    }
  })
});

Console.extend({
  Phantom: new JS.Class(Console.Base, {
    echo: function(string) {
      console.log(string);
    },

    envvar: function(name) {
      return require('system').env[name] || null;
    },

    exit: function(status) {
      phantom.exit(status);
    }
  })
});

Console.extend({
  Rhino: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(java.lang.System.getProperty('user.dir') + '/', 'g');
    },

    envvar: function(name) {
      var env = java.lang.System.getenv();
      return env.get(name) || null;
    },

    getDimensions: function() {
      var proc = java.lang.Runtime.getRuntime().exec(['sh', '-c', 'stty -a < /dev/tty']),
          is   = proc.getInputStream(),
          bite = 0,
          out  = '',
          width, height;

      while (bite >= 0) {
        bite = is.read();
        if (bite >= 0) out += String.fromCharCode(bite);
      }

      var match = out.match(/rows\s+(\d+);\s+columns\s+(\d+)/);
      if (!match) return this._dimCache || this.callSuper();

      return this._dimCache = [parseInt(match[2], 10), parseInt(match[1], 10)];
    },

    print: function(string) {
      java.lang.System.out.print(this.flushFormat() + string);
    },

    puts: function(string) {
      java.lang.System.out.println(this.flushFormat() + string);
    }
  })
});

Console.extend({
  Windows: new JS.Class(Console.Base, {
    coloring: function() {
      return false;
    },

    echo: function(string) {
      WScript.Echo(string);
    },

    exit: function(status) {
      WScript.Quit(status);
    }
  })
});

Console.BROWSER = (typeof window !== 'undefined');
Console.NODE    = (typeof process === 'object') && !Console.BROWSER;
Console.PHANTOM = (typeof phantom !== 'undefined');
Console.AIR     = (Console.BROWSER && typeof runtime !== 'undefined');
Console.RHINO   = (typeof java !== 'undefined' && typeof java.lang !== 'undefined');
Console.WSH     = (typeof WScript !== 'undefined');

var useColor = false, ua;
if (Console.BROWSER) {
  ua = navigator.userAgent;
  if (window.console && /Chrome/.test(ua))
    useColor = true;
}

if (Console.PHANTOM)      Console.adapter = new Console.Phantom();
else if (useColor)        Console.adapter = new Console.BrowserColor();
else if (Console.BROWSER) Console.adapter = new Console.Browser();
else if (Console.NODE)    Console.adapter = new Console.Node();
else if (Console.RHINO)   Console.adapter = new Console.Rhino();
else if (Console.WSH)     Console.adapter = new Console.Windows();
else                      Console.adapter = new Console.Base();

for (var type in Console.ESCAPE_CODES) {
  for (var key in Console.ESCAPE_CODES[type]) (function(type, key) {
    Console.define(key, function() {
      Console.adapter.format(type, key, arguments);
    });
  })(type, key);
}

Console.extend(Console);

exports.Console = Console;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var ConstantScope = new JS.Module('ConstantScope', {
  extend: {
    included: function(base) {
      base.__consts__ = new JS.Module();
      base.extend(this.ClassMethods);
      base.__eigen__().extend(this.ClassMethods);

      base.include(base.__consts__);
      base.extend(base.__consts__);

      base.include(this.extract(base.__fns__));
      base.extend(this.extract(base.__eigen__().__fns__));
    },

    ClassMethods: new JS.Module({
      define: function(name, callable) {
        var constants = this.__consts__ || this.__tgt__.__consts__;

        if (/^[A-Z]/.test(name))
          constants.define(name, callable);
        else
          this.callSuper();

        if (JS.isType(callable, JS.Module)) {
          callable.include(ConstantScope);
          callable.__consts__.include(constants);
        }
      }
    }),

    extract: function(methods, base) {
      var constants = {}, key, object;
      for (key in methods) {
        if (!/^[A-Z]/.test(key)) continue;

        object = methods[key];
        constants[key] = object;
        delete methods[key];
      }
      return constants;
    }
  }
});

exports.ConstantScope = ConstantScope;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Decorator = new JS.Class('Decorator', {
  initialize: function(decoree, methods) {
    var decorator  = new JS.Class(),
        delegators = {},
        method, func;

    for (method in decoree.prototype) {
      func = decoree.prototype[method];
      if (typeof func === 'function' && func !== decoree) func = this.klass.delegate(method);
      delegators[method] = func;
    }

    decorator.include(new JS.Module(delegators), {_resolve: false});
    decorator.include(this.klass.InstanceMethods, {_resolve: false});
    decorator.include(methods);
    return decorator;
  },

  extend: {
    delegate: function(name) {
      return function() {
        return this.component[name].apply(this.component, arguments);
      };
    },

    InstanceMethods: new JS.Module({
      initialize: function(component) {
        this.component = component;
        this.klass = this.constructor = component.klass;
        var method, func;
        for (method in component) {
          if (this[method]) continue;
          func = component[method];
          if (typeof func === 'function') func = Decorator.delegate(method);
          this[method] = func;
        }
      },

      extend: function(source) {
        this.component.extend(source);
        var method, func;
        for (method in source) {
          func = source[method];
          if (typeof func === 'function') func = Decorator.delegate(method);
          this[method] = func;
        }
      }
    })
  }
});

exports.Decorator = Decorator;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Deferrable = new JS.Module('Deferrable', {
  extend: {
    Timeout: new JS.Class(Error)
  },

  callback: function(block, context) {
    if (this.__deferredStatus__ === 'success')
      return block.apply(context, this.__deferredValue__);

    if (this.__deferredStatus__ === 'failure')
      return;

    this.__callbacks__ = this.__callbacks__ || [];
    this.__callbacks__.push([block, context]);
  },

  errback: function(block, context) {
    if (this.__deferredStatus__ === 'failure')
      return block.apply(context, this.__deferredValue__);

    if (this.__deferredStatus__ === 'success')
      return;

    this.__errbacks__ = this.__errbacks__ || [];
    this.__errbacks__.push([block, context]);
  },

  timeout: function(milliseconds) {
    this.cancelTimeout();
    var self = this, error = new Deferrable.Timeout();
    this.__timeout__ = JS.ENV.setTimeout(function() { self.fail(error) }, milliseconds);
  },

  cancelTimeout: function() {
    if (!this.__timeout__) return;
    JS.ENV.clearTimeout(this.__timeout__);
    delete this.__timeout__;
  },

  setDeferredStatus: function(status, args) {
    this.__deferredStatus__ = status;
    this.__deferredValue__  = args;

    this.cancelTimeout();

    switch (status) {
      case 'success':
        if (!this.__callbacks__) return;
        var callback;
        while (callback = this.__callbacks__.pop())
          callback[0].apply(callback[1], args);
        break;

      case 'failure':
        if (!this.__errbacks__) return;
        var errback;
        while (errback = this.__errbacks__.pop())
          errback[0].apply(errback[1], args);
        break;
    }
  },

  succeed: function() {
    return this.setDeferredStatus('success', arguments);
  },

  fail: function() {
    return this.setDeferredStatus('failure', arguments);
  }
});

exports.Deferrable = Deferrable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var DOM = {
  ELEMENT_NODE:                   1,
  ATTRIBUTE_NODE:                 2,
  TEXT_NODE:                      3,
  CDATA_SECTION_NODE:             4,
  ENTITY_REFERENCE_NODE:          5,
  ENTITY_NODE:                    6,
  PROCESSING_INSTRUCTION_NODE:    7,
  COMMENT_NODE:                   8,
  DOCUMENT_NODE:                  9,
  DOCUMENT_TYPE_NODE:             10,
  DOCUMENT_FRAGMENT_NODE:         11,
  NOTATION_NODE:                  12,

  ENV: this,

  toggleClass: function(node, className) {
    if (this.hasClass(node, className)) this.removeClass(node, className);
    else this.addClass(node, className);
  },

  hasClass: function(node, className) {
    var classes = node.className.split(/\s+/);
    return JS.indexOf(classes, className) >= 0;
  },

  addClass: function(node, className) {
    if (this.hasClass(node, className)) return;
    node.className = node.className + ' ' + className;
  },

  removeClass: function(node, className) {
    var pattern = new RegExp('\\b' + className + '\\b\\s*', 'g');
    node.className = node.className.replace(pattern, '');
  }
};

DOM.Builder = new JS.Class('DOM.Builder', {
  extend: {
    addElement: function(name) {
      this.define(name, function() {
        return this.makeElement(name, arguments);
      });
      DOM[name] = function() {
        return new DOM.Builder().makeElement(name, arguments);
      };
    },

    addElements: function(list) {
      var i = list.length;
      while (i--) this.addElement(list[i]);
    }
  },

  initialize: function(parent) {
    this._parentNode = parent;
  },

  makeElement: function(name, children) {
    var element, child, attribute;
    if ( document.createElementNS ) {
      // That makes possible to mix HTML within SVG or XUL.
      element = document.createElementNS('http://www.w3.org/1999/xhtml', name);
    } else {
      element = document.createElement(name);
    }
    for (var i = 0, n = children.length; i < n; i++) {
      child = children[i];
      if (typeof child === 'function') {
        child(new this.klass(element));
      } else if (JS.isType(child, 'string')) {
        element.appendChild(document.createTextNode(child));
      } else {
        for (attribute in child)
          element[attribute] = child[attribute];
      }
    }
    if (this._parentNode) this._parentNode.appendChild(element);
    return element;
  },

  concat: function(text) {
    if (!this._parentNode) return;
    this._parentNode.appendChild(document.createTextNode(text));
  }
});

DOM.Builder.addElements([
  'a', 'abbr', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b',
  'base', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
  'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del',
  'details', 'device', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
  'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input',
  'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark',
  'marquee', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol',
  'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp',
  'rt', 'ruby', 'samp', 'script', 'section', 'select', 'small', 'source',
  'span', 'strong', 'style', 'sub', 'sup', 'summary', 'table', 'tbody', 'td',
  'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'ul',
  'var', 'video', 'wbr'
]);

DOM.Event = {
  _registry: [],

  on: function(element, eventName, callback, context) {
    if (element === undefined) return;

    if (element !== DOM.ENV &&
        element.nodeType !== DOM.ELEMENT_NODE &&
        element.nodeType !== DOM.DOCUMENT_NODE)
      return;

    var wrapped = function() { callback.call(context, element) };

    if (element.addEventListener)
      element.addEventListener(eventName, wrapped, false);
    else if (element.attachEvent)
      element.attachEvent('on' + eventName, wrapped);

    this._registry.push({
      _element:   element,
      _type:      eventName,
      _callback:  callback,
      _context:   context,
      _handler:   wrapped
    });
  },

  detach: function(element, eventName, callback, context) {
    var i = this._registry.length, register;
    while (i--) {
      register = this._registry[i];

      if ((element    && element    !== register._element)   ||
          (eventName  && eventName  !== register._type)      ||
          (callback   && callback   !== register._callback)  ||
          (context    && context    !== register._context))
        continue;

      if (register._element.removeEventListener)
        register._element.removeEventListener(register._type, register._handler, false);
      else if (register._element.detachEvent)
        register._element.detachEvent('on' + register._type, register._handler);

      this._registry.splice(i,1);
      register = null;
    }
  }
};

DOM.Event.on(DOM.ENV, 'unload', DOM.Event.detach, DOM.Event);

exports.DOM = DOM;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Forwardable = new JS.Module('Forwardable', {
  defineDelegator: function(subject, method, alias, resolve) {
    alias = alias || method;
    this.define(alias, function() {
      var object   = this[subject],
          property = object[method];

      return (typeof property === 'function')
          ? property.apply(object, arguments)
          : property;
    }, {_resolve: resolve !== false});
  },

  defineDelegators: function() {
    var methods = JS.array(arguments),
        subject = methods.shift(),
        i       = methods.length;

    while (i--) this.defineDelegator(subject, methods[i], methods[i], false);
    this.resolve();
  }
});

exports.Forwardable = Forwardable;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Comparable = js.Comparable || require('./comparable').Comparable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, Comparable, E ? exports : js);

})(function(JS, Enumerable, Comparable, exports) {
'use strict';

var Hash = new JS.Class('Hash', {
  include: Enumerable || {},

  extend: {
    Pair: new JS.Class({
      include: Comparable || {},
      length: 2,

      setKey: function(key) {
        this[0] = this.key = key;
      },

      hasKey: function(key) {
        return Enumerable.areEqual(this.key, key);
      },

      setValue: function(value) {
        this[1] = this.value = value;
      },

      hasValue: function(value) {
        return Enumerable.areEqual(this.value, value);
      },

      compareTo: function(other) {
        return this.key.compareTo
            ? this.key.compareTo(other.key)
            : (this.key < other.key ? -1 : (this.key > other.key ? 1 : 0));
      },

      hash: function() {
        var key   = Hash.codeFor(this.key),
            value = Hash.codeFor(this.value);

        return [key, value].sort().join('/');
      }
    }),

    codeFor: function(object) {
      if (typeof object !== 'object') return String(object);
      return (typeof object.hash === 'function')
          ? object.hash()
          : object.toString();
    }
  },

  initialize: function(object) {
    this.clear();
    if (!JS.isType(object, Array)) return this.setDefault(object);
    for (var i = 0, n = object.length; i < n; i += 2)
      this.store(object[i], object[i+1]);
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    var hash, bucket, i;

    for (hash in this._buckets) {
      if (!this._buckets.hasOwnProperty(hash)) continue;
      bucket = this._buckets[hash];
      i = bucket.length;
      while (i--) block.call(context, bucket[i]);
    }
    return this;
  },

  _bucketForKey: function(key, createIfAbsent) {
    var hash   = this.klass.codeFor(key),
        bucket = this._buckets[hash];

    if (!bucket && createIfAbsent)
      bucket = this._buckets[hash] = [];

    return bucket;
  },

  _indexInBucket: function(bucket, key) {
    var i     = bucket.length,
        ident = !!this._compareByIdentity;

    while (i--) {
      if (ident ? (bucket[i].key === key) : bucket[i].hasKey(key))
        return i;
    }
    return -1;
  },

  assoc: function(key, createIfAbsent) {
    var bucket, index, pair;

    bucket = this._bucketForKey(key, createIfAbsent);
    if (!bucket) return null;

    index = this._indexInBucket(bucket, key);
    if (index > -1) return bucket[index];
    if (!createIfAbsent) return null;

    this.size += 1; this.length += 1;
    pair = new this.klass.Pair;
    pair.setKey(key);
    bucket.push(pair);
    return pair;
  },

  rassoc: function(value) {
    var key = this.key(value);
    return key ? this.assoc(key) : null;
  },

  clear: function() {
    this._buckets = {};
    this.length = this.size = 0;
  },

  compareByIdentity: function() {
    this._compareByIdentity = true;
    return this;
  },

  comparesByIdentity: function() {
    return !!this._compareByIdentity;
  },

  setDefault: function(value) {
    this._default = value;
    return this;
  },

  getDefault: function(key) {
    return (typeof this._default === 'function')
        ? this._default(this, key)
        : (this._default || null);
  },

  equals: function(other) {
    if (!JS.isType(other, Hash) || this.length !== other.length)
      return false;
    var result = true;
    this.forEach(function(pair) {
      if (!result) return;
      var otherPair = other.assoc(pair.key);
      if (otherPair === null || !otherPair.hasValue(pair.value)) result = false;
    });
    return result;
  },

  hash: function() {
    var hashes = [];
    this.forEach(function(pair) { hashes.push(pair.hash()) });
    return hashes.sort().join('');
  },

  fetch: function(key, defaultValue, context) {
    var pair = this.assoc(key);
    if (pair) return pair.value;

    if (defaultValue === undefined) throw new Error('key not found');
    if (typeof defaultValue === 'function') return defaultValue.call(context, key);
    return defaultValue;
  },

  forEachKey: function(block, context) {
    if (!block) return this.enumFor('forEachKey');
    block = Enumerable.toFn(block);

    this.forEach(function(pair) {
      block.call(context, pair.key);
    });
    return this;
  },

  forEachPair: function(block, context) {
    if (!block) return this.enumFor('forEachPair');
    block = Enumerable.toFn(block);

    this.forEach(function(pair) {
      block.call(context, pair.key, pair.value);
    });
    return this;
  },

  forEachValue: function(block, context) {
    if (!block) return this.enumFor('forEachValue');
    block = Enumerable.toFn(block);

    this.forEach(function(pair) {
      block.call(context, pair.value);
    });
    return this;
  },

  get: function(key) {
    var pair = this.assoc(key);
    return pair ? pair.value : this.getDefault(key);
  },

  hasKey: function(key) {
    return !!this.assoc(key);
  },

  hasValue: function(value) {
    var has = false, ident = !!this._compareByIdentity;
    this.forEach(function(pair) {
      if (has) return;
      if (ident ? value === pair.value : Enumerable.areEqual(value, pair.value))
        has = true;
    });
    return has;
  },

  invert: function() {
    var hash = new this.klass;
    this.forEach(function(pair) {
      hash.store(pair.value, pair.key);
    });
    return hash;
  },

  isEmpty: function() {
    for (var hash in this._buckets) {
      if (this._buckets.hasOwnProperty(hash) && this._buckets[hash].length > 0)
        return false;
    }
    return true;
  },

  keepIf: function(block, context) {
    return this.removeIf(function() {
      return !block.apply(context, arguments);
    });
  },

  key: function(value) {
    var result = null;
    this.forEach(function(pair) {
      if (!result && Enumerable.areEqual(value, pair.value))
        result = pair.key;
    });
    return result;
  },

  keys: function() {
    var keys = [];
    this.forEach(function(pair) { keys.push(pair.key) });
    return keys;
  },

  merge: function(hash, block, context) {
    var newHash = new this.klass;
    newHash.update(this);
    newHash.update(hash, block, context);
    return newHash;
  },

  rehash: function() {
    var temp = new this.klass;
    temp._buckets = this._buckets;
    this.clear();
    this.update(temp);
  },

  remove: function(key, block) {
    if (block === undefined) block = null;
    var bucket, index, result;

    bucket = this._bucketForKey(key);
    if (!bucket) return (typeof block === 'function')
                      ? this.fetch(key, block)
                      : this.getDefault(key);

    index = this._indexInBucket(bucket, key);
    if (index < 0) return (typeof block === 'function')
                        ? this.fetch(key, block)
                        : this.getDefault(key);

    result = bucket[index].value;
    this._delete(bucket, index);
    this.size -= 1;
    this.length -= 1;

    if (bucket.length === 0)
      delete this._buckets[this.klass.codeFor(key)];

    return result;
  },

  _delete: function(bucket, index) {
    bucket.splice(index, 1);
  },

  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = Enumerable.toFn(block);

    var toRemove = [];

    this.forEach(function(pair) {
      if (block.call(context, pair))
        toRemove.push(pair.key);
    }, this);

    var i = toRemove.length;
    while (i--) this.remove(toRemove[i]);

    return this;
  },

  replace: function(hash) {
    this.clear();
    this.update(hash);
  },

  shift: function() {
    var keys = this.keys();
    if (keys.length === 0) return this.getDefault();
    var pair = this.assoc(keys[0]);
    this.remove(pair.key);
    return pair;
  },

  store: function(key, value) {
    this.assoc(key, true).setValue(value);
    return value;
  },

  toString: function() {
    return 'Hash:{' + this.map(function(pair) {
      return pair.key.toString() + '=>' + pair.value.toString();
    }).join(',') + '}';
  },

  update: function(hash, block, context) {
    var givenBlock = (typeof block === 'function');
    hash.forEach(function(pair) {
      var key = pair.key, value = pair.value;
      if (givenBlock && this.hasKey(key))
        value = block.call(context, key, this.get(key), value);
      this.store(key, value);
    }, this);
  },

  values: function() {
    var values = [];
    this.forEach(function(pair) { values.push(pair.value) });
    return values;
  },

  valuesAt: function() {
    var i = arguments.length, results = [];
    while (i--) results.push(this.get(arguments[i]));
    return results;
  }
});

Hash.alias({
  includes: 'hasKey',
  index:    'key',
  put:      'store'
});

var OrderedHash = new JS.Class('OrderedHash', Hash, {
  assoc: function(key, createIfAbsent) {
    var _super = Hash.prototype.assoc;

    var existing = _super.call(this, key, false);
    if (existing || !createIfAbsent) return existing;

    var pair = _super.call(this, key, true);

    if (!this._first) {
      this._first = this._last = pair;
    } else {
      this._last._next = pair;
      pair._prev = this._last;
      this._last = pair;
    }
    return pair;
  },

  clear: function() {
    this.callSuper();
    this._first = this._last = null;
  },

  _delete: function(bucket, index) {
    var pair = bucket[index];

    if (pair._prev) pair._prev._next = pair._next;
    if (pair._next) pair._next._prev = pair._prev;

    if (pair === this._first) this._first = pair._next;
    if (pair === this._last) this._last = pair._prev;

    return this.callSuper();
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    var pair = this._first;
    while (pair) {
      block.call(context, pair);
      pair = pair._next;
    }
  },

  rehash: function() {
    var pair = this._first;
    this.clear();
    while (pair) {
      this.store(pair.key, pair.value);
      pair = pair._next;
    }
  }
});

exports.Hash = Hash;
exports.OrderedHash = OrderedHash;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      hash = js.Hash ? js : require('./hash');

  if (E) exports.JS = exports;
  factory(js, Enumerable, hash, E ? exports : js);

})(function(JS, Enumerable, hash, exports) {
'use strict';

var Set = new JS.Class('Set', {
  extend: {
    forEach: function(list, block, context) {
      if (!list || !block) return;
      if (list.forEach) return list.forEach(block, context);
      for (var i = 0, n = list.length; i < n; i++) {
        if (list[i] !== undefined)
          block.call(context, list[i], i);
      }
    }
  },

  include: Enumerable || {},

  initialize: function(list, block, context) {
    this.clear();
    if (block) this.klass.forEach(list, function(item) {
      this.add(block.call(context, item));
    }, this);
    else this.merge(list);
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    this._members.forEachKey(block, context);
    return this;
  },

  add: function(item) {
    if (this.contains(item)) return false;
    this._members.store(item, true);
    this.length = this.size = this._members.length;
    return true;
  },

  classify: function(block, context) {
    if (!block) return this.enumFor('classify');
    block = Enumerable.toFn(block);

    var classes = new hash.Hash();
    this.forEach(function(item) {
      var value = block.call(context, item);
      if (!classes.hasKey(value)) classes.store(value, new this.klass);
      classes.get(value).add(item);
    }, this);
    return classes;
  },

  clear: function() {
    this._members = new hash.Hash();
    this.size = this.length = 0;
  },

  complement: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (!this.contains(item)) set.add(item);
    }, this);
    return set;
  },

  contains: function(item) {
    return this._members.hasKey(item);
  },

  difference: function(other) {
    other = JS.isType(other, Set) ? other : new Set(other);
    var set = new this.klass;
    this.forEach(function(item) {
      if (!other.contains(item)) set.add(item);
    });
    return set;
  },

  divide: function(block, context) {
    if (!block) return this.enumFor('divide');
    block = Enumerable.toFn(block);

    var classes = this.classify(block, context),
        sets    = new Set;

    classes.forEachValue(sets.method('add'));
    return sets;
  },

  equals: function(other) {
    if (this.length !== other.length || !JS.isType(other, Set)) return false;
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },

  hash: function() {
    var hashes = [];
    this.forEach(function(object) { hashes.push(hash.Hash.codeFor(object)) });
    return hashes.sort().join('');
  },

  flatten: function(set) {
    var copy = new this.klass;
    copy._members = this._members;
    if (!set) { set = this; set.clear(); }
    copy.forEach(function(item) {
      if (JS.isType(item, Set)) item.flatten(set);
      else set.add(item);
    });
    return set;
  },

  inspect: function() {
    return this.toString();
  },

  intersection: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (this.contains(item)) set.add(item);
    }, this);
    return set;
  },

  isEmpty: function() {
    return this._members.length === 0;
  },

  isProperSubset: function(other) {
    return this._members.length < other._members.length && this.isSubset(other);
  },

  isProperSuperset: function(other) {
    return this._members.length > other._members.length && this.isSuperset(other);
  },

  isSubset: function(other) {
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },

  isSuperset: function(other) {
    return other.isSubset(this);
  },

  keepIf: function(block, context) {
    return this.removeIf(function() {
      return !block.apply(context, arguments);
    });
  },

  merge: function(list) {
    this.klass.forEach(list, function(item) { this.add(item) }, this);
  },

  product: function(other) {
    var pairs = new Set;
    this.forEach(function(item) {
      this.klass.forEach(other, function(partner) {
        pairs.add([item, partner]);
      });
    }, this);
    return pairs;
  },

  rebuild: function() {
    this._members.rehash();
    this.length = this.size = this._members.length;
  },

  remove: function(item) {
    this._members.remove(item);
    this.length = this.size = this._members.length;
  },

  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = Enumerable.toFn(block);

    this._members.removeIf(function(pair) {
      return block.call(context, pair.key);
    });
    this.length = this.size = this._members.length;
    return this;
  },

  replace: function(other) {
    this.clear();
    this.merge(other);
  },

  subtract: function(list) {
    this.klass.forEach(list, function(item) {
      this.remove(item);
    }, this);
  },

  toString: function() {
    var items = [];
    this.forEach(function(item) {
      items.push(item.toString());
    });
    return this.klass.displayName + ':{' + items.join(',') + '}';
  },

  union: function(other) {
    var set = new this.klass;
    set.merge(this);
    set.merge(other);
    return set;
  },

  xor: function(other) {
    var set = new this.klass(other);
    this.forEach(function(item) {
      set[set.contains(item) ? 'remove' : 'add'](item);
    });
    return set;
  },

  _indexOf: function(item) {
    var i    = this._members.length,
        Enum = Enumerable;

    while (i--) {
      if (Enum.areEqual(item, this._members[i])) return i;
    }
    return -1;
  }
});

Set.alias({
  n:  'intersection',
  u:  'union',
  x:  'product'
});

var OrderedSet = new JS.Class('OrderedSet', Set, {
  clear: function() {
    this._members = new hash.OrderedHash();
    this.size = this.length = 0;
  }
});

var SortedSet = new JS.Class('SortedSet', Set, {
  extend: {
    compare: function(one, another) {
      return JS.isType(one, Object)
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    }
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);
    this.klass.forEach(this._members, block, context);
    return this;
  },

  add: function(item) {
    var point = this._indexOf(item, true);
    if (point === null) return false;
    this._members.splice(point, 0, item);
    this.length = this.size = this._members.length;
    return true;
  },

  clear: function() {
    this._members = [];
    this.size = this.length = 0;
  },

  contains: function(item) {
    return this._indexOf(item) !== -1;
  },

  rebuild: function() {
    var members = this._members;
    this.clear();
    this.merge(members);
  },

  remove: function(item) {
    var index = this._indexOf(item);
    if (index === -1) return;
    this._members.splice(index, 1);
    this.length = this.size = this._members.length;
  },

  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = Enumerable.toFn(block);

    var members = this._members,
        i       = members.length;

    while (i--) {
      if (block.call(context, members[i]))
        this.remove(members[i]);
    }
    return this;
  },

  _indexOf: function(item, insertionPoint) {
    var items   = this._members,
        n       = items.length,
        i       = 0,
        d       = n,
        compare = this.klass.compare,
        Enum    = Enumerable,
        found;

    if (n === 0) return insertionPoint ? 0 : -1;

    if (compare(item, items[0]) < 1)   { d = 0; i = 0; }
    if (compare(item, items[n-1]) > 0) { d = 0; i = n; }

    while (!Enum.areEqual(item, items[i]) && d > 0.5) {
      d = d / 2;
      i += (compare(item, items[i]) > 0 ? 1 : -1) * Math.round(d);
      if (i > 0 && compare(item, items[i-1]) > 0 && compare(item, items[i]) < 1) d = 0;
    }

    // The pointer will end up at the start of any homogenous section. Step
    // through the section until we find the needle or until the section ends.
    while (items[i] && !Enum.areEqual(item, items[i]) &&
        compare(item, items[i]) === 0) i += 1;

    found = Enum.areEqual(item, items[i]);
    return insertionPoint
        ? (found ? null : i)
        : (found ? i : -1);
  }
});

Enumerable.include({
  toSet: function(klass, block, context) {
    klass = klass || Set;
    return new klass(this, block, context);
  }
});

exports.Set = exports.HashSet = Set;
exports.OrderedSet = OrderedSet;
exports.SortedSet = SortedSet;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable;

  if (E) exports.JS = exports;
  factory(js, Enumerable, E ? exports : js);

})(function(JS, Enumerable, exports) {
'use strict';

var LinkedList = new JS.Class('LinkedList', {
  include: Enumerable || {},

  initialize: function(array, useNodes) {
    this.length = 0;
    this.first = this.last = null;
    if (!array) return;
    for (var i = 0, n = array.length; i < n; i++)
      this.push( useNodes ? new this.klass.Node(array[i]) : array[i] );
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    var node   = this.first,
        next, i, n;

    for (i = 0, n = this.length; i < n; i++) {
      next = node.next;
      block.call(context, node, i);
      if (node === this.last) break;
      node = next;
    }
    return this;
  },

  at: function(n) {
    if (n < 0 || n >= this.length) return undefined;
    var node = this.first;
    while (n--) node = node.next;
    return node;
  },

  pop: function() {
    return this.length ? this.remove(this.last) : undefined;
  },

  shift: function() {
    return this.length ? this.remove(this.first) : undefined;
  },

  // stubs - should be implemented by concrete list types
  insertAfter:  function() {},
  push:         function() {},
  remove:       function() {},

  extend: {
    Node: new JS.Class({
      initialize: function(data) {
        this.data = data;
        this.prev = this.next = this.list = null;
      }
    })
  }
});

LinkedList.Doubly = new JS.Class('LinkedList.Doubly', LinkedList, {
  insertAt: function(n, newNode) {
    if (n < 0 || n >= this.length) return;
    this.insertBefore(this.at(n), newNode);
  },

  unshift: function(newNode) {
    this.length > 0
        ? this.insertBefore(this.first, newNode)
        : this.push(newNode);
  },

  insertBefore: function() {}
});

LinkedList.insertTemplate = function(prev, next, pos) {
  return function(node, newNode) {
    if (node.list !== this) return;
    newNode[prev] = node;
    newNode[next] = node[next];
    node[next] = (node[next][prev] = newNode);
    if (newNode[prev] === this[pos]) this[pos] = newNode;
    newNode.list = this;
    this.length++;
  };
};

LinkedList.Doubly.Circular = new JS.Class('LinkedList.Doubly.Circular', LinkedList.Doubly, {
  insertAfter: LinkedList.insertTemplate('prev', 'next', 'last'),
  insertBefore: LinkedList.insertTemplate('next', 'prev', 'first'),

  push: function(newNode) {
    if (this.length)
      return this.insertAfter(this.last, newNode);

    this.first = this.last =
        newNode.prev = newNode.next = newNode;

    newNode.list = this;
    this.length = 1;
  },

  remove: function(removed) {
    if (removed.list !== this || this.length === 0) return null;
    if (this.length > 1) {
      removed.prev.next = removed.next;
      removed.next.prev = removed.prev;
      if (removed === this.first) this.first = removed.next;
      if (removed === this.last) this.last = removed.prev;
    } else {
      this.first = this.last = null;
    }
    removed.prev = removed.next = removed.list = null;
    this.length--;
    return removed;
  }
});

exports.LinkedList = LinkedList;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var MethodChain = function(base) {
  var queue      = [],
      baseObject = base || {};

  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };

  this.__exec__ = function(base) {
    return MethodChain.exec(queue, base || baseObject);
  };
};

MethodChain.exec = function(queue, object) {
  var method, property, i, n;
  loop: for (i = 0, n = queue.length; i < n; i++) {
    method = queue[i];
    if (object instanceof MethodChain) {
      object.____(method.func, method.args);
      continue;
    }
    switch (typeof method.func) {
      case 'string':    property = object[method.func];       break;
      case 'function':  property = method.func;               break;
      case 'object':    object = method.func; continue loop;  break;
    }
    object = (typeof property === 'function')
        ? property.apply(object, method.args)
        : property;
  }
  return object;
};

MethodChain.displayName = 'MethodChain';

MethodChain.toString = function() {
  return 'MethodChain';
};

MethodChain.prototype = {
  __: function() {
    var base = arguments[0],
        args, i, n;

    switch (typeof base) {
      case 'object': case 'function':
        args = [];
        for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
        this.____(base, args);
    }
    return this;
  },

  toFunction: function() {
    var chain = this;
    return function(object) { return chain.__exec__(object); };
  }
};

MethodChain.reserved = (function() {
  var names = [], key;
  for (key in new MethodChain) names.push(key);
  return new RegExp('^(?:' + names.join('|') + ')$');
})();

MethodChain.addMethod = function(name) {
  if (this.reserved.test(name)) return;
  var func = this.prototype[name] = function() {
    this.____(name, arguments);
    return this;
  };
  func.displayName = 'MethodChain#' + name;
};

MethodChain.addMethods = function(object) {
  var methods = [], property, i;

  for (property in object) {
    if (Number(property) !== property) methods.push(property);
  }

  if (object instanceof Array) {
    i = object.length;
    while (i--) {
      if (typeof object[i] === 'string') methods.push(object[i]);
    }
  }
  i = methods.length;
  while (i--) this.addMethod(methods[i]);

  object.__fns__ && this.addMethods(object.__fns__);
  object.prototype && this.addMethods(object.prototype);
};

JS.Method.added(function(method) {
  if (method && method.name) MethodChain.addMethod(method.name);
});

JS.Kernel.include({
  wait: function(time) {
    var chain = new MethodChain(), self = this;

    if (typeof time === 'number')
      JS.ENV.setTimeout(function() { chain.__exec__(self) }, time * 1000);

    if (this.forEach && typeof time === 'function')
      this.forEach(function(item) {
        JS.ENV.setTimeout(function() { chain.__exec__(item) }, time.apply(this, arguments) * 1000);
      });

    return chain;
  },

  __: function() {
    var base = arguments[0],
        args = [],
        i, n;

    for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
    return  (typeof base === 'object' && base) ||
            (typeof base === 'function' && base.apply(this, args)) ||
            this;
  }
});

(function() {
  var queue = JS.Module.__queue__,
      n     = queue.length;

  while (n--) MethodChain.addMethods(queue[n]);
  delete JS.Module.__queue__;
})();

MethodChain.addMethods([
  "abs", "acos", "addEventListener", "anchor", "animation", "appendChild",
  "apply", "arguments", "arity", "asin", "atan", "atan2", "attributes", "auto",
  "background", "baseURI", "baseURIObject", "big", "bind", "blink", "blur",
  "bold", "border", "bottom", "bubbles", "call", "caller", "cancelBubble",
  "cancelable", "ceil", "charAt", "charCodeAt", "childElementCount",
  "childNodes", "children", "classList", "className", "clear", "click",
  "clientHeight", "clientLeft", "clientTop", "clientWidth", "clip",
  "cloneNode", "color", "columns", "compareDocumentPosition", "concat",
  "constructor", "contains", "content", "contentEditable", "cos", "create",
  "css", "currentTarget", "cursor", "dataset", "defaultPrevented",
  "defineProperties", "defineProperty", "dir", "direction", "dispatchEvent",
  "display", "endsWith", "eval", "eventPhase", "every", "exec", "exp",
  "explicitOriginalTarget", "filter", "firstChild", "firstElementChild",
  "fixed", "flex", "float", "floor", "focus", "font", "fontcolor", "fontsize",
  "forEach", "freeze", "fromCharCode", "getAttribute", "getAttributeNS",
  "getAttributeNode", "getAttributeNodeNS", "getBoundingClientRect",
  "getClientRects", "getDate", "getDay", "getElementsByClassName",
  "getElementsByTagName", "getElementsByTagNameNS", "getFeature",
  "getFullYear", "getHours", "getMilliseconds", "getMinutes", "getMonth",
  "getOwnPropertyDescriptor", "getOwnPropertyNames", "getPrototypeOf",
  "getSeconds", "getTime", "getTimezoneOffset", "getUTCDate", "getUTCDay",
  "getUTCFullYear", "getUTCHours", "getUTCMilliseconds", "getUTCMinutes",
  "getUTCMonth", "getUTCSeconds", "getUserData", "getYear", "global",
  "hasAttribute", "hasAttributeNS", "hasAttributes", "hasChildNodes",
  "hasOwnProperty", "height", "hyphens", "icon", "id", "ignoreCase", "imul",
  "indexOf", "inherit", "initEvent", "initial", "innerHTML",
  "insertAdjacentHTML", "insertBefore", "is", "isArray", "isContentEditable",
  "isDefaultNamespace", "isEqualNode", "isExtensible", "isFinite", "isFrozen",
  "isGenerator", "isInteger", "isNaN", "isPrototypeOf", "isSameNode",
  "isSealed", "isSupported", "isTrusted", "italics", "join", "keys", "lang",
  "lastChild", "lastElementChild", "lastIndex", "lastIndexOf", "left",
  "length", "link", "localName", "localeCompare", "log", "lookupNamespaceURI",
  "lookupPrefix", "map", "margin", "marks", "mask", "match", "max", "min",
  "mozMatchesSelector", "mozRequestFullScreen", "multiline", "name",
  "namespaceURI", "nextElementSibling", "nextSibling", "nodeArg", "nodeName",
  "nodePrincipal", "nodeType", "nodeValue", "none", "normal", "normalize",
  "now", "offsetHeight", "offsetLeft", "offsetParent", "offsetTop",
  "offsetWidth", "opacity", "order", "originalTarget", "orphans", "otherNode",
  "outerHTML", "outline", "overflow", "ownerDocument", "padding", "parentNode",
  "parse", "perspective", "pop", "position", "pow", "prefix", "preventBubble",
  "preventCapture", "preventDefault", "preventExtensions",
  "previousElementSibling", "previousSibling", "propertyIsEnumerable",
  "prototype", "push", "querySelector", "querySelectorAll", "quote", "quotes",
  "random", "reduce", "reduceRight", "removeAttribute", "removeAttributeNS",
  "removeAttributeNode", "removeChild", "removeEventListener", "replace",
  "replaceChild", "resize", "reverse", "right", "round", "schemaTypeInfo",
  "scrollHeight", "scrollIntoView", "scrollLeft", "scrollTop", "scrollWidth",
  "seal", "search", "setAttribute", "setAttributeNS", "setAttributeNode",
  "setAttributeNodeNS", "setCapture", "setDate", "setFullYear", "setHours",
  "setIdAttribute", "setIdAttributeNS", "setIdAttributeNode",
  "setMilliseconds", "setMinutes", "setMonth", "setSeconds", "setTime",
  "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds",
  "setUTCMinutes", "setUTCMonth", "setUTCSeconds", "setUserData", "setYear",
  "shift", "sin", "slice", "small", "some", "sort", "source", "spellcheck",
  "splice", "split", "sqrt", "startsWith", "sticky",
  "stopImmediatePropagation", "stopPropagation", "strike", "style", "sub",
  "substr", "substring", "sup", "tabIndex", "tagName", "tan", "target", "test",
  "textContent", "timeStamp", "title", "toDateString", "toExponential",
  "toFixed", "toGMTString", "toISOString", "toInteger", "toJSON",
  "toLocaleDateString", "toLocaleFormat", "toLocaleLowerCase",
  "toLocaleString", "toLocaleTimeString", "toLocaleUpperCase", "toLowerCase",
  "toPrecision", "toSource", "toString", "toTimeString", "toUTCString",
  "toUpperCase", "top", "transform", "transition", "trim", "trimLeft",
  "trimRight", "type", "unshift", "unwatch", "valueOf", "visibility", "w3c",
  "watch", "widows", "width"
]);

exports.MethodChain = MethodChain;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var Proxy = new JS.Module('Proxy', {
  extend: {
    Virtual: new JS.Class({
      initialize: function(klass) {
        var bridge     = function() {},
            proxy      = new JS.Class(),
            delegators = {},
            method, func;

        bridge.prototype = klass.prototype;

        for (method in klass.prototype) {
          func = klass.prototype[method];
          if (typeof func === 'function' && func !== klass) func = this.klass.forward(method);
          delegators[method] = func;
        }

        proxy.include({
          initialize: function() {
            var args    = arguments,
                subject = null;

            this.__getSubject__ = function() {
              subject = new bridge;
              klass.apply(subject, args);
              return (this.__getSubject__ = function() { return subject; })();
            };
          },
          klass: klass,
          constructor: klass
        }, {_resolve: false});

        proxy.include(new JS.Module(delegators), {_resolve: false});
        proxy.include(this.klass.InstanceMethods);
        return proxy;
      },

      extend: {
        forward: function(name) {
          return function() {
            var subject = this.__getSubject__();
            return subject[name].apply(subject, arguments);
          };
        },

        InstanceMethods: new JS.Module({
          extend: function(source) {
            this.__getSubject__().extend(source);
            var method, func;
            for (method in source) {
              func = source[method];
              if (typeof func  === 'function') func = Proxy.Virtual.forward(method);
              this[method] = func;
            }
          }
        })
      }
    })
  }
});

exports.Proxy = Proxy;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Hash = js.Hash || require('./hash').Hash;

  if (E) exports.JS = exports;
  factory(js, Enumerable, Hash, E ? exports : js);

})(function(JS, Enumerable, Hash, exports) {
'use strict';

var Range = new JS.Class('Range', {
  include: Enumerable || {},

  extend: {
    compare: function(one, another) {
      return JS.isType(one, Object)
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    },

    succ: function(object) {
      if (JS.isType(object, 'string')) {
        var chars = object.split(''),
            i     = chars.length,
            next  = null,
            set   = null,
            roll  = true;

        while (roll && i--) {
          next = null;

          Enumerable.forEach.call(this.SETS, function(name) {
            var range = this[name];
            if (chars[i] !== range._last) return;
            set  = range;
            next = range._first;
          }, this);

          if (next === null) {
            next = String.fromCharCode(chars[i].charCodeAt(0) + 1);
            roll = false;
          }
          chars[i] = next;
        }

        if (roll) chars.unshift( set._first === '0' ? '1' : set._first );

        return chars.join('');
      }

      if (JS.isType(object, 'number')) return object + 1;
      if (typeof object.succ === 'function') return object.succ();
      return null;
    }
  },

  initialize: function(first, last, excludeEnd) {
    this._first = first;
    this._last  = last;
    this._excludeEnd = !!excludeEnd;
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    var needle  = this._first,
        exclude = this._excludeEnd;

    if (this.klass.compare(needle, this._last) > 0)
      return;

    var check = JS.isType(needle, Object)
        ? function(a,b) { return a.compareTo(b) < 0 }
        : function(a,b) { return a !== b };

    while (check(needle, this._last)) {
      block.call(context, needle);
      needle = this.klass.succ(needle);
      if (JS.isType(needle, 'string') && needle.length > this._last.length) {
        exclude = true;
        break;
      }
    }

    if (this.klass.compare(needle, this._last) > 0)
      return;

    if (!exclude) block.call(context, needle);
  },

  equals: function(other) {
    return JS.isType(other, Range) &&
           Enumerable.areEqual(other._first, this._first) &&
           Enumerable.areEqual(other._last, this._last) &&
           other._excludeEnd === this._excludeEnd;
  },

  hash: function() {
    var hash = Hash.codeFor(this._first) + '..';
    if (this._excludeEnd) hash += '.';
    hash += Hash.codeFor(this._last);
    return hash;
  },

  first: function() { return this._first },

  last:  function() { return this._last  },

  excludesEnd: function() { return this._excludeEnd },

  includes: function(object) {
    var a = this.klass.compare(object, this._first),
        b = this.klass.compare(object, this._last);

    return a >= 0 && (this._excludeEnd ? b < 0 : b <= 0);
  },

  step: function(n, block, context) {
    if (!block) return this.enumFor('step', n);
    block = Enumerable.toFn(block);

    var i = 0;
    this.forEach(function(member) {
      if (i % n === 0) block.call(context, member);
      i += 1;
    });
  },

  toString: function() {
    var str = this._first.toString() + '..';
    if (this._excludeEnd) str += '.';
    str += this._last.toString();
    return str;
  }
});

Range.extend({
  DIGITS:     new Range('0','9'),
  LOWERCASE:  new Range('a','z'),
  UPPERCASE:  new Range('A','Z'),
  SETS:       ['DIGITS', 'LOWERCASE', 'UPPERCASE']
});

Range.alias({
  begin:  'first',
  end:    'last',
  covers: 'includes',
  match:  'includes',
  member: 'includes'
});

exports.Range = Range;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Observable = js.Observable || require('./observable').Observable,
      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      Console    = js.Console    || require('./console').Console;

  if (E) exports.JS = exports;
  factory(js, Observable, Enumerable, Console, E ? exports : js);

})(function(JS, Observable, Enumerable, Console, exports) {
'use strict';

var StackTrace = new JS.Module('StackTrace', {
  extend: {
    logger: new JS.Singleton({
      include: Console,
      active: false,

      update: function(event, data) {
        if (!this.active) return;
        switch (event) {
          case 'call':    return this.logEnter(data);
          case 'return':  return this.logExit(data);
          case 'error':   return this.logError(data);
        }
      },

      indent: function() {
        var indent = ' ';
        StackTrace.forEach(function() { indent += '|  ' });
        return indent;
      },

      fullName: function(frame) {
        var C        = Console,
            method   = frame.method,
            env      = frame.env,
            name     = method.name,
            module   = method.module;

        return C.nameOf(env) +
                (module === env ? '' : '(' + C.nameOf(module) + ')') +
                '#' + name;
      },

      logEnter: function(frame) {
        var fullName = this.fullName(frame),
            args = Console.convert(frame.args).replace(/^\[/, '(').replace(/\]$/, ')');

        if (this._open) this.puts();

        this.reset();
        this.print(' ');
        this.consoleFormat('bgblack', 'white');
        this.print('TRACE');
        this.reset();
        this.print(this.indent());
        this.blue();
        this.print(fullName);
        this.red();
        this.print(args);
        this.reset();

        this._open = true;
      },

      logExit: function(frame) {
        var fullName = this.fullName(frame);

        if (frame.leaf) {
          this.consoleFormat('red');
          this.print(' --> ');
        } else {
          this.reset();
          this.print(' ');
          this.consoleFormat('bgblack', 'white');
          this.print('TRACE');
          this.reset();
          this.print(this.indent());
          this.blue();
          this.print(fullName);
          this.red();
          this.print(' --> ');
        }
        this.consoleFormat('yellow');
        this.puts(Console.convert(frame.result));
        this.reset();
        this.print('');
        this._open = false;
      },

      logError: function(e) {
        this.puts();
        this.reset();
        this.print(' ');
        this.consoleFormat('bgred', 'white');
        this.print('ERROR');
        this.consoleFormat('bold', 'red');
        this.print(' ' + Console.convert(e));
        this.reset();
        this.print(' thrown by ');
        this.bold();
        this.print(StackTrace.top().name);
        this.reset();
        this.puts('. Backtrace:');
        this.backtrace();
      },

      backtrace: function() {
        StackTrace.reverseForEach(function(frame) {
          var args = Console.convert(frame.args).replace(/^\[/, '(').replace(/\]$/, ')');
          this.print('      | ');
          this.consoleFormat('blue');
          this.print(frame.name);
          this.red();
          this.print(args);
          this.reset();
          this.puts(' in ');
          this.print('      |  ');
          this.bold();
          this.puts(Console.convert(frame.object));
        }, this);
        this.reset();
        this.puts();
      }
    }),

    include: [Observable, Enumerable],

    wrap: function(func, method, env) {
      var self = StackTrace;
      var wrapper = function() {
        var result;
        self.push(this, method, env, Array.prototype.slice.call(arguments));

        try { result = func.apply(this, arguments) }
        catch (e) { self.error(e) }

        self.pop(result);
        return result;
      };
      wrapper.toString = function() { return func.toString() };
      wrapper.__traced__ = true;
      return wrapper;
    },

    stack: [],

    forEach: function(block, context) {
      Enumerable.forEach.call(this.stack, block, context);
    },

    top: function() {
      return this.stack[this.stack.length - 1] || {};
    },

    push: function(object, method, env, args) {
      var stack = this.stack;
      if (stack.length > 0) stack[stack.length - 1].leaf = false;

      var frame = {
        object: object,
        method: method,
        env:    env,
        args:   args,
        leaf:   true
      };
      frame.name = this.logger.fullName(frame);
      this.notifyObservers('call', frame);
      stack.push(frame);
    },

    pop: function(result) {
      var frame = this.stack.pop();
      frame.result = result;
      this.notifyObservers('return', frame);
    },

    error: function(e) {
      if (e.logged) throw e;
      e.logged = true;
      this.notifyObservers('error', e);
      this.stack = [];
      throw e;
    }
  }
});

StackTrace.addObserver(StackTrace.logger);

exports.StackTrace = StackTrace;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var State = new JS.Module('State', {
  __getState__: function(state) {
    if (typeof state === 'object') return state;
    if (typeof state === 'string') return (this.states || {})[state];
    return {};
  },

  setState: function(state) {
    this.__state__ = this.__getState__(state);
    State.addMethods(this.__state__, this.klass);
  },

  inState: function() {
    var i = arguments.length;
    while (i--) {
      if (this.__state__ === this.__getState__(arguments[i])) return true;
    }
    return false;
  },

  extend: {
    ClassMethods: new JS.Module({
      states: function(block) {
        this.define('states', State.buildCollection(this, block));
      }
    }),

    included: function(klass) {
      klass.extend(this.ClassMethods);
    },

    stub: function() { return this; },

    buildStubs: function(stubs, collection, states) {
      var state, method;
      for (state in states) {
        collection[state] = {};
        for (method in states[state]) stubs[method] = this.stub;
      }
    },

    findStates: function(collections, name) {
      var i = collections.length, results = [];
      while (i--) {
        if (collections[i].hasOwnProperty(name))
          results.push(collections[i][name]);
      }
      return results;
    },

    buildCollection: function(module, states) {
      var stubs       = {},
          collection  = {},
          superstates = module.lookup('states'),
          state, klass, methods, name, mixins, i, n;

      this.buildStubs(stubs, collection, states);

      for (i = 0, n = superstates.length; i < n;  i++)
        this.buildStubs(stubs, collection, superstates[i]);

      for (state in collection) {
        klass  = new JS.Class(states[state]);
        mixins = this.findStates(superstates, state);

        i = mixins.length;
        while (i--) {
          if (mixins[i]) klass.include(mixins[i].klass);
        }

        methods = {};
        for (name in stubs) {
          if (!klass.prototype[name]) methods[name] = stubs[name];
        }
        klass.include(methods);
        collection[state] = new klass;
      }
      if (module.__tgt__) this.addMethods(stubs, module.__tgt__.klass);
      return collection;
    },

    addMethods: function(state, klass) {
      if (!klass) return;

      var methods = {},
          proto   = klass.prototype,
          method;

      for (method in state) {
        if (proto[method]) continue;
        klass.define(method, this.wrapped(method));
      }
    },

    wrapped: function(method) {
      return function() {
        var func = (this.__state__ || {})[method];
        return func ? func.apply(this, arguments) : this;
      };
    }
  }
});

exports.State = State;
});

(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Hash = js.Hash || require('./hash').Hash;

  if (E) exports.JS = exports;
  factory(js, Hash, E ? exports : js);

})(function(JS, Hash, exports) {
'use strict';

var TSort = new JS.Module('TSort', {
  extend: {
    Cyclic: new JS.Class(Error)
  },

  tsort: function() {
    var result = [];
    this.tsortEach(result.push, result);
    return result;
  },

  tsortEach: function(block, context) {
    this.eachStronglyConnectedComponent(function(component) {
      if (component.length === 1)
        block.call(context, component[0]);
      else
        throw new TSort.Cyclic('topological sort failed: ' + component.toString());
    });
  },

  stronglyConnectedComponents: function() {
    var result = [];
    this.eachStronglyConnectedComponent(result.push, result);
    return result;
  },

  eachStronglyConnectedComponent: function(block, context) {
    var idMap = new Hash(),
        stack = [];

    this.tsortEachNode(function(node) {
      if (idMap.hasKey(node)) return;
      this.eachStronglyConnectedComponentFrom(node, idMap, stack, function(child) {
        block.call(context, child);
      });
    }, this);
  },

  eachStronglyConnectedComponentFrom: function(node, idMap, stack, block, context) {
    var nodeId      = idMap.size,
        stackLength = stack.length,
        minimumId   = nodeId,
        component, i;

    idMap.store(node, nodeId);
    stack.push(node);

    this.tsortEachChild(node, function(child) {
      if (idMap.hasKey(child)) {
        var childId = idMap.get(child);
        if (child !== undefined && childId < minimumId) minimumId = childId;
      } else {
        var subMinimumId = this.eachStronglyConnectedComponentFrom(child, idMap, stack, block, context);
        if (subMinimumId < minimumId) minimumId = subMinimumId;
      }
    }, this);

    if (nodeId === minimumId) {
      component = stack.splice(stackLength, stack.length - stackLength);
      i = component.length;
      while (i--) idMap.store(component[i], undefined);
      block.call(context, component);
    }

    return minimumId;
  },

  tsortEachNode: function() {
    throw new JS.NotImplementedError('tsortEachNode');
  },

  tsortEachChild: function() {
    throw new JS.NotImplementedError('tsortEachChild');
  }
});

exports.TSort = TSort;
});
;

