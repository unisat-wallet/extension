const webpack = require('webpack');
const webpackConfigFunc = require('./webpack.config');
const gulp = require('gulp');
const zip = require('gulp-zip');
const clean = require('gulp-clean');
const jsoncombine = require('gulp-jsoncombine');
const minimist = require('minimist');
const packageConfig = require('./package.json');
const { exit } = require('process');
const uglify = require('gulp-uglify');

// Parse arguments
const knownOptions = {
  string: ['env', 'browser', 'manifest', 'channel'],
  default: {
    env: 'dev',
    browser: 'chrome',
    manifest: 'mv3',
    channel: 'store'
  }
};

const supportedEnvs = ['dev', 'pro'];
const supportedBrowsers = ['chrome', 'firefox', 'edge', 'brave'];
const supportedMvs = ['mv2', 'mv3'];
const brandName = 'unisat';
const version = packageConfig.version;
const validVersion = version.split('-beta')[0];

let options = minimist(process.argv.slice(2), knownOptions);

// Validation
if (!supportedEnvs.includes(options.env)) {
  console.error(`Unsupported environment: [${options.env}]. Must be one of ${supportedEnvs.join(', ')}.`);
  exit(1);
}
if (!supportedBrowsers.includes(options.browser)) {
  console.error(`Unsupported browser: [${options.browser}]. Must be one of ${supportedBrowsers.join(', ')}.`);
  exit(1);
}
if (!supportedMvs.includes(options.manifest)) {
  console.error(`Unsupported manifest: [${options.manifest}]. Must be one of ${supportedMvs.join(', ')}.`);
  exit(1);
}

// Task Definitions
function cleanTask() {
  return gulp.src(`dist/${options.browser}/*`, { read: false, allowEmpty: true }).pipe(clean());
}

function prepareTask() {
  return gulp.src('build/_raw/**/*').pipe(gulp.dest(`dist/${options.browser}`));
}

function mergeManifestTask() {
  const baseFile = options.manifest === 'mv2' ? '_base_v2' : '_base_v3';
  return gulp
    .src([
      `dist/${options.browser}/manifest/${baseFile}.json`,
      `dist/${options.browser}/manifest/${options.browser}.json`
    ])
    .pipe(
      jsoncombine('manifest.json', (data) => {
        const result = { ...data[baseFile], ...data[options.browser], version: validVersion };
        return Buffer.from(JSON.stringify(result));
      })
    )
    .pipe(gulp.dest(`dist/${options.browser}`));
}

function cleanTmpTask() {
  return gulp.src(`dist/${options.browser}/manifest`, { read: false, allowEmpty: true }).pipe(clean());
}

function webpackTask(cb) {
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

function uglifyTask(cb) {
  if (options.env === 'pro') {
    return gulp
      .src(`dist/${options.browser}/**/*.js`)
      .pipe(uglify())
      .pipe(gulp.dest(`dist/${options.browser}`));
  }
  cb();
}

function packageTask(cb) {
  if (options.env === 'pro') {
    const fileType = options.browser === 'firefox' ? 'xpi' : 'zip';
    return gulp
      .src(`dist/${options.browser}/**/*`)
      .pipe(zip(`${brandName}-${options.browser}-${options.manifest}-v${version}.${fileType}`))
      .pipe(gulp.dest('./dist'));
  }
  cb();
}

// Build Sequence
exports.build = gulp.series(
  cleanTask,
  prepareTask,
  mergeManifestTask,
  cleanTmpTask,
  webpackTask,
  uglifyTask,
  packageTask
);
