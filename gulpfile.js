var gulp = require('gulp');
var flatten = require('gulp-flatten');
var watch = require('gulp-watch');
var replace = require('gulp-replace');

var jsFiles = './src/**/*.js',
    jsDest = 'dist';

gulp.task('js', function() {
    gulp.src(jsFiles)
        .pipe(flatten())
        .pipe(gulp.dest(jsDest));
});

gulp.task('default', function() {
    gulp.start('js');
    return watch(jsFiles, {ignoreInitial: false })
        .pipe(flatten())
        .pipe(replace('./util', '.'))
        .pipe(replace('./roles', '.'))
        .pipe(replace('/base-building', ''))
        .pipe(replace('/exploration', ''))
        .pipe(replace('/war', ''))
        .pipe(gulp.dest(jsDest));
});