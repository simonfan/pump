(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'.././src' :
		// browser
		'pump',
		// dependencies for the test
		deps = [mod, 'should'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(Pump, should) {
	'use strict';

	describe('Pump pipe-scoped-getter-setters', function () {
		beforeEach(function (done) {
			done();
		});

		it('is fine (:', function () {
			var fruit = { name: 'banana' }
			fruit.should.have.property('name', 'banana');
		});
	});
});
