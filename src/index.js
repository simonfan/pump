//     Pump
//     (c) simonfan
//     Pump is licensed under the MIT terms.

/**
 * AMD and CJS module.
 *
 * @module Pump
 */

/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var subject = require('subject'),
		_       = require('lodash');


	var pump = module.exports = subject({

		/**
		 * [initialize description]
		 * @param  {[type]} pipes
		 *         Pipe definitions: { $srcProp: { $destination(object), $destProp(string), $main(boolean), $gtter and setters }}
		 * @return {[type]}       [description]
		 */
		initialize: function initializePump(pipes) {


			this.pipes = {};
			_.each(pipes, this.pipe, this);
		},
	});

});
