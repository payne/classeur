var gulp = require('gulp');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var mergeStream = require('merge-stream');
var sass = require('gulp-sass');
var templateCache = require('gulp-angular-templatecache');

var vendorJs = [
	'public/bower_components/angular/angular.js',
	'public/bower_components/angular-animate/angular-animate.js',
	'public/bower_components/angular-aria/angular-aria.js',
	'public/bower_components/angular-messages/angular-messages.js',
	'public/bower_components/angular-route/angular-route.js',
	'public/bower_components/movejs/move.js',
	'public/bower_components/hammerjs/hammer.js',
	'public/bower_components/angular-material/angular-material.js',
	'public/bower_components/angular-slugify/angular-slugify.js',
	'public/bower_components/google-diff-match-patch-js/diff_match_patch.js',
	'public/bower_components/rangy-official/rangy-core.js',
	'public/bower_components/rangy-official/rangy-classapplier.js',
	'public/bower_components/cledit/scripts/cleditCore.js',
	'public/bower_components/cledit/scripts/cleditHighlighter.js',
	'public/bower_components/cledit/scripts/cleditKeystroke.js',
	'public/bower_components/cledit/scripts/cleditMarker.js',
	'public/bower_components/cledit/scripts/cleditPrism.js',
	'public/bower_components/cledit/scripts/cleditSelectionMgr.js',
	'public/bower_components/cledit/scripts/cleditUndoMgr.js',
	'public/bower_components/cledit/scripts/cleditUtils.js',
	'public/bower_components/cledit/scripts/cleditWatcher.js',
	'public/bower_components/cledit/examples/markdownEditor/mdGrammar.js',
	'public/bower_components/highlightjs/highlight.pack.js',
	'public/bower_components/google-code-prettify/src/prettify.js',
	'public/components/Markdown.Converter.js',
	'public/components/Markdown.Editor.js',
	'public/bower_components/pagedown-extra/Markdown.Extra.js',
];

var vendorCss = [
	'public/bower_components/angular-material/angular-material.css',
	'public/bower_components/highlightjs/styles/default.css',
	'public/bower_components/google-code-prettify/src/prettify.css'
];

var templateCacheSrc = ['src/**/*.html', 'src/**/*.md'];
var jsSrc = ['src/**/*.js'];

function jsStream() {
	return mergeStream(
		gulp.src(vendorJs),
		gulp.src(jsSrc),
		gulp.src(templateCacheSrc)
		.pipe(templateCache({
			module: 'classeur.templates',
			standalone: true
		}))
	);
}
gulp.task('js', function() {
	return jsStream()
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(concat('app-min.js', {
			newLine: ';'
		}))
		.pipe(gulp.dest('public'));

});
gulp.task('js-dev', function() {
	return jsStream()
		.pipe(sourcemaps.init())
		.pipe(concat('app-min.js', {
			newLine: ';'
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('public'));
});

var sassSrc = ['src/**/*.scss'];

function cssStream() {
	return mergeStream(
		gulp.src(vendorCss),
		gulp.src('src/styles/main.scss')
	);
}

gulp.task('sass', function() {
	return cssStream()
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(concat('app-min.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('public'));
});

gulp.task('express', function() {
	process.env.NO_CLUSTER = true;
	require('./index');
});

gulp.task('watch', function() {
	watch(sassSrc, function(files, cb) {
		gulp.start('sass');
		cb();
	});
	watch(templateCacheSrc.concat(jsSrc), function(files, cb) {
		gulp.start('js-dev');
		cb();
	});
	gulp.start('sass');
	gulp.start('js-dev');
});

gulp.task('run', [
	'watch',
	'express'
]);

gulp.task('default', [
	'sass',
	'js'
]);
