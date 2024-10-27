const webpack = require('webpack');
const webpackConfigFunc = require('./webpack.config');
const gulp = require('gulp');
const zip = require('gulp-zip');
const clean = require('gulp-clean');
const jsoncombine = require('gulp-jsoncombine');
const minimist = require('minimist');
const packageConfig = require('./package.json');
const { exit } = require('process');
const uglify = require('gulp-uglify-es').default;

// Parse options
const knownOptions = {
    string: ['browser', 'manifest']
};

const supported_browsers = ['chrome', 'firefox', 'edge', 'brave', 'opera'];
const supported_mvs = ['mv2', 'mv3'];
const brandName = 'opwallet';
const version = packageConfig.version;
const validVersion = version.split('-beta')[0];

const options = minimist(process.argv.slice(2), knownOptions);

if (!supported_browsers.includes(options.browser)) {
    console.error(`not supported browser: [${options.browser}]. It should be one of ${supported_browsers.join(', ')}.`);
    exit(0);
}
if (!supported_mvs.includes(options.manifest)) {
    console.error(`not supported browser: [${options.manifest}]. It should be one of ${supported_mvs.join(', ')}.`);
    exit(0);
}

function task_clean() {
    return gulp.src(`dist/${options.browser}/*`, { read: false }).pipe(clean());
}

function task_prepare() {
    return gulp.src('build/_raw/**/*').pipe(gulp.dest(`dist/${options.browser}`));
}

function task_merge_manifest() {
    let baseFile = '_base_v3';
    if (options.manifest == 'mv2') {
        baseFile = '_base_v2';
    }
    return gulp
        .src([
            `dist/${options.browser}/manifest/${baseFile}.json`,
            `dist/${options.browser}/manifest/${options.browser}.json`
        ])
        .pipe(
            jsoncombine('manifest.json', (data) => {
                const result = Object.assign({}, data[baseFile], data[options.browser]);
                result.version = validVersion;
                return Buffer.from(JSON.stringify(result));
            })
        )
        .pipe(gulp.dest(`dist/${options.browser}`));
}

function task_clean_tmps() {
    return gulp.src(`dist/${options.browser}/manifest`, { read: false }).pipe(clean());
}

function task_webpack(cb) {
    webpack(
        webpackConfigFunc({
            version: validVersion,
            config: 'pro',
            browser: options.browser,
            manifest: options.manifest
        }),
        cb
    );
}

function task_uglify() {
    return gulp
        .src(`dist/${options.browser}/**/*.js`)
        .pipe(
            uglify({
                compress: true,
                mangle: {
                    toplevel: true
                },
                ecma: 2023
            })
        )
        .pipe(gulp.dest(`dist/${options.browser}`));
}

function task_package() {
    return gulp
        .src(`dist/${options.browser}/**/*`)
        .pipe(zip(`${brandName}-${options.browser}-v${version}.zip`))
        .pipe(gulp.dest('./dist'));
}

exports.build = gulp.series(
    task_clean,
    task_prepare,
    task_webpack,
    task_merge_manifest,
    task_clean_tmps,
    task_uglify,
    task_package
);

exports.uglify = task_uglify;
