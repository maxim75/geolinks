var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var stylish = require("jshint-stylish");
var gutil = require("gulp-util");
var qunit = require("gulp-qunit");
var sourcemaps = require("gulp-sourcemaps");
var coveralls = require("gulp-coveralls");
var buffer = require("vinyl-buffer");
var babelify = require("babelify");

gulp.task("test", function(done) {
  return gulp.src("./Tests/test-runner.html").pipe(qunit());
  done();
});

gulp.task("build", function(done) {
  gulp
    .src("src/*.js")
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))

    .pipe(sourcemaps.init())
    .pipe(concat("geolinks.js"))
    .pipe(gulp.dest("dist"))
    .pipe(rename("geolinks.min.js"))
    .pipe(uglify({  }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
    done();
});

gulp.task("default", gulp.series("build", "test"));
