var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass'),
    browserify = require('gulp-browserify'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    connect = require('gulp-connect');

var env,
    jsSources,
    sassSources,
    htmlSources,
    sassSources,
    jsonSources,
    outputDir,
    sassStyle;


// Node variable
// To run production.  In the terminal type "NODE_ENV=production gulp"
var env = process.env.NODE_ENV || 'development';

if (env==='development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compress';
}

// Sources for javascript files
jsSources = [
    'components/scripts/*.js',
    ];

sassSources = ['components/scss/*.scss'];
htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + '*.json'];
fontSources = ['components/fonts/*.*'];

gulp.task('js', function() {
    gulp.src(jsSources)
        // .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(babel({ presets: ['es2015']}))
        .pipe(gulpif(env === 'production', uglify()))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload())
});

gulp.task('compass', function() {
    gulp.src(sassSources)
        .pipe(compass({
            css: outputDir + 'css',
            sass: 'components/scss',
            image: outputDir + 'images',
            style: sassStyle
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(connect.reload())
});

gulp.task('watch', function() {
    gulp.watch(jsSources, ['js']);
    gulp.watch(sassSources, ['compass']);
    gulp.watch('builds/development/*.html', ['html']);
    gulp.watch('builds/development/js/*.json', ['json']);
    gulp.watch('builds/development/images/**/*.*', ['images']);
    gulp.watch(fontSources, ['fonts']);
});

gulp.task('connect', function() {
    connect.server({
        root: outputDir,
        livereload: true
    });
});

gulp.task('html', function () {
    gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    gutil.log(htmlSources);
});

gulp.task('images', function() {
    gulp.src('builds/development/images/**/*.*')
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
});

gulp.task('fonts', function() {
    gutil.log('test')
    gulp.src(fontSources)
    .pipe(gulpif(env === 'development', gulp.dest(outputDir + 'fonts')))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'fonts')))
});

gulp.task('json', function() {
    gulp.src('builds/development/js/*.json')
    .pipe(gulpif(env === 'production', jsonminify()))
    .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
    .pipe(connect.reload())
});

gulp.task('default', ['html', 'fonts', 'json', 'images', 'js', 'compass', 'connect', 'watch']);
