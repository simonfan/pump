/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');

	/**
	 * Creates a pipe on this
	 */
	exports.addPipe = function addPipe() {

		var id, map, options;

		// [1] parse out arguments
		if (_.isString(arguments[0])) {
			// arguments = [id, map, options]
			id      = arguments[0];
			map     = arguments[1];
			options = arguments[2] || {};

		} else {
			// arguments = [] || [map] || [map, options]
			id      = _.uniqueId('pipe');
			map     = arguments[0];
			options = arguments[1] || {};
		}

		// [2] set source to the pump's source
		options.source = this.source;

		// [3] create pipe
		var _pipe = this._buildPipe(map, options);

		// [4] store
		this.pipes[id] = _pipe;

		return _pipe;
	};
	exports.pipe = exports.addPipe;

	exports.getPipe = function getPipe(id) {
		return this.pipes[id];
	};

	/**
	 * Removes the pipe.
	 *
	 * @param  {[type]} criteria [description]
	 * @param  {[type]} context  [description]
	 * @return {[type]}          [description]
	 */
	exports.removePipe = function removePipe(criteria, context) {

		if (_.isFunction(criteria)) {
			// function criteria
			_.each(this.pipes, function (pipe, pid) {

				if (criteria.call(context, pipe, pid)) {

					delete this.pipes[pid];
				}

			}, this);

		} else if (_.isArray(criteria)) {
			// array of ids
			_.each(criteria, function (pipe, pid) {

				if (_.contains(criteria, pid)) {
					delete this.pipes[pid];
				}

			}, this);

		} else {
			// single id.
			delete this.pipes[criteria];

		}

		return this;
	};
	exports.unpipe = exports.removePipe;
});
