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

})('test', function(pump, should) {
	'use strict';

	describe('pump basics', function () {
		beforeEach(function () {

			var source = this.source = {
				key1: 'v1',
				key2: 'v2',
				key3: 'v3',
				key4: 'v4',
			};

			var dpump = this.dpump = pump(source);

			//////////////////
			// DESTINATIONS //
			//////////////////
			var destinations = this.destinations = {};
			var d1 = destinations.d1 = {
				dest1K1: 'd1-v1',
				dest1K2: 'd1-v2',
				dest1K3: 'd1-v3',
				dest1K4: 'd1-v4',
			};

			var d2 = destinations.d2 = {
				dest2K1: 'd2-v1',
				dest2K2: 'd2-v2',
				dest2K3: 'd2-v3',
				dest2K4: 'd2-v4',
			};

			var d3 = destinations.d3 = {
				dest3K1: 'd3-v1',
				dest3K2: 'd3-v2',
				dest3K3: 'd3-v3',
				dest3K4: 'd3-v4',
			};

			var d4 = destinations.d4 = {
				dest4K1: 'd4-v1',
				dest4K2: 'd4-v2',
				dest4K3: 'd4-v3',
				dest4K4: 'd4-v4',
			};


			///////////
			// PIPES //
			///////////

			var pipes = this.pipes = {};

			// create pipes
			pipes.pid1 = dpump.pipe('pid1', {
				key1: 'dest1K1',
				key4: 'dest1K4',
			})
			.to(d1);

			pipes.pid2 = dpump.pipe('pid2', {
				key1: 'dest2K1',
				key3: 'dest2K3'
			})
			.to(d2);

		});

		it('pump', function (testdone) {

			var source = this.source;

			var destinations = this.destinations;
			var d1 = destinations.d1,
				d2 = destinations.d2,
				d3 = destinations.d3,
				d4 = destinations.d4;


			var dpump = this.dpump;


			var pipes = this.pipes;
			// pump 1
			dpump
				.pump()
				.then(function () {

					// tests
					d1.dest1K1.should.eql('v1');
					d1.dest1K2.should.eql('d1-v2');
					d1.dest1K3.should.eql('d1-v3');
					d1.dest1K4.should.eql('v4');

					d2.dest2K1.should.eql('v1');
					d2.dest2K2.should.eql('d2-v2');
					d2.dest2K3.should.eql('v3');
					d2.dest2K4.should.eql('d2-v4');

					// d3 unaltered
					d3.dest3K1.should.eql('d3-v1');
					d3.dest3K2.should.eql('d3-v2');
					d3.dest3K3.should.eql('d3-v3');
					d3.dest3K4.should.eql('d3-v4');

					// d4 unaltered
					d4.dest4K1.should.be.eql('d4-v1');
					d4.dest4K2.should.be.eql('d4-v2');
					d4.dest4K3.should.be.eql('d4-v3');
					d4.dest4K4.should.be.eql('d4-v4');

				})
				.then(function () {

					// remove one pipe
					dpump.unpipe('pid1');

					// change values on source
					source.key1 = 'altered-v1';
					source.key4 = 'altered-v4';

					// create more pipes
					pipes.pid3 = dpump.pipe('pid3', {
						key1: 'dest3K1',
						key2: 'dest3K2',
						key3: 'dest3K3',
						key4: 'dest3K4',
					})
					.to(d3);

					pipes.pid4 = dpump.pipe('pid4', {
						key4: 'dest4K4',
					})
					.to(d4);

					// pump
					return dpump.pump();
				})
				.then(function () {
					// tests

					// d1 remains unaltered.
					d1.dest1K1.should.eql('v1');
					should(d1.dest1K2).be.undefined;
					should(d1.dest1K3).be.undefined;
					d1.dest1K4.should.eql('v4');

					d2.dest2K1.should.eql('altered-v1');
					should(d2.dest2K2).be.undefined;
					d2.dest2K3.should.eql('v3');
					should(d2.dest2K4).be.undefined;

					d3.dest3K1.should.eql('altered-v1');
					d3.dest3K2.should.eql('v2');
					d3.dest3K3.should.eql('v3');
					d3.dest3K4.should.eql('altered-v4');


					should(d4.dest4K1).be.undefined;
					should(d4.dest4K2).be.undefined;
					should(d4.dest4K3).be.undefined;
					d4.dest4K4.should.be.eql('altered-v4');

					testdone();
				});

		});

		it('drain', function (testdone) {

			var source = this.source;

			var destinations = this.destinations;
			var d1 = destinations.d1,
				d2 = destinations.d2,
				d3 = destinations.d3,
				d4 = destinations.d4;


			var dpump = this.dpump;


			var pipes = this.pipes;


			// check that source has its own propertis
			source.should.eql({
				key1: 'v1',
				key2: 'v2',
				key3: 'v3',
				key4: 'v4'
			});


			// drain
			dpump
				.drain('pid1')
				.then(function () {
					// check modifications on source
					source.should.eql({
						// drained value from d1
						key1: 'd1-v1',
						// unmodified
						key2: 'v2',
						// unmodified
						key3: 'v3',
						// drained value from d1
						key4: 'd1-v4'
					});

				})
				.then(function () {




					// create more pipes
					pipes.pid3 = dpump.pipe('pid3', {
						key1: 'dest3K1',
						key2: 'dest3K2',
						key3: 'dest3K3',
						key4: 'dest3K4',
					})
					.to(d3);

					pipes.pid4 = dpump.pipe('pid4', {
						key4: 'dest4K4',
					})
					.to(d4);

					// set a main pipe id
					dpump.mainPipeId = 'pid3';

					// drain from no explicit pipe,
					// let default pipe id be used
					return dpump.drain();

				})
				.then(function () {

					source.should.eql({
						key1: 'd3-v1',
						key2: 'd3-v2',
						key3: 'd3-v3',
						key4: 'd3-v4',
					});

					testdone();

				})
				.done();
		});
	});
});
