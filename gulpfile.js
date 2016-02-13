var gulp = require('gulp');

var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('build', function() {
  browserify({
    entries: './play/play.js',
    debug: true
  })
  .transform(babelify)
  .bundle()
  .pipe(source('play.js'))
  .pipe(gulp.dest('./build'));
});

gulp.task('watch', function(){
  gulp.watch('play/**/*.js', ['build']);
});
