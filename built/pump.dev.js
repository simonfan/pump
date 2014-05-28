/* jshint ignore:start */

/* jshint ignore:end */

define('__pump/pipe',['require','exports','module','lodash'],function (require, exports, module) {


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

/* jshint ignore:start */

/* jshint ignore:end */

define('__pump/streams',['require','exports','module','lodash','q'],function (require, exports, module) {


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

//     pump
//     (c) simonfan
//     pump is licensed under the MIT terms.

/**
 * AMD and CJS module.
 *
 * @module pump
 */

/* jshint ignore:start */

/* jshint ignore:end */

define('pump',['require','exports','module','subject','lodash','pipe','./__pump/pipe','./__pump/streams'],function (require, exports, module) {
	


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

		from: function pumpFrom(source) {
			this.source = source;

			// update all pipes sources as well
			_.each(this.pipes, function (pipe) {

				pipe.from(source);

			});

			return this;
		},

		get: function get(object, prop) {
			return object[prop];
		},

		set: function set(object, prop, value) {
			object[prop] = value;
			return this;
		},
	});

	pump.assignProto(require('./__pump/pipe'))
		.assignProto(require('./__pump/streams'));
});

