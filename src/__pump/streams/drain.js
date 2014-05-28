/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {

	'use strict';

	var _ = require('lodash'),
		q = require('q');

	/**
	 * This method is called if no pipe is found for draining.
	 * Returns the pipe from which the properties should be drained from.
	 * By default returns the first pipe
	 *
	 * @type {String}
	 */
	exports.drainingPipe = void(0);

	/**
	 * [_drainingPipe description]
	 * @private
	 * @param  {[type]} properties [description]
	 * @return {[type]}            [description]
	 */
	function _drainingPipe(properties) {
		if (_.isString(this.drainingPipe)) {
			// this.drainingPipe = 'pipe-id'
			return this.pipes[this.drainingPipe];

		} else if (_.isFunction(this.drainingPipe)) {
			// this.drainingPipe = function () {}
			return this.drainingPipe(properties);

		} else if (_.isObject(this.drainingPipe)) {
			// this.drainingPipe = pipe
			return this.drainingPipe;
		}
	}

	/**
	 * Drains from a specific pipe.
	 *
	 * @param  {[type]} pipeId [description]
	 * @return {[type]}        [description]
	 */
	exports.drain = function pumpDrain(pipeId, properties, force) {
		// only drain from a single pipe.
		var pipe = this.pipes[pipeId] || _drainingPipe.call(this, properties);

		if (!pipe) {
			throw new Error('Pipe "' + pipeId + '" not found.');
		}

		// NO CACHING HERE,
		// CACHE IS DONE AT PIPE-LEVEL
		return pipe.drain(properties, force);
	};

	/**
	 * Set a pipe to drain from.
	 *
	 * @param  {[type]} pipe_id_or_pipe_getter [description]
	 * @return {[type]}        [description]
	 */
	exports.setDrainingPipe = function setDrainingPipe(pipe_id_or_pipe_getter) {
		this.drainingPipe = pipe_id_or_pipe_getter;

		return this;
	};

});
