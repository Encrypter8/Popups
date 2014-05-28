module.exports = function(config) {
	config.set({

		basePath: './',

		frameworks: ['jasmine'],

		files: [
			'*-tests.js'
		],

		reporters: ['progress'],

		colors: true,

		browsers: ['PhantomJS'],

		singleRun: true
	});
};