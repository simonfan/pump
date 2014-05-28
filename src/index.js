//     pump
//     (c) simonfan
//     pump is licensed under the MIT terms.

/**
 * AMD and CJS module.
 *
 * @module pump
 */

/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var subject = require('subject'),
		_       = require('lodash'),
		pipe    = require('pipe');


	/**
	 * Properties that are getter setters
	 * for all pipes generated by this pump.
	 *
	 * @type {Array}
	 */
	var settersAndGetters = ['srcGet', 'srcSet', 'destGet', 'destSet'];

	var pump = module.exports = subject({

		/**
		 * [initialize description]
		 * @param  {[type]} pipes
		 *         Pipe definitions: { pipeId: { pipelines } }
		 * @return {[type]}       [description]
		 */
		initialize: function initializePump(source, pipes) {

			/**
			 * Source of all pipes that will come from this pump.
			 *
			 * @type {[type]}
			 */
			this.source = source;

			/**
			 * The pipe builder.
			 * @type {[type]}
			 */
			this._buildPipe = pipe.extend(_.pick(this, settersAndGetters));

			/**
			 * Hash onto which pipes are stored.
			 *
			 * @type {Object}
			 */
			this.pipes = {};

			// build pipes defined on initialization.
			_.each(pipes, function (lines, id) {
				this.pipe(id, lines);
			}, this);
		},
	});

	pump.assignProto(require('./__pump/pipe'))
		.assignProto(require('./__pump/streams'));
});
