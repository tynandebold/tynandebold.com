import gulp from 'gulp';
import { exec } from 'child_process';
import cleanCSS from 'gulp-clean-css';
import gulpData from 'gulp-data';
import { deleteAsync } from 'del';
import frontMatter from 'gulp-front-matter';
import fs from 'fs';
import livereload from 'gulp-livereload';
import marked from 'gulp-marked';
import nunjucks from 'gulp-nunjucks-render';
import rename from 'gulp-rename';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import webserver from 'gulp-webserver';
import wrap from 'gulp-wrap';

const sass = gulpSass(dartSass);

// get data; run nunjucks to compile static html files
function nunjucksTask() {
  return gulp
    .src('./app/pages/**/*.nunjucks')
    .pipe(
      gulpData(function () {
        return JSON.parse(fs.readFileSync('./app/data/context.json'));
      }),
    )
    .pipe(
      nunjucks({
        path: ['./app/templates'],
      }),
    )
    .pipe(gulp.dest('./app'));
}

function markdownTask() {
  return gulp
    .src('./app/pages/**/*.md')
    .pipe(frontMatter())
    .pipe(marked())
    .pipe(
      wrap(
        function (data) {
          return fs
            .readFileSync('./app/templates/writings.nunjucks')
            .toString();
        },
        null,
        { engine: 'nunjucks' },
      ),
    )
    .pipe(gulp.dest('./app'));
}

// compile sass file(s)
function sassTask() {
  return gulp
    .src('./app/scss/*.scss')
    .pipe(
      sass({ silenceDeprecations: ['legacy-js-api'] }).on(
        'error',
        sass.logError,
      ),
    )
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('./app/css'));
}

// minify css
function minifyCssTask() {
  return gulp
    .src('./app/css/*.min.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('./app/css'));
}

// watch files for changes
function watchTask() {
  livereload.listen();
  gulp.watch('./app/scss/*.scss', sassTask);
  gulp.watch('./app/css/*.min.css', minifyCssTask);
  gulp.watch(
    ['./app/**/**/*.+(nunjucks|json|md)', './app/data/*.json'],
    gulp.parallel(nunjucksTask, markdownTask),
  );
}

// run a local server
function webserverTask() {
  return gulp.src('./app/').pipe(
    webserver({
      open: true,
      port: 7080,
      middleware: function (req, res, next) {
        // ignore these things
        if (
          req.url.includes('assets') ||
          req.url.includes('css') ||
          req.url.includes('js') ||
          req.url.includes('fonts')
        ) {
          next();
          return;
        }

        if (req.url === '/') {
          req.url = '/index';
        }

        var url = req.url + '.html';
        req.url = url;
        next();
      },
    }),
  );
}

// clean build directory and copy photos
async function cleanAndCopyPhotos() {
  await deleteAsync('./build/**/*');
  return gulp
    .src('./app/assets/photo/**/*.jpg', { encoding: false })
    .pipe(gulp.dest('./build/assets/photo'));
}

// move necessary files to build dir
function moveTask() {
  return gulp
    .src(
      [
        './app/assets/dev/**/*',
        './app/css/*.min.css',
        './app/*.html',
        './app/js/*.js',
        './app/fonts/*',
      ],
      { base: 'app', encoding: false },
    )
    .pipe(gulp.dest('./build'));
}

function pullCopyPushTask(done) {
  exec(
    'mkdir ./build/feeds && node generate-rss.js && sh build.sh',
    function (error) {
      if (error) {
        console.error('exec error: ', error);
      }
      done();
    },
  );
}

// default task for development
const defaultTask = gulp.series(
  sassTask,
  gulp.parallel(nunjucksTask, markdownTask),
  gulp.parallel(watchTask, webserverTask),
);

// build task for production
const buildTask = gulp.series(
  gulp.parallel(nunjucksTask, markdownTask),
  cleanAndCopyPhotos,
  moveTask,
  pullCopyPushTask,
);

export default defaultTask;
export { buildTask as build };
