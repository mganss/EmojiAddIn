'use script';

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var flatten = require('gulp-flatten');
var browserSync = require('browser-sync').create();

gulp.task('serve-static', function (done) {
    browserSync.init({
        https: true,
        port: 8443,
        host: 'localhost',
        open: false,
        online: false,
        server: {
            baseDir: '.',
            directory: true
        }
    }, done);
});

var input = 'AddInCompose/**/*.scss';
var output = 'AddInCompose';
var sassOptions = {
    errLogToConsole: true,
    style: 'expanded'
};

var copyInput = 'AddInCompose/TaskPane/TaskPane.js';
var copyOutputFolder = 'thunderbird/emoji@ganss.org/chrome/content';

gulp.task('sass', async function () {
    var autoprefixer = (await import('gulp-autoprefixer')).default;

    return gulp
        .src(input)
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(output))
        .pipe(flatten())
        .pipe(gulp.dest('./thunderbird/emoji@ganss.org/chrome/content'));
});

gulp.task('copyfiles', function () {
    return gulp.src(copyInput)
        .pipe(gulp.dest(copyOutputFolder));
});

function logEvent(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('watch-sass', function () {
    return gulp
        .watch(input, gulp.series('sass'))
        .on('change', logEvent);
});

gulp.task('watch-copy', function () {
    return gulp
        .watch(copyInput, gulp.series('copyfiles'))
        .on('change', logEvent);
});

gulp.task('watch', gulp.parallel('watch-sass', 'watch-copy'));

gulp.task('default', gulp.series('sass', 'watch' /*, possible other tasks... */));

gulp.task('prod', gulp.series('sass', 'copyfiles', async function () {
    var autoprefixer = (await import('gulp-autoprefixer')).default;

    return gulp
        .src(input)
        .pipe(sass({ style: 'compressed' }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(output));
}));

gulp.task('dist', gulp.series('prod', async function () {
    var zip = (await import('gulp-zip')).default;

    return gulp.src('thunderbird/emoji@ganss.org/**/*')
        .pipe(zip('emoji.xpi'))
        .pipe(gulp.dest('.'));
}));
