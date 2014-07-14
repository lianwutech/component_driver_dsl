var gulp = require('gulp');
var gutil = require('gulp-util');
var jasmine = require('gulp-jasmine');
var coffee = require('gulp-coffee');

var paths = {
  coffee: ['lib/*.coffee'],
  js: ['lib/*.js'],
  specs: ['spec/*Spec.js']
};

gulp.task('coffee', function() {
  return gulp.src(paths.coffee)
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('jasmine', function() {
  return gulp.src(paths.specs)
  .pipe(jasmine({verbose: false, includeStackTrace: true}));
});

gulp.task('test', ['coffee', 'jasmine']);

gulp.task('watch', function() {
  gulp.watch(paths.coffee, ['coffee']);
  gulp.watch(paths.specs, ['test']);
  gulp.watch(paths.js, ['test']);
});

gulp.task('default', ['coffee', 'test', 'watch']);
