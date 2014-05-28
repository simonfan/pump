/* jshint ignore:start */

/* jshint ignore:end */

define('__pump/pipe',['require','exports','module','lodash'],function (require, exports, module) {
	

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
		// [4.1] if this is the first pipe of the pump,
		//       set it as the drainingPipe
		this.pipes[id] = _pipe;

		return _pipe;
	};
	exports.pipe = exports.addPipe;

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

/* jshint ignore:start */

/* jshint ignore:end */

define('__pump/streams/pump',['require','exports','module','lodash','q'],function (require, exports, module) {

	

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

/* jshint ignore:start */

/* jshint ignore:end */

define('__pump/streams/drain',['require','exports','module','lodash','q'],function (require, exports, module) {

	

	var _ = require('lodash'),
		q = require('q');

	/**
	 * This method is called if no pipe is found for draining.
	 * Returns the pipe from which the properties should be drained from.
	 * By default returns the first pipe
	 *
	 * @type {String}
	 */
	exports.drainingPipe = void(0);

	/**
	 * [_drainingPipe description]
	 * @private
	 * @param  {[type]} properties [description]
	 * @return {[type]}            [description]
	 */
	function _drainingPipe(properties) {
		if (_.isString(this.drainingPipe)) {
			// this.drainingPipe = 'pipe-id'
			return this.pipes[this.drainingPipe];

		} else if (_.isFunction(this.drainingPipe)) {
			// this.drainingPipe = function () {}
			return this.drainingPipe(properties);

		} else if (_.isObject(this.drainingPipe)) {
			// this.drainingPipe = pipe
			return this.drainingPipe;
		}
	}

	/**
	 * Drains from a specific pipe.
	 *
	 * @param  {[type]} pipeId [description]
	 * @return {[type]}        [description]
	 */
	exports.drain = function pumpDrain(pipeId, properties, force) {
		// only drain from a single pipe.
		var pipe = this.pipes[pipeId] || _drainingPipe.call(this, properties);

		if (!pipe) {
			throw new Error('Pipe "' + pipeId + '" not found.');
		}

		// NO CACHING HERE,
		// CACHE IS DONE AT PIPE-LEVEL
		return pipe.drain(properties, force);
	};

	/**
	 * Set a pipe to drain from.
	 *
	 * @param  {[type]} pipe_id_or_pipe_getter [description]
	 * @return {[type]}        [description]
	 */
	exports.setDrainingPipe = function setDrainingPipe(pipe_id_or_pipe_getter) {
		this.drainingPipe = pipe_id_or_pipe_getter;

		return this;
	};

});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pump/streams/inject',['require','exports','module','lodash','q'],function (require, exports, module) {

	

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

define('pump',['require','exports','module','subject','lodash','pipe','./__pump/pipe','./__pump/streams/pump','./__pump/streams/drain','./__pump/streams/inject'],function (require, exports, module) {
	


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
		.assignProto(require('./__pump/streams/pump'))
		.assignProto(require('./__pump/streams/drain'))
		.assignProto(require('./__pump/streams/inject'));
});

