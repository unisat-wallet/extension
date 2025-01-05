import archiver from 'archiver';
import fs from 'fs';
import gulp from 'gulp';
import gulpClean from 'gulp-clean';
import gulpJsoncombine from 'gulp-jsoncombine';
import gulpUglify from 'gulp-uglify-es';
import minimist from 'minimist';
import path from 'path';
import webpack from 'webpack';

import { exit } from 'process';
import webpackConfigFunc from './webpack.config.js';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageConfig = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const { default: uglify } = gulpUglify;

// Parse options
const knownOptions = {
    string: ['browser', 'manifest']
};

const supported_browsers = ['chrome', 'firefox', 'edge', 'brave', 'opera'];
const supported_mvs = ['mv2', 'mv3'];

const options = minimist(process.argv.slice(2), knownOptions);
if (!supported_browsers.includes(options.browser)) {
    console.error(`not supported browser: [${options.browser}]. It should be one of ${supported_browsers.join(', ')}.`);
    exit(0);
}

if (!supported_mvs.includes(options.manifest)) {
    console.error(`not supported browser: [${options.manifest}]. It should be one of ${supported_mvs.join(', ')}.`);
    exit(0);
}

const brandName = 'opwallet';
const version = packageConfig.version;
const validVersion = version.split('-beta')[0];

export function task_clean() {
    const destDir = path.resolve(`dist/${options.browser}`); // Adjust to your destination path

    try {
        fs.mkdirSync(destDir, { recursive: true });
    } catch {}

    return gulp.src(`dist/${options.browser}/*`, { read: false }).pipe(gulpClean());
}

function copyFiles(src, dest) {
    // Ensure the destination directory exists
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read all items in the source directory
    const items = fs.readdirSync(src);

    items.forEach((item) => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);

        const stats = fs.statSync(srcPath);

        if (stats.isDirectory()) {
            // If the item is a directory, call copyFiles recursively
            copyFiles(srcPath, destPath);
        } else {
            // If the item is a file, copy it to the destination
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${srcPath} to ${destPath}`);
        }
    });
}

export async function task_prepare() {
    const sourceDir = path.resolve('build/_raw'); // Adjust to your source path
    const destDir = path.resolve(`dist/${options.browser}`); // Adjust to your destination path

    try {
        fs.mkdirSync(destDir, { recursive: true });
    } catch {}

    copyFiles(sourceDir, destDir);

    return Promise.resolve();
}

export function task_merge_manifest() {
    let baseFile = '_base_v3';
    if (options.manifest === 'mv2') {
        baseFile = '_base_v2';
    }
    return gulp
        .src([
            `dist/${options.browser}/manifest/${baseFile}.json`,
            `dist/${options.browser}/manifest/${options.browser}.json`
        ])
        .pipe(
            gulpJsoncombine('manifest.json', (data) => {
                const result = { ...data[baseFile], ...data[options.browser] };
                result.version = validVersion;
                return Buffer.from(JSON.stringify(result));
            })
        )
        .pipe(gulp.dest(`dist/${options.browser}`));
}

export function task_clean_tmps() {
    return gulp.src(`dist/${options.browser}/manifest`, { read: false }).pipe(gulpClean());
}

export function task_webpack(cb) {
    webpack(
        webpackConfigFunc({
            version: validVersion,
            config: 'pro',
            browser: options.browser,
            manifest: options.manifest
        }),
        (err, stats) => {
            if (err) {
                console.error(err);
            } else {
                console.log(stats.toString({ colors: true, modules: false, chunkModules: false }));
            }
            cb();
        }
    );
}

export function task_uglify() {
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

export async function task_package(done) {
    const outputFile = `./dist/${brandName}-${options.browser}-v${version}.zip`;
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        console.log(`Zip created: ${outputFile}`);
        done();
    });

    archive.on('error', (err) => {
        console.error(`Error while zipping: ${err}`);
        done(err);
    });

    archive.pipe(output);
    archive.directory(`dist/${options.browser}/`, false);
    await archive.finalize();
}

export const build = gulp.series(
    task_clean,
    task_prepare,
    task_webpack,
    task_merge_manifest,
    task_clean_tmps,
    task_uglify,
    task_package
);

export const uglifyTask = task_uglify;
