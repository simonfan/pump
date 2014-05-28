/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {


	var _ = require('lodash'),
		q = require('q');


	function execPipeStream(action, pipeIds) {

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

			return pipe[action]();
		});

		return q.all(results);

	}

	exports.pump = _.partial(execPipeStream, 'pump');

	exports.drain = _.partial(execPipeStream, 'drain');

	exports.inject = function inject(data, pipeIds) {


		var set = this.srcSet || this.set;


		// [0] throw error if there is no source in the pump object.
		if (!this.source) {
			throw new Error('No source for pump');
		}

		// [1] SET all data onto the SOURCE
		var srcSetRes = _.map(data, function (value, key) {

			return set.call(this, this.source, key, value);

		}, this);


		// [2] wait for all srcSets
		return q.all(srcSetRes)
			// [2.1] then invoke pump on success
			//       wrap in a method in order to guarantee
			//       pump is invoked with NO ARGUMENTS
			.then(_.bind(function() { this.pump(pipeIds); }, this))
			// [2.2] or throw error
			.fail(function (e) { throw e; });
	};


});
