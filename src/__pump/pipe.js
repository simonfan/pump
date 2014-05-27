define(function (require, exports, module) {

	/**
	 * [addDestination description]
	 * @param {[type]} destinations [description]
	 */
	exports.addDestination = function pipeAddDestination(destinations) {
		this.clearCache();

		// convert added destinations to array.
		destinations = _.isArray(destinations) ? destinations : [destinations];

		if (!this.destinations) {
			// create a destinations object if none is set.
			this.destinations = [];
		}

		// add new destinations to old ones.
		this.destinations = this.destinations.concat(destinations);

		return this;

	};

	/**
	 * [removeDestination description]
	 * @param  {[type]} criteria [description]
	 * @param  {[type]} context  [description]
	 * @return {[type]}          [description]
	 */
	exports.removeDestination = function pipeRmDestination(criteria, context) {
		this.clearCache();

		_.remove(this.destinations, criteria, context);

		return this;
	};

});
