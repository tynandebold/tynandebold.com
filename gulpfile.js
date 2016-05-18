// include gulp
var gulp = require('gulp');

// include plugins
var nunjucks   = require('gulp-nunjucks-render');
var data       = require('gulp-data');
var compass    = require('gulp-compass');
var livereload = require('gulp-livereload');
var webserver  = require('gulp-webserver');
var del        = require('del');
var runSeq     = require('run-sequence');
var imagemin   = require('gulp-imagemin');

// specific tasks
gulp.task('default', ['compass', 'nunjucks', 'watch', 'webserver']);
gulp.task('build', function(){
  runSeq('nunjucks', 'responsive', 'move');
});

// get data; run nunjucks to compile static html files
gulp.task('nunjucks', function(){
  return gulp.src('./app/pages/**/*.nunjucks')
    .pipe(data(function() {
      var data = require('./app/data/context.json');
      return data;
    }))
    .pipe(nunjucks({
      path: ['./app/templates']
    }))
    .pipe(gulp.dest('./app'));
});

// config scss/css with compass
gulp.task('compass', function() {
  return gulp.src('./app/scss/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: './app/css',
      sass: './app/scss'
    }));
});

// compile scss
gulp.task('sass', function(){
  return gulp.src('./app/scss/*.scss')
    .pipe(sass({compass: true}))
    .pipe(gulp.dest('./app/css'));
});

// watch files for changes
gulp.task('watch', function() {
	livereload.listen()
    gulp.watch('./app/scss/*.scss', ['compass'])
    gulp.watch('./app/**/**/*.+(nunjucks|json)', ['nunjucks']);
});

// run a local server
gulp.task('webserver', function(){
	return gulp.src('./app/')
		.pipe(webserver({
			open: true
		}));
});

// image optimization
gulp.task('responsive', function() {
  del('./build/**/*');
  return gulp.src('./app/assets/photo/**/*.jpg')
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest('./build/assets/photo'));
});

// move necessary files to build dir
gulp.task('move', function(){
  return gulp.src(['./app/assets/dev/**/*', './app/css/**/*', './app/*.html'], {base: 'app'})
    .pipe(gulp.dest('./build'));
});
