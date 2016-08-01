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
