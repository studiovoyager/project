var gulp = require('gulp');
//Require gulp-sass plugin
var sass = require('gulp-sass');
//Other requires
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var autoPrefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');
var gulpIf = require('gulp-if');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var fs = require('fs');
var del = require('del');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var scssLint = require('gulp-scss-lint');

var Server = require('karma').Server;

//Dummy
var myGulpOptions = {
    key: 'value',
    key2: 'value2'
};


//Functions
function errorHandler(err) {
    console.log(err.toString());
    this.emit("end");
}

function customPlumber(errTitle) {
    return plumber({
        errorHandler: notify.onError({
            //Customizing error title
            title: errTitle || "Error running Gulp",
            message: "Error: <%= error.message %>",
            //sound: "Glass"
        })
    });
}

/* Tasks */

//Hello Task
gulp.task('hello', function() {
    console.log('Hello Tim');
});

//Sprites Task
gulp.task('sprites', function() {
    gulp.src('app/images/sprites/**/*')
        .pipe(spritesmith({
            cssName: '_sprites.scss',
            imgName: 'sprites.jpg',
            imgPath: '../images/sprites.jpg',
            retinaSrcFilter: 'app/images/sprites/*@2x.jpg',
            retinaImgName: 'sprites@2x.jpg',
            retinaImgPath: '../images/sprites@2x.jpg'
        }))
        .pipe(gulpIf('*.jpg', gulp.dest('app/images')))
        .pipe(gulpIf('*.scss', gulp.dest('app/scss')))
});

//Sass Task
gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss')
        //Replace plumber with customPlumber
        .pipe(customPlumber('Error running Sass'))
        //Init sourcemaps
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [
                'app/bower_components',
                'node_modules' //if installing sass libraries via npm
            ]
        }))
        // ... other plugins
        .pipe(autoPrefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css'))
        //Tells Browser Sync to reload files when task done
        .pipe(browserSync.reload({
            stream: true
        }))
});

//Test
gulp.task('test', function(done){
    new Server({
        configFile: process.cwd() + '/karma.conf.js',
        singleRun: true
    }, done).start();
})

//Browser Sync Task
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        //proxy: 'www.localhost:8080',
        browser: ['google chrome']
    })
});

//Nunjucks Templating
gulp.task('nunjucks', function() {

    //nunjucksRender.nunjucks.configure(['app/templates']);

    //Gets .html and .nunjucks files in pages
    return gulp.src('app/pages/**/*.+(html|nunjucks)')
        .pipe(customPlumber('Error running Nunjucks'))
        //Add data to Nunjucks
        .pipe(data(function() {
            return JSON.parse(fs.readFileSync('./app/data.json'))
        }))
        //Renders nunjuck files
        .pipe(nunjucksRender({
            path: ['app/templates']
        }))
        //Output files in app folder
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

///Lint SASS
gulp.task('lint:scss', function(){
    return gulp.src('app/scss/**/*.scss')
    //Linting files with SCSSLint
    .pipe(scssLint({
        //Pointing to config file
        config: '.scss-lint.yml'
    }));
});

//Lint JS
gulp.task('lint:js', function(){
    return gulp.src('app/js/**/*.js')
    //Catching errors with customPlumber
    .pipe(customPlumber('JSHint Error'))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    //Catching all JSHint errors
    .pipe(jshint.reporter('fail', {
        ignoreWarning : true,
        ignoreInfo: true
    }))
    //adding JSCS to lint:js task
    .pipe(jscs({
        //Fix errprs
        fix: true,
        configPath: '.jscsrc'
    }))
    // removed JSCS reporter
    .pipe(gulp.dest('app/js'))
});


//Clean up task
gulp.task('clean:dev', function(){
    return del.sync([
        'app/css',
        'app/*.+(html|nunjucks)'
        ])
});


//Watch JS task -runs lint then browser reload
gulp.task('watch-js', ['lint-js'], browserSync.reload);


//Watch Task
gulp.task('watch', function() {
    gulp.watch('app/scss/**/*.scss', ['sass', 'lint:scss']);
    //Watch Javascript files and warn us of errors
    // gulp.watch('app/js/**/*.js', ['watch-js']);
    gulp.watch('app/js/**/*.js', browserSync.reload);
    // included in watch-js task ----- gulp.watch('app/*.html', browserSync.reload);
    gulp.watch([
            'app/templates/**/*',
            'app/pages/**/*.+(html|nunjucks)',
            'app/data.json'
            ], ['nunjucks'] //runs Nunjucks task
            )
        //Other Watchers
});

//Main Dev(elopment) Task
gulp.task('default', function(callback){
    //run in sequence
    runSequence(
        'clean:dev',
        ['sprites','lint:scss'],
        // ['sprites','lint:js','lint:scss'],
        ['sass','nunjucks'],
        ['browserSync','watch'],
        callback
    )
});





