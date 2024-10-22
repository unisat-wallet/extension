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

//parse arguments
let knownOptions = {
    string: ['env', 'browser', 'manifest', 'channel'],
    default: {
        env: 'dev',
        browser: 'chrome',
        manifest: 'mv3',
        channel: 'store'
    }
};

let supported_envs = ['dev', 'pro'];
let supported_browsers = ['chrome', 'firefox', 'edge', 'brave'];
let supported_mvs = ['mv2', 'mv3'];
let brandName = 'opwallet';
let version = packageConfig.version;
let validVersion = version.split('-beta')[0];
let options = {
    env: knownOptions.default.env,
    browser: knownOptions.default.browser,
    manifest: knownOptions.default.manifest
};
options = minimist(process.argv.slice(2), knownOptions);
if (!supported_envs.includes(options.env)) {
    console.error(`not supported env: [${options.env}]. It should be one of ${supported_envs.join(', ')}.`);
    exit(0);
}
if (!supported_browsers.includes(options.browser)) {
    console.error(`not supported browser: [${options.browser}]. It should be one of ${supported_browsers.join(', ')}.`);
    exit(0);
}
if (!supported_mvs.includes(options.manifest)) {
    console.error(`not supported browser: [${options.manifest}]. It should be one of ${supported_mvs.join(', ')}.`);
    exit(0);
}

//tasks...
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
            config: options.env,
            browser: options.browser,
            manifest: options.manifest,
            channel: options.channel
        }),
        cb
    );
}

function task_uglify(cb) {
    if (options.env == 'pro') {
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
    cb();
}

function task_package(cb) {
    if (options.env == 'pro') {
        if (options.browser == 'firefox') {
            return gulp
                .src(`dist/${options.browser}/**/*`)
                .pipe(zip(`${brandName}-${options.browser}-${options.manifest}-v${version}.xpi`))
                .pipe(gulp.dest('./dist'));
        } else {
            return gulp
                .src(`dist/${options.browser}/**/*`)
                .pipe(zip(`${brandName}-${options.browser}-${options.manifest}-v${version}.zip`))
                .pipe(gulp.dest('./dist'));
        }
    }
    cb();
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
