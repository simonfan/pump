/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {

	'use strict';

	var _ = require('lodash');

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
		_.each(data, function (value, key) {

			// NO CACHING HERE,
			// CACHE IS DONE AT PIPE-LEVEL
			set.call(this, this.source, key, value);

		}, this);

		// [2] pump (pipeids, force = true)
		this.pump(pipeIds, null, true);

		return this;
	};


});
