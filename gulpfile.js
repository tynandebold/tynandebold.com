// include gulp
var gulp = require('gulp');

// include plugins
var nunjucks   = require('gulp-nunjucks-render');
var data       = require('gulp-data');
var compass    = require('gulp-compass');
var livereload = require('gulp-livereload');
var webserver  = require('gulp-webserver');
var del        = require('del');

// specific tasks
gulp.task('default', ['compass', 'nunjucks', 'watch', 'webserver']);
gulp.task('build', ['nunjucks', 'build']);

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

// organize and build necessary files
gulp.task('build', function(){
  del('./build/**');
  return gulp.src(['./app/assets/**', './app/css/**', './app/*.html'], {base: 'app'})
    .pipe(gulp.dest('./build'));
});
