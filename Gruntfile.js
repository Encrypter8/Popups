module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		// Metadata
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			popupsDev: 'src/jquery.popups.js',
			modalDev: 'src/jquery.modal.js',

			title: '<%= pkg.title || pkg.name %>',
			date: '<%= grunt.template.today("yyyy-mm-dd") %>',
			copyright: 'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>',
			license: 'Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>'
		},

		// banners
		popupsBanner: '/* jQuery Popups - v<%= pkg.version %> - <%= meta.date %>\n' +
			' * <%= pkg.homepage %>\n' +
			' * <%= meta.copyright %>\n' +
			' * <%= meta.license %> \n */\n',
		modalBanner: '/* jQuery Modal - v<%= pkg.version %> - <%= meta.date %>\n' +
			' * <%= pkg.homepage %>\n' +
			' * <%= meta.copyright %>\n' +
			' * <%= meta.license %> \n */\n',

		// Task configuration
		clean: {
			files: ['dist']
		},

		copy: {
			popups: {
				files: [
					{src: 'src/jquery.popups.js', dest: 'dist/jquery.popups.js'}
				],
				options: {
					process: function (content, srcpath) {
						return content.replace(/\/\/@BANNER/g, grunt.template.process('<%= popupsBanner %>'));
					}
				}
			},
			modal: {
				files: [
					{src: 'src/jquery.modal.js', dest: 'dist/jquery.modal.js'}
				],
				options: {
					process: function (content, srcpath) {
						return content.replace(/\/\/@BANNER/g, grunt.template.process('<%= modalBanner %>'));
					}
				}
			}
		},

		jshint: {
			options: {
				"validthis": true,
				"curly": true,
				"eqnull": true,
				"eqeqeq": false,
				"undef": true,
				"expr": true,
				"globals": {
					"jQuery": true,
					"window": true,
					"document": true
				}
			},
			files: {
				src: ['src/jquery.popups.js', 'src/jquery.modal.js']
			}
		},

		uglify: {
			popups: {
				options: {
					banner: '<%= popupsBanner %>'
				},
				src: '<%= meta.popupsDev %>',
				dest: 'dist/jquery.popups.min.js'
			},
			modal: {
				options: {
					banner: '<%= modalBanner %>'
				},
				src: '<%= meta.modalDev %>',
				dest: 'dist/jquery.modal.min.js'
			}
		},

		less: {
			core: {
				files: {
					'dist/popups-core.css': 'src/popups-core.less',
				}
			},
			demo: {
				files: {
					'demo/demo.css': 'demo/demo.less',
					'demo/popups-bubble.css': 'demo/popups-bubble.less',
					'demo/popups-bubble-popover-style.css': 'demo/popups-bubble-popover-style.less'
				}
			},
		},

		watch: {
			less: {
				files: ['./src/*.less', './demo/*.less'],
				tasks: ['less']
			},
			lessCore: {
				files: ['./src/*.less'],
				tasks: ['less:core']
			},
			lessDemo: {
				files: ['./demo/*.less'],
				tasks: ['less:demo']	
			}
		},

		update_json: {
			bower: {
				src: 'package.json',
				dest: 'bower.json',
				fields: [
					'name',
					'version',
					'description',
					'main'
				]
			}
		},

		karma: {
			unit: {
				configFile: './tests/karma.conf.js'
			}
		}

	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-update-json');
	grunt.loadNpmTasks('grunt-karma');

	// Default task.
	grunt.registerTask('default', ['jshint', /*'karma',*/ 'clean', 'less', 'copy', 'uglify', 'update_json']);

};
