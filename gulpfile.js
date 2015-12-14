var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var stylish = require('jshint-stylish');
var gutil = require('gulp-util');
var qunit = require('gulp-qunit');
var sourcemaps = require('gulp-sourcemaps');
var coveralls = require('gulp-coveralls');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');

gulp.task('test', function() {
    return gulp.src('./Tests/test-runner.html')
        .pipe(qunit());
});

gulp.task('build', function() {
    /*
    return browserify('./src/Geolinks.js', { debug: true })
        .transform(babelify, {presets: ["react"]})
        .bundle()
        .pipe(source('geolinks.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))

        .pipe(gulp.dest('./dist/'));
        */

    
    gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))

        .pipe(sourcemaps.init())
        .pipe(concat('geolinks.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('geolinks.min.js'))
        .pipe(uglify({ outSourceMap: true }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest('dist')); 
});

gulp.task('default', [ "build", "test" ]);
