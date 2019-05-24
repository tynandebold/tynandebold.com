var gulp = require('gulp');

var cleanCSS = require('gulp-clean-css');
var compass = require('gulp-compass');
var data = require('gulp-data');
var del = require('del');
var { exec } = require('child_process');
var imagemin = require('gulp-imagemin');
var livereload = require('gulp-livereload');
var nunjucks = require('gulp-nunjucks-render');
var runSeq = require('run-sequence');
var webserver = require('gulp-webserver');
var rename = require('gulp-rename');

// specific tasks
gulp.task('default', function() {
  runSeq('compass', 'nunjucks', 'watch', 'webserver');
});

gulp.task('build', function() {
  runSeq('nunjucks', 'responsive', 'move', 'copy');
});

// get data; run nunjucks to compile static html files
gulp.task('nunjucks', function() {
  return gulp
    .src('./app/pages/**/*.nunjucks')
    .pipe(
      data(function() {
        var data = require('./app/data/context.json');
        return data;
      })
    )
    .pipe(
      nunjucks({
        path: ['./app/templates']
      })
    )
    .pipe(gulp.dest('./app'));
});

// config scss/css with compass
gulp.task('compass', function() {
  return gulp
    .src('./app/scss/*.scss')
    .pipe(
      compass({
        config_file: './config.rb',
        css: './app/css',
        sass: './app/scss'
      })
    )
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('./app/css'));
});

// minify css
gulp.task('minify-css', function() {
  return gulp
    .src('./app/css/*.min.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('./app/css'));
});

// watch files for changes
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('./app/scss/*.scss', ['compass']);
  gulp.watch('./app/css/*.min.css', ['minify-css']);
  gulp.watch('./app/**/**/*.+(nunjucks|json)', ['nunjucks']);
});

// run a local server
gulp.task('webserver', function() {
  return gulp.src('./app/').pipe(
    webserver({
      open: true
    })
  );
});

// image optimization
gulp.task('responsive', function() {
  del('./build/**/*');
  return gulp
    .src('./app/assets/photo/**/*.jpg')
    .pipe(imagemin({ progressive: true }))
    .pipe(gulp.dest('./build/assets/photo'));
});

// move necessary files to build dir
gulp.task('move', function() {
  return gulp
    .src(
      [
        './app/assets/dev/**/*',
        './app/css/*.min.css',
        './app/*.html',
        './app/js/*.js'
      ],
      { base: 'app' }
    )
    .pipe(gulp.dest('./build'));
});

gulp.task('copy', function() {
  exec('cp -r ./build/ ~/sites/tynandebold.github.io/', function(error) {
    if (error) {
      console.error('exec error: ', error);
      return;
    }
  });
});
