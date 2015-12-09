var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

gulp.task('browserify', function () {
	return browserify('./source/app.js', { debug: true })
	.transform(babelify, {presets: ["react"]})
	.bundle()
	.pipe(source('geolinkspage.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(uglify())
    .pipe(sourcemaps.write('./'))

	.pipe(gulp.dest('./build/'));

});

gulp.task('watch', function() {
  gulp.watch('./source/**/*.js', ['browserify']);
});

gulp.task('default', ['watch', 'browserify']);