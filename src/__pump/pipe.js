define(function (require, exports, module) {


	var _ = require('lodash');

	/**
	 * Creates a pipe on this
	 */
	exports.addPipe = function addPipe() {

		var id, lines, options;

		// [1] parse out arguments
		if (_.isString(arguments[0])) {
			// arguments = [id, lines, options]
			id      = arguments[0];
			lines   = arguments[1];
			options = arguments[2] || {};

		} else {
			// arguments = [] || [lines] || [lines, options]
			id      = _.uniqueId('pipe');
			lines   = arguments[0];
			options = arguments[1] || {};
		}

		// [2] set source to the pump's source
		options.source = this.source;

		// [3] create pipe
		var _pipe = this._buildPipe(lines, options);

		// [4] store
		this.pipes[id] = _pipe;

		return _pipe;
	};
	exports.pipe = exports.addPipe;


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
