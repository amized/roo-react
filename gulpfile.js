var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var fs = require('fs');
var banner = require('gulp-banner');
var pkg = require('./package.json');
const gulpbabel = require('gulp-babel');

var comment = '/*\n' +
    ' * <%= pkg.name %> <%= pkg.version %>\n' +
    ' * <%= pkg.description %>\n' +
    ' * <%= pkg.homepage %>\n' +
    ' *\n' +
    ' * Copyright 2017, <%= pkg.author %>\n' +
    ' * Released under the <%= pkg.license %> license.\n' +
    '*/\n\n';

var DEST = 'dist/';
var outputFileName = "Roo"
var babelPresets = ["es2015", "stage-2", "react"];
var reBannerComment = new RegExp('^\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)\\s*');

function getBanner() {
  var src = fs.readFileSync( 'masonry.js', 'utf8' );
  var matches = src.match( reBannerComment );
  var banner = matches[0].replace( 'Masonry', 'Masonry PACKAGED' );
  return banner;
}

function addBanner( str ) {
  return replace( /^/, str );
}

function transpile() {
  gulp.src('src/*.js')
    .pipe(gulpbabel({
        presets: babelPresets
    }))
    .pipe(gulp.dest('lib'))
}

function compile(watch) {
  var bundler = browserify({ 
    entries: ['./src/Roo.js'],
    debug: false, 
    standalone: outputFileName,
    cache: {},
    packageCache: {},
    plugin: [watchify]

  }).transform(babel, {presets: babelPresets});

  function rebundle() {
    gulp.src('src/**/*.js')
      .pipe(gulpbabel({
          presets: babelPresets
      }))
      .pipe(banner(comment, {
            pkg: pkg
        }))      
      .pipe(gulp.dest('lib'));


    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source(outputFileName + '.js'))
      .pipe(buffer())
      .pipe(banner(comment, {
            pkg: pkg
        }))
      .pipe(gulp.dest(DEST))
      .pipe(uglify({
        mangle: true,
        compress: true
      }))
      .pipe(banner(comment, {
            pkg: pkg
        }))
      .pipe(rename({ extname: '.min.js' }))
      .pipe(gulp.dest(DEST));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};
gulp.task('transpile', function() { return transpile(); });
gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);