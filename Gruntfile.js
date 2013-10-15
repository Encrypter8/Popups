module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/jquery.popups.js', 'src/jquery.modal.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
    },
    jshint: {
      options: {
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
        src: ['src/jquery.popups.js', 'src/jquery.modal.js', 'src/jquery.popups.new.js']
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
    },
    qunit: {
      files: ['test/**/*.html']
    },
    less: {
      test: {
        files: {
          'test/popups.css': 'assets/Popups.less'
        }
      },
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  //grunt.loadNpmTasks('grunt-contrib-less');
  //grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'concat', 'uglify']);

};
