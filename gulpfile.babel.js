import gulp from 'gulp';
import flatten from 'gulp-flatten';
import watch from 'gulp-watch';
import replace from 'gulp-replace';

let jsFiles = './src/**/*.js',
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