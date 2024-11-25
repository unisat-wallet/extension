const path = require('path');
const fs = require('fs');
const appRoot = fs.realpathSync(process.cwd());
const rootResolve = path.resolve.bind(path, appRoot);
const buildPath = 'dist';

function getBrowserPaths(browser) {
  let ret = {
    root: appRoot,
    src: rootResolve('src'),
    indexHtml: rootResolve('build/_raw/index.html'),
    notificationHtml: rootResolve('build/_raw/notification.html'),
    backgroundHtml: rootResolve('src/background/background.html'),
    dist: rootResolve('dist/' + browser),
    rootResolve,
    dotenv: rootResolve('.env'),
    appPath: rootResolve('.'),
    appBuild: rootResolve(buildPath),
    appPublic: rootResolve('public'),
    appHtml: rootResolve('public/index.html'),
    appPackageJson: rootResolve('package.json'),
    appSrc: rootResolve('src'),
    appTsConfig: rootResolve('tsconfig.json'),
    appJsConfig: rootResolve('jsconfig.json'),
    yarnLockFile: rootResolve('yarn.lock'),
    proxySetup: rootResolve('src/setupProxy.js'),
    appNodeModules: rootResolve('node_modules'),
    appWebpackCache: rootResolve('node_modules/.cache'),
    appTsBuildInfoFile: rootResolve('node_modules/.cache/tsconfig.tsbuildinfo')
    // publicUrlOrPath,
  };
  return ret;
}

module.exports = {
  getBrowserPaths
};
