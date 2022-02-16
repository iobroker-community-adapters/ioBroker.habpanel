// const clean = require('gulp-clean');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
// var gulpFilter = require('gulp-filter');
// var mainBowerFiles = require('gulp-main-bower-files');
//const path = require('path');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('node-sass'));
const sassGlob = require('gulp-sass-glob');
const uglify = require('gulp-uglify');
//const watch = require('gulp-watch');
const webserver = require('gulp-webserver');
//const through = require('through2');
//const pofile = require('pofile');

const fs        = require('fs');
const iopackage = require('./io-package.json');

const languages =  {
    en: {},
    de: {},
    ru: {},
    pt: {},
    nl: {},
    fr: {},
    it: {},
    es: {},
    pl: {},
	"zh-cn": {}
};

var src = './src/';
var dst = './www/';

// linting (not used)

gulp.task('lint', function () {
    return gulp.src([src + 'app/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});


// live reload for SASS development

gulp.task('web-server', function() {
  gulp.src(src)
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

gulp.task('watch', function () {
    gulp.watch([
        src + 'app/widgets/**/[^_]*.scss', // omit internal styles starting with "_"
        src + 'assets/styles/**/*.scss',
        src + 'vendor/**/*.scss'
    ], ['sass']);
});

gulp.task('server', gulp.series(
    'watch',
    'web-server'));

// SASS processing

gulp.task('sass-themes', function () {
    return gulp.src(src + 'assets/styles/themes/**/*.scss')
        .pipe(plumber())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(cleanCSS({compatibility: '*,-properties.merging'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dst + 'assets/styles/themes'));
});

gulp.task('sass-vendor', function () {
    return gulp.src(src + 'vendor/styles.scss')
        .pipe(plumber())
		.pipe(sassGlob())
        .pipe(sass())
        .pipe(cleanCSS({compatibility: '*,-properties.merging'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dst + 'vendor'));
});

gulp.task('sass', gulp.series(
    'sass-themes',
    'sass-vendor'
));

gulp.task('vendor-fonts', function() {
    return gulp.src([
        'bower_components/bootstrap-sass/assets/fonts/*/**',
        'bower_components/roboto-fontface/fonts/*/Roboto-Regular.*'
    ]).pipe(gulp.dest(dst + 'fonts'));
});

gulp.task('uglify-timeline', function () {
  return gulp.src('bower_components/d3-timeline/src/d3-timeline.js')
             .pipe(uglify())
             .pipe(gulp.dest('bower_components/d3-timeline/dist'));
});

gulp.task('vendor-js', gulp.series('uglify-timeline', function() {
    if (!require('fs').existsSync(__dirname + '/bower_components')) {
        throw new Error('No Bower files found: please write "bower i".');
    }

    return gulp.src([
        'bower_components/angular/angular.min.js',
        'bower_components/angular-route/angular-route.min.js',
        'bower_components/angular-touch/angular-touch.min.js',
        'bower_components/d3/d3.min.js',
        'bower_components/sprintf/dist/sprintf.min.js',
        'bower_components/angular-gridster/dist/angular-gridster.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-sanitize/angular-sanitize.min.js',
	    'bower_components/angular-translate/angular-translate.min.js',
        'bower_components/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
        'bower_components/angular-fullscreen/src/angular-fullscreen.js',
        'bower_components/sprintf/dist/angular-sprintf.min.js',
        'bower_components/angular-prompt/dist/angular-prompt.min.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
        'bower_components/angular-ui-codemirror/ui-codemirror.min.js',
        'bower_components/angularjs-slider/dist/rzslider.min.js',
        'bower_components/angular-clipboard/angular-clipboard.js',
        'bower_components/ng-knob/dist/ng-knob.min.js',
        'bower_components/inobounce/inobounce.min.js',
        'bower_components/oclazyload/dist/ocLazyLoad.min.js',
        'bower_components/angular-ui-clock/dist/angular-clock.min.js',
        'bower_components/angular-ui-select/dist/select.min.js',
		'bower_components/angular-dynamic-locale/dist/tmhDynamicLocale.min.js',
        'bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'bower_components/snapjs/snap.min.js',
        'bower_components/angular-snap/angular-snap.min.js',
        'bower_components/event-source-polyfill/src/eventsource.min.js',
        'bower_components/d3-timeline/dist/d3-timeline.js',
        'bower_components/aCKolor/dist/js/aCKolor.min.js',
        'node_modules/n3-charts/build/LineChart.min.js',
        src + 'vendor/angular-web-colorpicker.js',
        src + 'vendor/conn.js',
		src + 'vendor/global.js'
    ])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(dst + 'vendor'));
}));

gulp.task('vendor-edit-js', gulp.series('uglify-timeline', function() {
    return gulp.src([
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-touch/angular-touch.js',
        'bower_components/d3/d3.js',
        'bower_components/sprintf/src/sprintf.js',
        'bower_components/angular-gridster/src/angular-gridster.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-fullscreen/src/angular-fullscreen.js',
        'bower_components/sprintf/src/angular-sprintf.js',
        'bower_components/angular-prompt/dist/angular-prompt.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.js',
        'bower_components/angular-ui-codemirror/ui-codemirror.js',
        'bower_components/angularjs-slider/src/rzslider.js',
        'bower_components/angular-clipboard/angular-clipboard.js',
        'bower_components/ng-knob/dist/ng-knob.js',
        'bower_components/inobounce/inobounce.js',
        'bower_components/oclazyload/dist/ocLazyLoad.js',
        'bower_components/angular-ui-clock/dist/angular-clock.js',
        'bower_components/angular-ui-select/dist/select.js',
        'bower_components/angular-file-saver/dist/angular-file-saver.bundle.js',
        'bower_components/snapjs/snap.js',
        'bower_components/angular-snap/angular-snap.js',
        'bower_components/event-source-polyfill/eventsource.js',
        'bower_components/d3-timeline/src/d3-timeline.js',
        'bower_components/aCKolor/dist/js/aCKolor.min.js',
        'node_modules/n3-charts/build/LineChart.js',
        src + 'vendor/angular-web-colorpicker.js',
        src + 'vendor/conn.js'
    ])
        .pipe(concat('vendor.edit.js'))
        .pipe(gulp.dest(dst + 'vendor'));
}));

gulp.task('codemirror-lib', function () {
    return gulp.src([
        'bower_components/codemirror/lib/codemirror.js'
    ]).pipe(uglify()).pipe(gulp.dest(dst + 'vendor/cm/lib'));
});

gulp.task('codemirror-css', function () {
    return gulp.src([
        'bower_components/codemirror/lib/codemirror.css'
    ]).pipe(gulp.dest(dst + 'vendor/cm/lib'));
});

gulp.task('codemirror-addon-fold', function () {
    return gulp.src([
        'bower_components/codemirror/addon/fold/xml-fold.js'
    ]).pipe(uglify()).pipe(gulp.dest(dst + 'vendor/cm/addon/fold'));
});

gulp.task('codemirror-addon-mode', function () {
    return gulp.src([
        'bower_components/codemirror/addon/mode/overlay.js'
    ]).pipe(uglify()).pipe(gulp.dest(dst + '/vendor/cm/addon/mode'));
});

gulp.task('codemirror-addon-edit', function () {
    return gulp.src([
        'bower_components/codemirror/addon/edit/matchbrackets.js',
        'bower_components/codemirror/addon/edit/matchtags.js',
        'bower_components/codemirror/addon/edit/closebrackets.js',
        'bower_components/codemirror/addon/edit/closetag.js',
        'bower_components/codemirror/mode/xml/xml.js'
    ]).pipe(uglify()).pipe(gulp.dest(dst + 'vendor/cm/addon/edit'));
});

gulp.task('codemirror-mode-xml', function () {
    return gulp.src([
        'bower_components/codemirror/mode/xml/xml.js'
    ]).pipe(uglify()).pipe(gulp.dest(dst + 'vendor/cm/mode/xml'));
});

gulp.task('codemirror-mode-javascript', function () {
    return gulp.src([
        'bower_components/codemirror/mode/javascript/javascript.js'
    ]).pipe(uglify()).pipe(gulp.dest(dst + 'vendor/cm/mode/javascript'));
});

gulp.task('codemirror-theme', function () {
    return gulp.src([
        'bower_components/codemirror/theme/rubyblue.css'
    ]).pipe(gulp.dest(dst + 'vendor/cm/theme'));
});

gulp.task('src-copy', function () {
    return gulp.src([
        src + 'app/**/*.*',
        '!' + src + 'app/**/*.scss',
        '!' + src + 'app/**/openhab.service.js',
        src + 'assets/**/*.*',
        '!' + src + 'assets/**/*.scss',
        src + 'fonts/**/*.*',
        src + '*.*',
        src + '!.csscomb.json',
        src + 'vendor/vendor.js',
        src + 'vendor/styles.min.css'
    ], {base: src, allowEmpty: true}).pipe(gulp.dest(dst));
});

gulp.task('codemirror', gulp.series(
        'codemirror-lib',
        'codemirror-css',
        'codemirror-addon-fold',
        'codemirror-addon-mode',
        'codemirror-addon-edit',
        'codemirror-mode-xml',
        'codemirror-mode-javascript',
        'codemirror-theme'
    ));

gulp.task('vendor', gulp.series(
    'sass-themes',
    'sass-vendor',
    'vendor-js',
//    'vendor-edit-js',
    'vendor-fonts',
    'src-copy'
));

const translate   = require('@vitalets/google-translate-api');

async function translateText(text, lang) {
	let res = await translate(text, {to: lang, from: 'en'});
	return res.text;
}

async function translateNotExisting(obj, baseText) {
	let t = obj['en'];
	if (!t)
		t = baseText;

	if (t) {
		for (let l in languages) {
			if (!obj[l]) {
				obj[l] = await translateText(t, l);
			}
		}
	}
}

gulp.task('translate', async function (done) {
	if (iopackage && iopackage.common) {
		if (iopackage.common.news) {
			for (let k in iopackage.common.news) {
				let nw = iopackage.common.news[k];
				await translateNotExisting(nw)
			}
		}
		if (iopackage.common.titleLang) {
			await translateNotExisting(iopackage.common.titleLang, iopackage.common.title)
		}
		if (iopackage.common.desc) {
			await translateNotExisting(iopackage.common.desc)
		}

		if (fs.existsSync('./admin/i18n/en/translations.json')) {
			let enTranslations = require('./admin/i18n/en/translations.json');
			for (let l in languages) {
				let existing = {};
				if (fs.existsSync(`./admin/i18n/${l}/translations.json`)) {
					existing = require(`./admin/i18n/${l}/translations.json`);
				}
				for (let t in enTranslations) {
					if (!existing[t]) {
						existing[t] = await translateText(enTranslations[t], l);
					}
				}
				if (!fs.existsSync(`./admin/i18n/${l}/`)) {
					fs.mkdirSync(`./admin/i18n/${l}/`);
				}
				fs.writeFileSync(`./admin/i18n/${l}/translations.json`, JSON.stringify(existing, null, 4));
			}
		}

	}
    fs.writeFileSync('io-package.json', JSON.stringify(iopackage, null, 4));
});

gulp.task('default', gulp.series('vendor', 'codemirror'));
