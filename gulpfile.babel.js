import gulp from 'gulp';
import flatten from 'gulp-flatten';
import watch from 'gulp-watch';

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
        .pipe(gulp.dest(jsDest));
});