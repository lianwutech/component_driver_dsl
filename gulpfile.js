var gulp = require('gulp');
var gutil = require('gulp-util');
var jasmine = require('gulp-jasmine');
var coffee = require('gulp-coffee');
var watch = require('gulp-watch');

var paths = {
  coffee: ['*.coffee'],
  js: ['*.js'],
  specs: ['spec/*Spec.js']
};

gulp.task('coffee', function() {
  return gulp.src(paths.coffee)
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('.'));
});

gulp.task('test', ['coffee'], function() {
  return gulp.src(paths.specs)
  .pipe(jasmine({verbose: false, includeStackTrace: true}));
});

gulp.task('watch', function() {
  watch(paths.coffee, ['test']);
  watch(paths.specs, ['test']);
});

gulp.task('default', ['test', 'watch']);
