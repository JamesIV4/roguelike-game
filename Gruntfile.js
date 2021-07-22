const { sponsor, site = 'webmd' } = require('./sponsor.config.js');

const {
	client,
	brand,
	furl,
	program,
	sfnum
} = sponsor;

const sponsorPath = `img/`;

module.exports = (grunt) => {
	require('load-grunt-tasks')(grunt);

	const lifecycle = grunt.option('lifecycle') || 'live';

	grunt.registerTask('default', 'build');
	grunt.registerTask('build', ['clean', 'stylelint', 'eslint', 'sass', 'babel', 'copy', 'postcss', 'cssmin', 'htmlmin', 'cleanempty', 'gitinfo', 'usebanner']);
	grunt.registerTask('imgs', ['clean', 'copy:assets', `zip:${site}`, `ingest:${lifecycle}`]);
	grunt.registerTask('info', 'webmd-linkslist');

	grunt.initConfig({
		'babel': {
			options: {
				sourceMap: false
			},
			docs: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: '**/*.js',
					dest: 'docs/'
				}]
			}
		},
		'clean': {
			all: ['docs/', '*.xlsx']
		},
		'cleanempty': {
			options: {
				noJunk: true
			},
			all: ['docs/**']
		},
		'copy': {
			css: {
				options: {
					process: content => content
						.replace(/url\((?:(?:(["'])?\/?img\/(.+?\.(?:jpe?g|gif|png|svg))\1?))\)/g, `url(../../../${sponsorPath}/$2)`)
				},
				files: [{
					expand: true,
					cwd: 'docs/',
					src: '**/*.css',
					dest: 'docs/'
				}]
			},
			html: {
				options: {
					process: content => content
						.replace(/url\((?:(?:(["'])?img\/(.+?\.(?:jpe?g|gif|png|svg))\1?))\)/g, `url({IMAGE_SERVER_URL}/${site}/${sponsorPath}/$2)`)
						.replace(/src="img\/(.+?\.(?:jpe?g|gif|pdf|png|svg|js|json|html?))"/g, `src="{IMAGE_SERVER_URL}/${sponsorPath}/$1"`)
				},
				files: [{
					expand: true,
					cwd: 'src/',
					src: '**/*.htm?(l)',
					dest: 'docs/'
				}]
			},
			js: {
				options: {
					process: content => content
						.replace(/url\((?:(?:(["'])?img\/(.+?\.(?:jpe?g|gif|png|svg))\1?))\)/g, `url({IMAGE_SERVER_URL}/${site}/${sponsorPath}/$2)`)
						.replace(/src="img\/(.+?\.(?:jpe?g|gif|pdf|png|svg|js|json|html?))"/g, `src="{IMAGE_SERVER_URL}/${sponsorPath}/$1"`)
						.replace(/img\.webmd\.com\/conspon/g,'img.staging.webmd.com/conspon')
				},
				files: [
					{
						expand: true,
						cwd: 'docs/',
						src: '**/*.js',
						dest: `docs/imgs`
					}
				]
			},
			assets: {
				files: [{
					expand: true,
					cwd: 'src/img/',
					src: '**/*',
					dest: `docs/imgs`
				}]
			}
		},
		'cssmin': {
			docs: {
				files: [{
					expand: true,
					cwd: 'docs/',
					src: '**/*.css',
					dest: 'docs/'
				}]
			}
		},
		'eslint': {
			options: {
				plugins: [
					'html'
				]
			},
			target: ['src/**/*.{html,js}']
		},
		'gitinfo': {
			cwd: '.'
		},
		'htmlmin': {
			docs: {
				options: {
					removeComments: false,
					collapseBooleanAttributes: true,
					removeRedundantAttributes: true,
					removeEmptyAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true,
					minifyJS: true,
					minifyCSS: true,
					removeAttributeQuotes: false
				},
				files: [{
					expand: true,
					cwd: 'docs/',
					src: '*.htm?(l)',
					dest: 'docs/'
				}]
			}
		},
		'ingest': {
			staging: {
				src: 'ingest.zip',
				options: {
					env: 'prod',
					lifecycle: 'staging'
				}
			},
			live: {
				src: 'ingest.zip',
				options: {
					env: 'prod',
					lifecycle: 'active'
				}
			}
		},
		'postcss': {
			options: {
				map: true,
				processors: [
					require('autoprefixer')({ browsers: ['last 1 version', 'ie 11'] })
				]
			},
			docs: {
				src: 'docs/*.css'
			}
		},
		'sass': {
			options: {
				implementation: require('node-sass')
			},
			docs: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: '**/*.scss',
					dest: 'docs/',
					ext: '.css'
				}]
			}
		},
		'scorch': {
			all: {
				options: {
					remotePath: `${site}/${sponsorPath}`
				},
				files: [{
					expand: true,
					flatten: true,
					cwd: 'src/img/',
					src: '**/*.+(css|gif|jpg|jpeg|js|pdf|png|svg)'
				}]
			}
		},
		'stylelint': {
			all: ['src/**/*.scss']
		},
		'uglify': {
			options: {
				keep_fnames: true
			},
			assets: {
				files: [{
					expand: true,
					cwd: 'docs/',
					src: ['**/*.js'],
					dest: 'docs/'
				}]
			}
		},
		'usebanner': {
			all: {
				options: {
					banner: `/* <%= gitinfo.local.branch.current.name %>#<%= gitinfo.local.branch.current.shortSHA %> - <%= gitinfo.local.branch.current.currentUser %> @ <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */`
				},
				files: {
					src: [
						'docs/**/*.css',
						'docs/**/*.js'
					]
				}
			}
		},
		'watch': {
			html: {
				files: ['src/*.html'],
				tasks: ['copy:html', 'htmlmin', 'cleanempty']
			},
			scss: {
				files: ['src/*.scss'],
				tasks: ['stylelint', 'sass', 'copy:css', 'postcss', 'cssmin', 'cleanempty']
			},
			js: {
				files: ['src/*.js'],
				tasks: ['eslint', 'babel', 'uglify', 'cleanempty']
			}
		},
		'webmd-linkslist': {
			options: {
				sponsor,
				upload: grunt.option('upload')
			},
			all: {
				files: [{
					src: 'src/*.htm?(l)',
					dest: `${sfnum}_${client}_${brand}_${program}.xlsx`
				}]
			}
		},
		'zip': {
			webmd: {
				files: [{
					expand: true,
					cwd: 'docs/',
					src: 'webmd/',
					dest: 'ingest.zip'
				}]
			}
		}
	});
};
