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

			this.source = {
				key1: 'v1',
				key2: 'v2',
				key3: 'v3',
				key4: 'v4',
			};

			var dataPump = pump.extend();

			this.dpump = dataPump(this.source);

		});

		it('pump', function (testdone) {

			var source = this.source;

			var d1 = {},
				d2 = {},
				d3 = {},
				d4 = {};


			var dpump = this.dpump;


			var pipes = {};

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

			// pump 1
			dpump
				.pump()
				.then(function () {

					// tests
					d1['dest1K1'].should.eql('v1');
					should(d1['dest1K2']).be.undefined;
					should(d1['dest1K3']).be.undefined;
					d1['dest1K4'].should.eql('v4');


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
				.done(function () {
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
	});
});
