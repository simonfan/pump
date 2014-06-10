/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {

	'use strict';

	var _ = require('lodash');

	/**
	 * Drains from a specific pipe.
	 *
	 * @param  {[type]} pipeId [description]
	 * @return {[type]}        [description]
	 */
	exports.drain = function pumpDrain(pipeId, properties, force) {

		if (!pipeId && pipeId !== 0) {
			throw new Error('Drain must take a pipe id as first argument.');
		}

		// only drain from a single pipe.
		var pipe = this.pipes[pipeId];

		if (!pipe) {
			throw new Error('Pipe "' + pipeId + '" not found.');
		}

		// NO CACHING HERE,
		// CACHE IS DONE AT PIPE-LEVEL
		pipe.drain(properties, force);

		return this;
	};

});
