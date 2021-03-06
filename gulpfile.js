'use script';

var gulp = require('gulp');
var webserver = require('gulp-webserver');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var flatten = require('gulp-flatten');
var zip = require('gulp-zip');

gulp.task('serve-static', function () {
    gulp.src('.')
        .pipe(webserver({
            https: true,
            port: '8443',
            host: 'localhost',
            directoryListing: true,
            fallback: 'index.html'
        }));
});

var input = 'AddInCompose/**/*.scss';
var output = 'AddInCompose';
var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
};

var copyInput = 'AddInCompose/TaskPane/TaskPane.js';
var copyOutputFolder = 'thunderbird/emoji@ganss.org/chrome/content';

gulp.task('sass', function () {
    return gulp
        .src(input)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
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

gulp.task('prod', gulp.series('sass', 'copyfiles', function () {
    return gulp
        .src(input)
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(output));
}));

gulp.task('dist', gulp.series('prod', function () {
    return gulp.src('thunderbird/emoji@ganss.org/**/*')
        .pipe(zip('emoji.xpi'))
        .pipe(gulp.dest('.'));
}));
