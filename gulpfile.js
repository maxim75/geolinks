var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('browserify', function () {
	return browserify('./source/app.js')

	.transform(babelify, {presets: ["react"]})
	.bundle()
	.pipe(source('geolinkspage.js'))
	.pipe(gulp.dest('./build/'));

});

gulp.task('watch', function() {
  gulp.watch('./source/**/*.js', ['browserify']);
});

gulp.task('default', ['watch', 'browserify']);