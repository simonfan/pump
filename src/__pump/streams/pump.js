/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {

	'use strict';

	var _ = require('lodash'),
		q = require('q');

	/**
	 * Picks the pipes and invokes their .pump method.
	 *
	 * @param  {[type]} pipeIds    [description]
	 * @param  {[type]} properties [description]
	 * @param  {[type]} force      [description]
	 * @return {[type]}            [description]
	 */
	exports.pump = function pumpPump(pipeIds, properties, force) {

		// pipes that should run the action
		var pipes;

		// pick pipes if pipeIds was defined
		if (pipeIds) {
			// pipeIds must be an array
			pipeIds = _.isArray(pipeIds) ? pipeIds : [pipeIds];

			// pick
			pipes = _.pick(this.pipes, pipeIds);

		} else {
			// pipes are all pipes available.
			pipes = this.pipes;
		}

		// invoke pump on all pipes and return the promise
		var results = _.map(pipes, function (pipe) {
			// NO CACHING HERE,
			// CACHE IS DONE AT PIPE-LEVEL
			return pipe.pump(properties, force);
		});

		return q.all(results);
	};

});
