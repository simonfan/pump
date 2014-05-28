/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {

	'use strict';

	var _ = require('lodash'),
		q = require('q');

	/**
	 * Sets data onto source
	 * and pumps data into pipes.
	 *
	 * @param  {[type]} data    [description]
	 * @param  {[type]} pipeIds [description]
	 * @return {[type]}         [description]
	 */
	exports.inject = function inject(data, pipeIds) {


		var set = this.srcSet || this.set;


		// [0] throw error if there is no source in the pump object.
		if (!this.source) {
			throw new Error('No source for pump');
		}

		// [1] SET all data onto the SOURCE
		var srcSetRes = _.map(data, function (value, key) {

			// NO CACHING HERE,
			// CACHE IS DONE AT PIPE-LEVEL
			return set.call(this, this.source, key, value);

		}, this);


		// [2] wait for all srcSets
		return q.all(srcSetRes)
			// [2.1] then invoke pump on success
			//       wrap in a method in order to guarantee
			//       pump is invoked with NO ARGUMENTS
			.then(_.bind(function () { this.pump(pipeIds); }, this))
			// [2.2] or throw error
			.fail(function (e) { throw e; });
	};


});
