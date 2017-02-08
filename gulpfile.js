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

var myGulpOptions = {
key: 'value',
key2: 'value2'
};


//Functions
function errorHandler(err){
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
gulp.task('hello', function(){
	console.log('Hello Tim');
});

//Sprites Task
gulp.task('sprites',function(){
	gulp.src('app/images/sprites/**/*')
	.pipe(spritesmith({
		cssName: '_sprites.scss',
		imgName: 'sprites.jpg',
		imgPath: '../images/sprites.jpg',
		retinaSrcFilter: 'app/images/sprites/*@2x.jpg',
		retinaImgName: 'sprites@2x.jpg',
		retinaImgPath: '../images/sprites@2x.jpg'
	}))
	.pipe(gulpIf('*.jpg',gulp.dest('app/images')))
	.pipe(gulpIf('*.scss',gulp.dest('app/scss')))
});

//Sass Task
gulp.task('sass', function(){
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

//Watch Task
gulp.task('watch', ['browserSync','sass'], function(){
	gulp.watch('app/scss/**/*.scss',['sass']);
	gulp.watch('app/js/**/*.js',browserSync.reload);
	gulp.watch('app/*.html',browserSync.reload);
	//Other Watchers
});

//Browser Sync Task
gulp.task('browserSync',function(){
	browserSync({
		server: {
			baseDir: 'app'
		},
		//proxy: 'www.localhost:8080',
		browser: ['google chrome']
	})
});

